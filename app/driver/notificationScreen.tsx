import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Modal,
  ActivityIndicator, Image, Platform, ScrollView, Animated,
  Easing, Dimensions, TouchableWithoutFeedback
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore, collection, query, where, doc,
  updateDoc, getDocs, setDoc, writeBatch, onSnapshot
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');
const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-s-eb857.firebasestorage.app");
const MAPS_API_KEY = "AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0";

// API Call Cache
const apiCache = new Map<string, any>();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes cache

type Delivery = {
  id: string;
  customer: string;
  address: string;
  latitude: number;
  longitude: number;
  statusId: number;
  deliveryNumber?: string;
  podImageUrl?: string | null;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

const currentLocationMarker = require("../../assets/images/van.png");
const destinationMarker = require("../../assets/images/down.png");

const NotificationScreen = () => {
  // State declarations
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [showPODModal, setShowPODModal] = useState(false);
  const [currentCompletedDelivery, setCurrentCompletedDelivery] = useState<Delivery | null>(null);
  const [podImage, setPodImage] = useState<string | null>(null);
  const [uploadingPod, setUploadingPod] = useState(false);
  const [heading, setHeading] = useState(0);
  
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const [optimizedRoute, setOptimizedRoute] = useState<Delivery[]>([]);
  const [lastApiCall, setLastApiCall] = useState<number>(0);

  // Animation effects
  useEffect(() => {
    if (showDeliveries) {
      Animated.timing(slideAnim, {
        toValue: 0, duration: 300, easing: Easing.out(Easing.exp), useNativeDriver: true
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 300, useNativeDriver: true
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height, duration: 300, easing: Easing.in(Easing.exp), useNativeDriver: true
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 300, useNativeDriver: true
      }).start();
    }
  }, [showDeliveries]);

  useEffect(() => {
    if (isModalVisible) {
      Animated.timing(modalAnim, {
        toValue: 1, duration: 300, useNativeDriver: true
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0, duration: 300, useNativeDriver: true
      }).start();
    }
  }, [isModalVisible]);

  // Notification setup
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Push notifications permission not granted');
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        setShowRedDot(true);
      });

      return () => subscription.remove();
    };

    setupNotifications();
  }, []);

  // User and shipment data
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        setPhoneNumber(storedPhoneNumber);
      } catch (error: any) {
        console.error("Failed to fetch phone number:", error.message);
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchDriverInfo = async () => {
      try {
        const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setDeliverDriver(userData.phoneNumber || null);
          setDisplayName(userData.name || "Driver");
          setProfileImage(userData.imageUrl || null);
          setCollectionName("deliverydriver");
          setId(encodeURIComponent(userData.uid));
        }
      } catch (error: any) {
        console.error("Failed to fetch driver info:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverInfo();
  }, [phoneNumber]);

  // Shipment and deliveries management
  useEffect(() => {
    if (!deliverDriver) return;
  
    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", deliverDriver),
      where("statusId", "in", [2, 3]) // StatusId 2 (assigned) or 3 (accepted)
    );
  
    const unsubscribeShipments = onSnapshot(shipmentsQuery, async (querySnapshot) => {
      if (querySnapshot.empty) {
        setShowRedDot(false);
        setIsModalVisible(false);
        setShipmentId("");
        setShipmentData(null);
        setDeliveryOrder([]);
        return;
      }
  
      const shipmentDoc = querySnapshot.docs[0];
      const shipmentData = { id: shipmentDoc.id, ...shipmentDoc.data() };
      setShipmentId(shipmentDoc.id);
      setShipmentData(shipmentData);
  
      // Properly fetch deliveries for this shipment
      const deliveriesQuery = query(collection(db, "Shipment", shipmentDoc.id, "deliveries"));
      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      
      const deliveries: Delivery[] = deliveriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customer: data.customer,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          statusId: data.statusId,
          deliveryNumber: data.deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
          podImageUrl: data.podImageUrl || null
        };
      });
  
      // Set deliveries and optimize route if accepted
      if (shipmentData.statusId === 3 && location) {
        const pendingDeliveries = deliveries.filter(d => d.statusId !== 4);
        const optimized = await optimizeDeliveryOrder(pendingDeliveries, location);
        setDeliveryOrder(optimized);
      } else {
        setDeliveryOrder(deliveries.filter(d => d.statusId !== 4));
      }
  
      // Handle newly completed deliveries
      const newlyCompleted = deliveries.find(d => 
        d.statusId === 4 && !d.podImageUrl && 
        !deliveryOrder.some(od => od.id === d.id && od.statusId === 4)
      );
      if (newlyCompleted) {
        setCurrentCompletedDelivery(newlyCompleted);
        setShowPODModal(true);
      }
  
      // Show modal for new assignments
      if (shipmentData.statusId === 2) {
        setShowRedDot(true);
        setIsModalVisible(true); // Show modal immediately for new assignments
      } else {
        setShowRedDot(false);
      }
    });
  
    return () => unsubscribeShipments();
  }, [deliverDriver, location]);

  // Location tracking
  useEffect(() => {
    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 50,
          },
          (newLocation) => {
            const newCoord = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            };
            
            // Only update if location changed significantly
            if (!location || haversineDistance(location, newCoord) > 0.05) {
              setLocation(newCoord);
            }
            
            if (newLocation.coords.heading) {
              setHeading(newLocation.coords.heading);
            }

            if (isNavigationMode && mapRef.current) {
              mapRef.current.animateCamera({
                center: newCoord,
                heading: newLocation.coords.heading || 0,
                pitch: 45,
                zoom: 17,
              });
            }
          }
        );

        return () => subscription.remove();
      } catch (error) {
        console.error("Location tracking error:", error);
      }
    };

    startLocationTracking();
  }, [isNavigationMode]);

  // Distance and route calculations
  const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
    return deliveries.sort((a, b) => {
      const distanceA = haversineDistance(currentLocation, a);
      const distanceB = haversineDistance(currentLocation, b);
      return distanceA - distanceB;
    });
  };

  const fetchDistanceMatrix = async (origins: Coordinate[], destinations: Delivery[]) => {
    const cacheKey = `matrix_${origins.map(o => `${o.latitude},${o.longitude}`).join('|')}_${
      destinations.map(d => `${d.latitude},${d.longitude}`).join('|')}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const originStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
      const destinationStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === "OK") {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
      throw new Error(data.error_message || "Failed to fetch distance matrix");
    } catch (error) {
      console.error("Distance Matrix Error:", error);
      throw error;
    }
  };

  const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
    try {
      // First try with Distance Matrix API
      const matrixResponse = await fetchDistanceMatrix([currentLocation], deliveries);
      
      const travelTimes: Record<string, Record<string, number>> = { current: {} };
      
      if (matrixResponse.rows[0]?.elements) {
        matrixResponse.rows[0].elements.forEach((element: any, index: number) => {
          travelTimes.current[deliveries[index].id] = element.status === "OK" ? 
            element.duration.value : 
            haversineDistance(currentLocation, deliveries[index]) * 200;
        });
      }

      // Sort deliveries based on travel times
      const sortedDeliveries = [...deliveries].sort((a, b) => {
        return (travelTimes.current[a.id] || Infinity) - (travelTimes.current[b.id] || Infinity);
      });

      setDeliveryOrder(sortedDeliveries);
      setOptimizedRoute(sortedDeliveries);
      return sortedDeliveries;
    } catch (error) {
      console.error("Optimization failed, using fallback:", error);
      // Fallback to simple distance sorting
      const sorted = sortDeliveriesByDistance(deliveries, currentLocation);
      setDeliveryOrder(sorted);
      setOptimizedRoute(sorted);
      return sorted;
    }
  };

  const fetchDirectionsWithCache = async (origin: Coordinate, destination: Delivery) => {
    const cacheKey = `directions_${origin.latitude},${origin.longitude}_${destination.latitude},${destination.longitude}`;
    const now = Date.now();
    
    const cached = apiCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        origin.latitude},${origin.longitude}&destination=${
        destination.latitude},${destination.longitude}&key=${MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        apiCache.set(cacheKey, { data, timestamp: now });
        return data;
      }
      throw new Error(data.error_message || "Failed to fetch directions");
    } catch (error) {
      console.error("Directions API Error:", error);
      throw error;
    }
  };

  const showRouteToDelivery = async (delivery: Delivery) => {
    if (!location || loadingDirections) return;
    
    setLoadingDirections(true);
    setSelectedDelivery(delivery);
    
    try {
      const data = await fetchDirectionsWithCache(location, delivery);
      
      if (data.status === "OK") {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);
        setTravelTime(data.routes[0].legs[0].duration.text);
        zoomToPolyline(decodedPoints);
        setIsNavigationMode(true);
      }
    } catch (error) {
      console.error("Failed to show route:", error);
      // Fallback to straight line
      setRouteCoordinates([location, delivery]);
    } finally {
      setLoadingDirections(false);
    }
  };

  const decodePolyline = (encoded: string): Coordinate[] => {
    const points: Coordinate[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const zoomToPolyline = (coordinates: Coordinate[]) => {
    if (!mapRef.current || coordinates.length === 0) return;
    
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
    
    mapRef.current.animateCamera({
      center: {
        latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      },
      heading: 0,
      pitch: 0,
      zoom: 11 - Math.max(
        Math.max(...latitudes) - Math.min(...latitudes),
        Math.max(...longitudes) - Math.min(...longitudes)
      ),
    });
  };

  const toggleDeliveryRoute = () => {
    setShowDeliveries(!showDeliveries);
  };

  const handleDeliveryTap = (delivery: Delivery) => {
    Alert.alert(
      "Confirm Delivery",
      `Navigate to ${delivery.customer}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Navigate", onPress: () => showRouteToDelivery(delivery) }
      ]
    );
  };

  const handleAccept = async () => {
    if (!shipmentId) return;
    
    try {
      // Update shipment status
      const shipmentRef = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentRef, { statusId: 3 });

      // Update all deliveries status
      const deliveriesRef = collection(shipmentRef, "deliveries");
      const snapshot = await getDocs(deliveriesRef);
      
      const batch = writeBatch(db);
      snapshot.forEach(doc => {
        batch.update(doc.ref, { statusId: 3 });
      });
      await batch.commit();

      // Optimize route once
      if (location) {
        const pendingDeliveries = snapshot.docs
          .filter(doc => doc.data().statusId !== 4)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            deliveryNumber: doc.data().deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`
          })) as Delivery[];
        
        await optimizeDeliveryOrder(pendingDeliveries, location);
      }

      setIsModalVisible(false);
      setShowRedDot(false);
    } catch (error) {
      console.error("Failed to accept shipment:", error);
      Alert.alert("Error", "Failed to accept shipment. Please try again.");
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "Please contact dispatcher for next steps");
    setIsModalVisible(false);
  };

  const takePodPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is needed for proof of delivery');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const manipulated = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        setPodImage(manipulated.uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadPod = async () => {
    if (!podImage || !currentCompletedDelivery || !shipmentId) return;
  
    setUploadingPod(true);
    try {
      const filename = `POD_${currentCompletedDelivery.deliveryNumber}_${Date.now()}.jpg`;
      const response = await fetch(podImage);
      const blob = await response.blob();
      const storageRef = ref(storage, `proof-of-delivery/${shipmentId}/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", currentCompletedDelivery.id);
      await updateDoc(deliveryRef, {
        podImageUrl: downloadURL,
        podTimestamp: new Date().toISOString()
      });
  
      setPodImage(null);
      setCurrentCompletedDelivery(null);
      setShowPODModal(false);
    } catch (error) {
      console.error('POD upload error:', error);
      Alert.alert('Error', 'Failed to upload proof of delivery');
    } finally {
      setUploadingPod(false);
    }
  };

  const recenterMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: location,
        heading: heading,
        pitch: isNavigationMode ? 45 : 0,
        zoom: isNavigationMode ? 17 : 15,
      });
    }
  };

  const toggleNavigationMode = () => {
    setIsNavigationMode(!isNavigationMode);
    recenterMap();
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingScreen}>
        <LinearGradient colors={['#F38301', '#F8A34D']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your delivery map...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setShowDeliveries(false)}>
      <View style={styles.container}>
        {/* Map View */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          customMapStyle={[
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
          ]}
          onPanDrag={() => setIsNavigationMode(false)}
        >
          <Marker 
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={heading}
            flat={isNavigationMode}
          >
            <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
              <Image
                source={currentLocationMarker}
                style={[
                  styles.markerImage,
                  isNavigationMode && { transform: [{ rotate: `${heading}deg` }] }
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </Marker>

          {showDeliveries && deliveryOrder.map((delivery) => (
            <Marker
              key={delivery.id}
              coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
              onPress={() => handleDeliveryTap(delivery)}
              anchor={{x:0.5, y:0.5}}
            >
              <Animated.View style={[
                styles.markerContainer, 
                selectedDelivery?.id === delivery.id ? styles.selectedMarker : styles.deliveryMarker
              ]}>
                <Image source={destinationMarker} style={styles.markerImage} resizeMode="contain" />
                <Text style={styles.markerText}>{delivery.customer.split(' ')[0]}</Text>
              </Animated.View>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#F38301"
              strokeWidth={6}
            />
          )}
        </MapView>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/driver/editProfile?collectionName=${collectionName}&id=${id}`)}
          >
            <Image
              source={profileImage ? { uri: profileImage } : require("../../assets/images/icon.png")}
              style={styles.profileImage}
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>Hello, {displayName}</Text>
              <Text style={styles.statusText}>On Delivery</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              setShowRedDot(false);
              if (shipmentData?.statusId === 2) setIsModalVisible(true);
            }}
          >
            <Ionicons name="notifications" size={24} color="#333" />
            {showRedDot && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleNavigationMode}
          >
            <MaterialIcons name={isNavigationMode ? "navigation" : "my-location"} size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleDeliveryRoute}
          >
            <MaterialIcons name="format-list-bulleted" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Delivery List */}
        <Animated.View 
          style={[
            styles.deliveryListContainer,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
            style={styles.deliveryListGradient}
          >
            <View style={styles.deliveryListHeader}>
              <Text style={styles.deliveryListTitle}>Delivery Route</Text>
              <TouchableOpacity onPress={() => setShowDeliveries(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.deliveryScrollView}>
              {deliveryOrder.map((delivery, index) => (
                <TouchableOpacity
                  key={delivery.id}
                  style={[
                    styles.deliveryItem,
                    selectedDelivery?.id === delivery.id && styles.selectedDeliveryItem
                  ]}
                  onPress={() => handleDeliveryTap(delivery)}
                >
                  <View style={styles.deliveryNumber}>
                    <Text style={styles.deliveryNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
                    <Text style={styles.deliveryAddress}>{delivery.address}</Text>
                    {selectedDelivery?.id === delivery.id && travelTime && (
                      <View style={styles.etaContainer}>
                        <MaterialIcons name="directions-car" size={16} color="#F38301" />
                        <Text style={styles.etaText}>{travelTime}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* Shipment Assignment Modal */}
        <Modal visible={isModalVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <Animated.View style={[styles.modalContainer, { opacity: modalAnim }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Delivery Assignment</Text>
                  <Text style={styles.modalSubtitle}>You've been assigned a new route</Text>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalInfoItem}>
                    <MaterialIcons name="confirmation-number" size={24} color="#F38301" />
                    <Text style={styles.modalInfoText}>Shipment #: {shipmentData?.id}</Text>
                  </View>
                  
                  <View style={styles.modalInfoItem}>
                    <MaterialIcons name="local-shipping" size={24} color="#F38301" />
                    <Text style={styles.modalInfoText}>{deliveryOrder.length} deliveries</Text>
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.declineButton]}
                    onPress={handleDecline}
                  >
                    <Text style={styles.modalButtonText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.acceptButton]}
                    onPress={handleAccept}
                  >
                    <Text style={styles.modalButtonText}>Accept & Start</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* POD Modal */}
        <Modal visible={showPODModal} animationType="slide">
          <View style={styles.podModalContainer}>
            <View style={styles.podModalHeader}>
              <Text style={styles.podModalTitle}>Proof of Delivery</Text>
              <Text style={styles.podModalSubtitle}>
                Delivery #{currentCompletedDelivery?.deliveryNumber}
              </Text>
            </View>

            <View style={styles.podImageContainer}>
              {podImage ? (
                <Image source={{ uri: podImage }} style={styles.podImage} />
              ) : (
                <View style={styles.podPlaceholder}>
                  <Ionicons name="camera" size={60} color="#F38301" />
                  <Text style={styles.podPlaceholderText}>No image captured</Text>
                </View>
              )}
            </View>

            <View style={styles.podButtonsContainer}>
              <TouchableOpacity
                style={[styles.podButton, styles.podCaptureButton]}
                onPress={takePodPhoto}
                disabled={uploadingPod}
              >
                <Text style={styles.podButtonText}>
                  {podImage ? 'Retake Photo' : 'Capture Photo'}
                </Text>
              </TouchableOpacity>

              {podImage && (
                <TouchableOpacity
                  style={[styles.podButton, styles.podUploadButton]}
                  onPress={uploadPod}
                  disabled={uploadingPod}
                >
                  {uploadingPod ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.podButtonText}>Upload & Complete</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.podInstructions}>
              Please capture clear photo of the delivered package at the destination.
            </Text>
          </View>
        </Modal>

        {loadingDirections && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#F38301" />
              <Text style={styles.loadingMessage}>Calculating route...</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 8,
    paddingRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#F38301',
  },
  profileTextContainer: {
    marginLeft: 10,
  },
  greetingText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  notificationButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  redDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: '#F38301',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 20,
  },
  deliveryListGradient: {
    flex: 1,
    paddingTop: 20,
  },
  deliveryListHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  deliveryScrollView: {
    flex: 1,
  },
  deliveryScrollContent: {
    paddingBottom: 30,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedDeliveryItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#F38301',
    backgroundColor: '#FFF9F2',
  },
  deliveryNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F38301',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deliveryNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryCustomer: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  etaText: {
    fontSize: 13,
    color: '#F38301',
    marginLeft: 5,
    fontWeight: '500',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarkerText: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  currentMarker: {
    width: 60,
    height: 60,
  },
  deliveryMarker: {
    width: 50,
    height: 50,
  },
  selectedMarker: {
    width: 60,
    height: 60,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerText: {
    position: 'absolute',
    bottom: -15,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(243, 131, 1, 0.3)',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#F8F8F8',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  acceptButton: {
    backgroundColor: '#F38301',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
  },
  loadingMessage: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  // POD Modal Styles
  podModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  podModalHeader: {
    marginBottom: 20,
  },
  podModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  podModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  podImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginVertical: 20,
  },
  podImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  podPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  podPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  podButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  podButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  podCaptureButton: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#F38301',
  },
  podUploadButton: {
    backgroundColor: '#F38301',
  },
  podButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F38301',
  },
  podUploadButtonText: {
    color: 'white',
  },
  podInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationScreen;