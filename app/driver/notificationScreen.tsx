import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  onSnapshot,
  query,
  where,
  updateDoc,
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps"; // Native Maps
import { GoogleMap, LoadScript, Marker as WebMarker, Polyline as WebPolyline } from "@react-google-maps/api"; // Web Maps
import * as Location from "expo-location";


const db = getFirestore(app);
const MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w"; 

type Delivery = {
  id: string;
  customer: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

const NotificationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState<boolean>(false);
  const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
  const [showDeliveries, setShowDeliveries] = useState(false); // Toggle for showing/hiding deliveries
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]); // Polyline coordinates
  const [travelTime, setTravelTime] = useState<string | null>(null); // Travel time to destination
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null); // Selected delivery for polyline
  const [loadingDirections, setLoadingDirections] = useState(false); // Loading state for directions
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
 







  // Haversine formula to calculate distance between two coordinates
  const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.latitude)) *
        Math.cos(toRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Re-sort deliveries based on current location
  const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
    return deliveries.sort((a, b) => {
      const distanceA = haversineDistance(currentLocation, {
        latitude: a.latitude,
        longitude: a.longitude,
      });
      const distanceB = haversineDistance(currentLocation, {
        latitude: b.latitude,
        longitude: b.longitude,
      });
      return distanceA - distanceB;
    });
  };

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchDeliverDriver = async () => {

      
      try {
        const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setDeliverDriver(userData.phoneNumber || null);
          setDisplayName(userData.name || "Unknown User");
          setProfileImage(userData.imageUrl || null);
          setCollectionName("deliverydriver");
          const encodedID = encodeURIComponent(userData.uid);
          setId(encodedID);
        }
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliverDriver();
  }, [phoneNumber]);

  useEffect(() => {
    if (!deliverDriver) return;

    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", deliverDriver)
    );

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      let activeShipment: any = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.statusId === 2 || data.statusId === 3) {
          activeShipment = { id: doc.id, ...data };
        }
      });

      if (activeShipment) {
        setShipmentId(activeShipment.id);
        setShipmentData(activeShipment);
        setShowRedDot(true);
        fetchDeliveryOrder(activeShipment.id); // Fetch deliveries when shipment is found
      } else {
        setShowRedDot(false);
      }
    });

    return () => unsubscribe();
  }, [deliverDriver]);


  // Re-sort deliveries whenever location changes
  useEffect(() => {
    if (location && deliveryOrder.length > 0) {
      const sortedDeliveries = sortDeliveriesByDistance(deliveryOrder, location);
      setDeliveryOrder(sortedDeliveries);
    }
  }, [location]);

  const fetchTravelTimes = async (origin: Coordinate, destinations: Delivery[]) => {
    const travelTimes: { [key: string]: { [key: string]: number } } = {};
  
    // Add the current location as the starting point
    const allPoints = [{ id: "current", latitude: origin.latitude, longitude: origin.longitude }, ...destinations];
  
    for (const pointA of allPoints) {
      travelTimes[pointA.id] = {};
  
      for (const pointB of allPoints) {
        if (pointA.id === pointB.id) continue; // Skip if it's the same point
  
        const originStr = `${pointA.latitude},${pointA.longitude}`;
        const destinationStr = `${pointB.latitude},${pointB.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
        try {
          const response = await fetch(url);
          const data = await response.json();
  
          if (data.status === "OK") {
            const duration = data.routes[0].legs[0].duration.value; // Duration in seconds
            travelTimes[pointA.id][pointB.id] = duration;
          } else {
            console.error("Directions API Error:", data);
            travelTimes[pointA.id][pointB.id] = Infinity; // Use Infinity for unreachable points
          }
        } catch (error) {
          console.error("Fetch Travel Times Error:", error);
          travelTimes[pointA.id][pointB.id] = Infinity; // Use Infinity for errors
        }
      }
    }
  
    return travelTimes;
  };

  const solveTSP = (travelTimes: { [key: string]: { [key: string]: number } }, startId: string) => {
    const visited = new Set<string>();
    const route: string[] = [startId];
    let currentId = startId;
  
    while (visited.size < Object.keys(travelTimes).length - 1) {
      visited.add(currentId);
  
      let nextId: string | null = null;
      let minTime = Infinity;
  
      for (const pointId in travelTimes[currentId]) {
        if (!visited.has(pointId) && travelTimes[currentId][pointId] < minTime) {
          minTime = travelTimes[currentId][pointId];
          nextId = pointId;
        }
      }
  
      if (nextId) {
        route.push(nextId);
        currentId = nextId;
      } else {
        break; // No more points to visit
      }
    }
  
    return route;
  };

  const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
    let optimizedDeliveries: Delivery[] = [];
  
    try {
      const travelTimes = await fetchTravelTimes(currentLocation, deliveries);
      if (Object.keys(travelTimes).length > 0) {
        const optimalRoute = solveTSP(travelTimes, "current");
  
        // Remove the "current" point from the route
        const deliveryIds = optimalRoute.slice(1);
  
        // Sort deliveries based on the optimal route
        optimizedDeliveries = deliveryIds.map((id) =>
          deliveries.find((delivery) => delivery.id === id)
        ).filter((delivery) => delivery !== undefined) as Delivery[];
      } else {
        // Fallback to Haversine distance if travel times are not available
        Alert.alert("Info", "No internet connection. Using approximate distance for optimization.");
        optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
      }
    } catch (error) {
      console.error("Optimization Error:", error);
      // Fallback to Haversine distance if an error occurs
      Alert.alert("Info", "Failed to fetch optimized route. Using approximate distance for optimization.");
      optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
    }
  
    return optimizedDeliveries;
  };

  const fetchDeliveryOrder = async (shipmentId: string) => {
    try {
      const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
      const querySnapshot = await getDocs(deliveriesQuery);
      const deliveries: Delivery[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        customer: doc.data().customer,
        address: doc.data().address,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
      }));
  
      if (location) {
        const optimizedDeliveries = await optimizeDeliveryOrder(deliveries, location);
        setDeliveryOrder(optimizedDeliveries);
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch deliveries: ${error.message}`);
    }
  };

  const fetchETA = async (origin: Coordinate, destination: Delivery) => {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === "OK") {
        const duration = data.routes[0].legs[0].duration.text; // ETA in human-readable format
        return duration;
      } else {
        console.error("Directions API Error:", data);
        Alert.alert("Error", "Failed to fetch ETA. Please check your API key and coordinates.");
      }
    } catch (error) {
      console.error("Fetch ETA Error:", error);
      Alert.alert("Error", "Failed to fetch ETA. Please check your internet connection.");
    }
  
    return null;
  };
  
  const updateDeliveryETA = async (deliveryId: string, eta: string) => {
    try {
      const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", deliveryId);
      await updateDoc(deliveryRef, { eta });
      console.log("ETA updated successfully");
    } catch (error) {
      console.error("Update ETA Error:", error);
      Alert.alert("Error", "Failed to update ETA in Firebase.");
    }
  };

  const zoomToMarker = (delivery: Delivery) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        latitudeDelta: 0.01, // Zoom level
        longitudeDelta: 0.01,
      }, 1000); // Animation duration in milliseconds
    }
  };

  const handleDeliveryTap = async (delivery: Delivery) => {
    setSelectedDelivery(delivery);
  
    // Show confirmation dialog
    Alert.alert(
      "Confirm Delivery",
      `Do you want to deliver to ${delivery.customer}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            if (location) {
              // Fetch ETA
              const eta = await fetchETA(location, delivery);
              if (eta) {
                // Update Firebase with ETA
                await updateDeliveryETA(delivery.id, eta);
  
                // Zoom in on the selected marker
                zoomToMarker(delivery);
  
                // Start periodic ETA updates
                startPeriodicETAUpdates(delivery);
              }
            }
          },
        },
      ]
    );
  };
  const startPeriodicETAUpdates = (delivery: Delivery) => {
    const interval = setInterval(async () => {
      if (location) {
        const eta = await fetchETA(location, delivery);
        if (eta) {
          await updateDeliveryETA(delivery.id, eta);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  
    // Clear interval when the component unmounts or a new delivery is selected
    return () => clearInterval(interval);
  };

  const fetchDirections = async (origin: Coordinate, destination: Delivery) => {
    setLoadingDirections(true); // Start loading
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points); // Decode polyline points
        setRouteCoordinates(decodedPoints);

        const duration = data.routes[0].legs[0].duration.text;
        setTravelTime(duration);
      } else {
        console.error("Directions API Error:", data);
        Alert.alert("Error", "Failed to fetch directions. Please check your API key and coordinates.");
      }
    } catch (error: any) {
      console.error("Fetch Directions Error:", error);
      Alert.alert("Error", `Failed to fetch directions: ${error.message}`);
    } finally {
      setLoadingDirections(false); // Stop loading
    }
  };

  const decodePolyline = (encoded: string): Coordinate[] => {
    const points: Coordinate[] = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (Platform.OS === "web") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              Alert.alert("Error", `Failed to get location: ${error.message}`);
            }
          );
        } else {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Location permission denied.");
            Alert.alert("Error", "Permission to access location was denied.");
            return;
          }

          let currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch location: ${error.message}`);
      }
    };
    fetchLocation();
  }, []);

  const handleAccept = async () => {
    if (!shipmentId) return;
    try {
      const shipmentDocRef = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentDocRef, { statusId: 3 });
      Alert.alert("Success", "Shipment accepted.");
      setIsModalVisible(false);
      setShowRedDot(false);
      startTracking();
      fetchDeliveryOrder(shipmentId); // Refresh deliveries after accepting shipment
    } catch (error: any) {
      Alert.alert("Error", `Failed to update shipment: ${error.message}`);
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "You have declined the shipment. Please meet the field agent for clarifications.");
    setIsModalVisible(false);
  };

  const startTracking = async () => {
    setTracking(true);
    await updateCurrentLocation();
    setInterval(updateCurrentLocation, 10 * 60 * 1000); // Update every 10 minutes
  };

  const updateCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: new Date().toISOString(),
      };
      setLocation(newLocation);

      if (!shipmentId) return;

      await setDoc(doc(db, "currentLocation", shipmentId), {
        shipmentId,
        location: newLocation,
      }, { merge: true });
    } catch (error: any) {
      Alert.alert("Error", `Failed to update location: ${error.message}`);
    }
  };

  // const handleDeliveryTap = (delivery: Delivery) => {
  //   setSelectedDelivery(delivery);
  //   if (location) {
  //     fetchDirections(location, delivery); // Fetch directions to the selected delivery
  //   }
  // };

  if (loading || !location) {
    return (
      <View>
        <ActivityIndicator size="small" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-Screen Map */}
      {Platform.OS === "web" ? (
        <LoadScript googleMapsApiKey={MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={styles.map}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
          >
            <WebMarker position={{ lat: location.latitude, lng: location.longitude }} />
            {showDeliveries && deliveryOrder.map((delivery) => (
              <WebMarker
                key={delivery.id}
                position={{ lat: delivery.latitude, lng: delivery.longitude }}
                label={delivery.address}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker for destinations
                }}
              />
            ))}
            {/* Polyline for directions */}
            {routeCoordinates.length > 0 && (
              <WebPolyline
                path={routeCoordinates.map((coord) => ({ lat: coord.latitude, lng: coord.longitude }))}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} />
          {showDeliveries && deliveryOrder.map((delivery) => (
            <Marker
              key={delivery.id}
              coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
              title={delivery.address}
              pinColor="blue" // Blue marker for destinations
            />
          ))}
          {/* Polyline for directions */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FF0000"
              strokeWidth={2}
            />
          )}
        </MapView>
      )}

      {/* Show Optimized Delivery Order View and Toggle Only When Shipment is Accepted */}
      {shipmentData?.statusId === 3 && (
        <>
         
     {showDeliveries && (
  <View style={styles.deliveryListContainer}>
    {isRefreshing && (
      <ActivityIndicator size="large" color="orange" style={styles.refreshIndicator} />
    )}

    <Text style={styles.deliveryListHeader}>Optimized Delivery Order:</Text>
    <ScrollView style={styles.deliveryList}>
      {deliveryOrder.map((delivery, index) => (
        <TouchableOpacity
          key={delivery.id}
          style={styles.deliveryItem}
          onPress={() => handleDeliveryTap(delivery)}
        >
          <Text>{index + 1}. {delivery.customer} - {delivery.address}</Text>
          {selectedDelivery?.id === delivery.id && travelTime && (
            <Text style={styles.travelTimeText}>Travel Time: {travelTime}</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}
         

          {/* Show/Hide Deliveries Button */}
          <TouchableOpacity
            style={styles.showDeliveriesButton}
            onPress={() => setShowDeliveries(!showDeliveries)}
          >
            <Text style={styles.showDeliveriesButtonText}>
              {showDeliveries ? "Hide Deliveries" : "Show Deliveries"}
            </Text>
          </TouchableOpacity>
          
          {/* show location */}
          <TouchableOpacity
  style={styles.currentLocationButton}
  onPress={() => {
    if (location && mapRef.current) {
      if (Platform.OS === "web") {
        mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
        mapRef.current.setZoom(15);
      } else {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  }}
>
  <Image source={require("../../assets/images/Pin.png")} style={styles.currentLocationIcon} />
</TouchableOpacity>
        </>
      )}

      {/* Loading Indicator for Directions */}
      {loadingDirections && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="orange" />
          <Text>Loading directions...</Text>
        </View>
      )}

      {/* Notification Icon */}
      <TouchableOpacity style={styles.notificationIcon} onPress={() => shipmentId && setIsModalVisible(true)}>
        <Image source={require("../../assets/images/notifications.png")} style={{ width: 40, height: 40 }} />
        {showRedDot && <View style={styles.redDot} />}
      </TouchableOpacity>

      <View style={styles.profilearea}>
        <View style={styles.leftNav}>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      height: "50%",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={
                        profileImage
                          ? { uri: profileImage }
                          : require("../../assets/images/icon.png")
                      }
                      resizeMode="cover"
                      style={{ width: 60, height: 60, borderRadius: 30, margin: 5, borderWidth:3, borderColor:'black' }}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
                        Hi, {displayName}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/driver/editProfile?collectionName=${collectionName}&id=${id}`
                          )
                        }
                      >
                        <Text>Edit my Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                </View>
      </View>

      {/* Modal for Shipment Details */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={{marginBottom:30, fontSize: 25, textAlign:'center'}}>Shipment Number: <Text style={{ fontWeight: "bold" }}>{shipmentData?.id}</Text> has been assigned to you!</Text>
          <Text style={{marginBottom:30, fontSize: 20, textAlign:'center'}}>Route Assigned: {shipmentData?.route}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Begin Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: StyleSheet.absoluteFillObject,
  notificationIcon: { position: "absolute", top: 50, right: 20 },
  profilearea: { position: "absolute", top: 50, left: 20, width: 200 },
  redDot: { width: 10, height: 10, backgroundColor: "red", borderRadius: 5, position: "absolute", top: 0, right: 0 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  buttonContainer: { flexDirection: "row", gap: 20 },
  rejectButton: { backgroundColor: "red", width:150, height: 60, borderRadius:10, alignItems:'center', justifyContent:'center' },
  acceptButton: { backgroundColor: "green", width:150, height: 60, borderRadius:10, alignItems:'center', justifyContent:'center' },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  deliveryListContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
  showDeliveriesButton: {
    position: "absolute",
    bottom: 200,
    right: 20,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  showDeliveriesButtonText: { color: "white", fontWeight: "bold" },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
  },
  refreshIndicator: {
    alignSelf: "center",
    marginVertical: 10,
  },
  deliveryListHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  deliveryList: { maxHeight: 150 },
  deliveryItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  travelTimeText: { fontSize: 14, color: "gray", marginTop: 5 },
  leftNav: {
    width: "100%",
    height: "100%",
  },
 
  refreshButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  currentLocationIcon: {
    width: 24,
    height: 24,
  },

    })

 export default NotificationScreen;