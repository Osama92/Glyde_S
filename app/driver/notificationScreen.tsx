// import React, { useEffect, useState, useRef } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, Alert, Modal,
//   ActivityIndicator, Image, Platform, ScrollView, Animated,
//   Easing, Dimensions, TouchableWithoutFeedback
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore, collection, query, where, doc,
//   updateDoc, getDocs, setDoc, writeBatch, onSnapshot
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from 'expo-location';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
// import * as ImagePicker from 'expo-image-picker';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// const { width, height } = Dimensions.get('window');
// const db = getFirestore(app);
// const storage = getStorage(app, "gs://glyde-s-eb857.firebasestorage.app");
// const MAPS_API_KEY = "AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0";

// // Enhanced Cache Implementation
// const apiCache = {
//   get: async (key: string) => {
//     try {
//       const entry = await AsyncStorage.getItem(`mapCache_${key}`);
//       if (!entry) return null;
//       const { data, timestamp } = JSON.parse(entry);
//       if (Date.now() - timestamp > CACHE_EXPIRY) {
//         await AsyncStorage.removeItem(`mapCache_${key}`);
//         return null;
//       }
//       return data;
//     } catch (error) {
//       console.error("Cache read error:", error);
//       return null;
//     }
//   },
//   set: async (key: string, data: any) => {
//     try {
//       await AsyncStorage.setItem(`mapCache_${key}`, JSON.stringify({
//         data,
//         timestamp: Date.now()
//       }));
//     } catch (error) {
//       console.error("Cache write error:", error);
//     }
//   }
// };

// // Cache expiry set to 24 hours for less volatile data
// const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// // Rate limiting implementation
// const API_CALL_INTERVAL = 5000; // 5 seconds between API calls
// let lastApiCallTime = 0;
// let apiCallCount = 0;
// const MAX_API_CALLS = 100; // Daily limit

// const makeApiCall = async (url: string) => {
//   if (apiCallCount >= MAX_API_CALLS) {
//     throw new Error("Daily API limit reached");
//   }
  
//   const now = Date.now();
//   if (now - lastApiCallTime < API_CALL_INTERVAL) {
//     await new Promise(resolve => setTimeout(resolve, API_CALL_INTERVAL - (now - lastApiCallTime)));
//   }
  
//   lastApiCallTime = Date.now();
//   apiCallCount++;
//   console.log(`API Call #${apiCallCount}: ${url.split('?')[0]}`);
  
//   const response = await fetch(url);
//   return response.json();
// };

// type Delivery = {
//   id: string;
//   customer: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   statusId: number;
//   deliveryNumber?: string;
//   podImageUrl?: string | null;
// };

// type Coordinate = {
//   latitude: number;
//   longitude: number;
// };

// const currentLocationMarker = require("../../assets/images/van.png");
// const destinationMarker = require("../../assets/images/down.png");

// const NotificationScreen = () => {
//   // State declarations
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState("");
//   const [shipmentData, setShipmentData] = useState<any>(null);
//   const [location, setLocation] = useState<Coordinate | null>(null);
//   const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
//   const [showDeliveries, setShowDeliveries] = useState(false);
//   const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
//   const [travelTime, setTravelTime] = useState<string | null>(null);
//   const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
//   const [loadingDirections, setLoadingDirections] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [collectionName, setCollectionName] = useState<string | null>(null);
//   const [id, setId] = useState<string | null>(null);
//   const [isNavigationMode, setIsNavigationMode] = useState(false);
//   const [showPODModal, setShowPODModal] = useState(false);
//   const [currentCompletedDelivery, setCurrentCompletedDelivery] = useState<Delivery | null>(null);
//   const [podImage, setPodImage] = useState<string | null>(null);
//   const [uploadingPod, setUploadingPod] = useState(false);
//   const [heading, setHeading] = useState(0);
//   const [apiLimitReached, setApiLimitReached] = useState(false);
  
//   const mapRef = useRef<MapView>(null);
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const modalAnim = useRef(new Animated.Value(0)).current;

//   // Animation effects
//   useEffect(() => {
//     if (showDeliveries) {
//       Animated.timing(slideAnim, {
//         toValue: 0, duration: 300, easing: Easing.out(Easing.exp), useNativeDriver: true
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 1, duration: 300, useNativeDriver: true
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height, duration: 300, easing: Easing.in(Easing.exp), useNativeDriver: true
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 0, duration: 300, useNativeDriver: true
//       }).start();
//     }
//   }, [showDeliveries]);

//   useEffect(() => {
//     if (isModalVisible) {
//       Animated.timing(modalAnim, {
//         toValue: 1, duration: 300, useNativeDriver: true
//       }).start();
//     } else {
//       Animated.timing(modalAnim, {
//         toValue: 0, duration: 300, useNativeDriver: true
//       }).start();
//     }
//   }, [isModalVisible]);

//   // Notification setup
//   useEffect(() => {
//     const setupNotifications = async () => {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         console.warn('Push notifications permission not granted');
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: true,
//           shouldSetBadge: true,
//         }),
//       });

//       const subscription = Notifications.addNotificationReceivedListener(notification => {
//         console.log('Notification received:', notification);
//         setShowRedDot(true);
//       });

//       return () => subscription.remove();
//     };

//     setupNotifications();
//   }, []);

//   // User and shipment data
//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       try {
//         const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//         setPhoneNumber(storedPhoneNumber);
//       } catch (error: any) {
//         console.error("Failed to fetch phone number:", error.message);
//       }
//     };
//     fetchPhoneNumber();
//   }, []);

//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchDriverInfo = async () => {
//       try {
//         const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(usersQuery);

//         if (!querySnapshot.empty) {
//           const userData = querySnapshot.docs[0].data();
//           setDeliverDriver(userData.phoneNumber || null);
//           setDisplayName(userData.name || "Driver");
//           setProfileImage(userData.imageUrl || null);
//           setCollectionName("deliverydriver");
//           setId(encodeURIComponent(userData.uid));
//         }
//       } catch (error: any) {
//         console.error("Failed to fetch driver info:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDriverInfo();
//   }, [phoneNumber]);

//   const checkAndUpdateShipmentStatus = async (shipmentId: string) => {
//     if (!shipmentId) return;
//     try {
//       const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
//       const snapshot = await getDocs(deliveriesQuery);
      
//       const allDelivered = snapshot.docs.every(doc => doc.data().statusId === 4);
      
//       if (allDelivered) {
//         const shipmentRef = doc(db, "Shipment", shipmentId);
//         await updateDoc(shipmentRef, { 
//           statusId: 4,
//           completedAt: new Date().toISOString() 
//         });
//         Alert.alert("Shipment Completed", "All deliveries have been completed!");
//       }
//     } catch (error) {
//       console.error("Error checking shipment status:", error);
//     }
//   };

//   // Shipment and deliveries management
//   useEffect(() => {
//     if (!deliverDriver) return;
  
//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", deliverDriver),
//       where("statusId", "in", [2, 3]) // StatusId 2 (assigned) or 3 (accepted)
//     );
  
//     const unsubscribeShipments = onSnapshot(shipmentsQuery, async (querySnapshot) => {
//       if (querySnapshot.empty) {
//         setShowRedDot(false);
//         setIsModalVisible(false);
//         setShipmentId("");
//         setShipmentData(null);
//         setDeliveryOrder([]);
//         return;
//       }
  
//       const shipmentDoc = querySnapshot.docs[0];
//       const shipmentData: any = { id: shipmentDoc.id, ...shipmentDoc.data() };
//       setShipmentId(shipmentDoc.id);
//       setShipmentData(shipmentData);
  
//       // Fetch deliveries for this shipment
//       const deliveriesQuery = query(collection(db, "Shipment", shipmentDoc.id, "deliveries"));
//       const deliveriesSnapshot = await getDocs(deliveriesQuery);
      
//       const deliveries: Delivery[] = deliveriesSnapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           customer: data.customer,
//           address: data.address,
//           latitude: data.coordinates?.latitude || 0,
//           longitude: data.coordinates?.longitude || 0,
//           statusId: data.statusId,
//           deliveryNumber: data.deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
//           podImageUrl: data.podImageUrl || null
//         };
//       });
  
//       // Set deliveries and optimize route if accepted
//       if (shipmentData.statusId === 3 && location) {
//         const pendingDeliveries = deliveries.filter(d => d.statusId !== 4);
//         const optimized = await optimizeDeliveryOrder(pendingDeliveries, location);
//         setDeliveryOrder(optimized);
//       } else {
//         setDeliveryOrder(deliveries.filter(d => d.statusId !== 4));
//       }
  
//       // Find newly completed deliveries (statusId=4 without POD)
//       const newlyCompleted = deliveries.find(d => 
//         d.statusId === 4 && 
//         !d.podImageUrl && 
//         // Check if this delivery wasn't already completed in our state
//         !deliveryOrder.some(delivery => delivery.id === d.id && delivery.statusId === 4)
//       );
  
//       if (newlyCompleted) {
//         setCurrentCompletedDelivery(newlyCompleted);
//         setShowPODModal(true);
        
//         // Immediately update local state to include this completed delivery
//         // so we don't show the modal again for the same delivery
//         setDeliveryOrder(prev => [...prev, newlyCompleted]);
//       }
  
//       // Show modal for new assignments
//       if (shipmentData.statusId === 2) {
//         setShowRedDot(true);
//         setIsModalVisible(true);
//       } else {
//         setShowRedDot(false);
//       }
//     });
  
//     return () => unsubscribeShipments();
//   }, [deliverDriver, location]);

//   // Location tracking
//   useEffect(() => {
//     let isMounted = true;
//     let subscription: Location.LocationSubscription | null = null;

//     const startLocationTracking = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted" || !isMounted) return;

//         // Get initial location
//         const currentLocation = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced
//         });
        
//         if (isMounted) {
//           setLocation({
//             latitude: currentLocation.coords.latitude,
//             longitude: currentLocation.coords.longitude,
//           });
//         }

//         // Only start watching if we have active deliveries
//         if (deliveryOrder.length > 0) {
//           subscription = await Location.watchPositionAsync(
//             {
//               accuracy: isNavigationMode ? Location.Accuracy.High : Location.Accuracy.Low,
//               timeInterval: isNavigationMode ? 10000 : 30000,
//               distanceInterval: isNavigationMode ? 10 : 100,
//             },
//             (newLocation) => {
//               if (!isMounted) return;
              
//               const newCoord = {
//                 latitude: newLocation.coords.latitude,
//                 longitude: newLocation.coords.longitude
//               };
              
//               // Only update if location changed significantly
//               if (!location || haversineDistance(location, newCoord) > (isNavigationMode ? 0.01 : 0.1)) {
//                 setLocation(newCoord);
//               }
              
//               if (newLocation.coords.heading) {
//                 setHeading(newLocation.coords.heading);
//               }

//               if (isNavigationMode && mapRef.current) {
//                 mapRef.current.animateCamera({
//                   center: newCoord,
//                   heading: newLocation.coords.heading || 0,
//                   pitch: 45,
//                   zoom: 17,
//                 });
//               }
//             }
//           );
//         }
//       } catch (error) {
//         console.error("Location tracking error:", error);
//       }
//     };

//     startLocationTracking();

//     return () => {
//       isMounted = false;
//       if (subscription) subscription.remove();
//     };
//   }, [isNavigationMode, deliveryOrder.length]);

//   // Utility functions
//   const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
//     const toRad = (x: number) => (x * Math.PI) / 180;
//     const R = 6371;
//     const dLat = toRad(coord2.latitude - coord1.latitude);
//     const dLon = toRad(coord2.longitude - coord1.longitude);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
//     return deliveries.sort((a, b) => {
//       const distanceA = haversineDistance(currentLocation, a);
//       const distanceB = haversineDistance(currentLocation, b);
//       return distanceA - distanceB;
//     });
//   };

//   const fetchDistanceMatrix = async (origins: Coordinate[], destinations: Delivery[]) => {
//     // First try to get complete cached result
//     const cacheKey = `matrix_${origins.map(o => `${o.latitude},${o.longitude}`).join('|')}_${
//       destinations.map(d => `${d.latitude},${d.longitude}`).join('|')}`;
    
//     const cached = await apiCache.get(cacheKey);
//     if (cached) return cached;

//     // Try to get partial cached results
//     const results: any = { rows: [] };
//     let needsApiCall = false;

//     for (const origin of origins) {
//       const row: any = { elements: [] };
      
//       for (const destination of destinations) {
//         const singleCacheKey = `matrix_single_${origin.latitude},${origin.longitude}_${
//           destination.latitude},${destination.longitude}`;
//         const cachedElement = await apiCache.get(singleCacheKey);
        
//         if (cachedElement) {
//           row.elements.push(cachedElement);
//         } else {
//           needsApiCall = true;
//           row.elements.push(null); // Placeholder
//         }
//       }
      
//       results.rows.push(row);
//     }

//     if (!needsApiCall) {
//       return results;
//     }

//     // Only make API call for missing data
//     try {
//       const originStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
//       const destinationStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');
//       const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
//         originStr}&destinations=${destinationStr}&key=${MAPS_API_KEY}`;
      
//       const data = await makeApiCall(url);
      
//       if (data.status === "OK") {
//         // Cache complete result
//         await apiCache.set(cacheKey, data);
        
//         // Cache individual elements for future use
//         data.rows.forEach((row: any, i: number) => {
//           row.elements.forEach((element: any, j: number) => {
//             if (element.status === "OK") {
//               const singleCacheKey = `matrix_single_${
//                 origins[i].latitude},${origins[i].longitude}_${
//                 destinations[j].latitude},${destinations[j].longitude}`;
//               apiCache.set(singleCacheKey, element);
//             }
//           });
//         });
        
//         return data;
//       }
//       throw new Error(data.error_message || "Failed to fetch distance matrix");
//     } catch (error: any) {
//       console.error("Distance Matrix Error:", error);
//       if (error.message.includes("limit")) {
//         setApiLimitReached(true);
//       }
//       // Fallback to Haversine distance
//       return {
//         rows: origins.map(origin => ({
//           elements: destinations.map(destination => ({
//             status: "OK",
//             distance: { value: haversineDistance(origin, destination) * 1000 },
//             duration: { value: haversineDistance(origin, destination) * 200 } // Approx 5m per km
//           }))
//         }))
//       };
//     }
//   };

//   const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
//     // First try to use cached optimized route if available
//     const cacheKey = `optimized_route_${currentLocation.latitude},${
//       currentLocation.longitude}_${deliveries.map(d => d.id).join('_')}`;
    
//     const cached = await apiCache.get(cacheKey);
//     if (cached) return cached;

//     // If less than 5 deliveries, use simple distance sort
//     if (deliveries.length <= 5) {
//       const sorted = sortDeliveriesByDistance(deliveries, currentLocation);
//       await apiCache.set(cacheKey, sorted);
//       return sorted;
//     }

//     try {
//       // Only make API call if we have enough deliveries to justify it
//       const matrixResponse = await fetchDistanceMatrix([currentLocation], deliveries);
      
//       const withTimes = deliveries.map((delivery, index) => ({
//         ...delivery,
//         travelTime: matrixResponse.rows[0]?.elements[index]?.duration?.value || 
//           haversineDistance(currentLocation, delivery) * 200
//       }));

//       const sorted = [...withTimes].sort((a, b) => a.travelTime - b.travelTime);
//       await apiCache.set(cacheKey, sorted);
//       return sorted;
//     } catch (error) {
//       console.error("Optimization failed, using fallback:", error);
//       const sorted = sortDeliveriesByDistance(deliveries, currentLocation);
//       await apiCache.set(cacheKey, sorted);
//       return sorted;
//     }
//   };

//   const fetchDirectionsWithCache = async (origin: Coordinate, destination: Delivery) => {
//     const cacheKey = `directions_${origin.latitude},${origin.longitude}_${
//       destination.latitude},${destination.longitude}`;
    
//     const cached = await apiCache.get(cacheKey);
//     if (cached) return cached;

//     try {
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
//         origin.latitude},${origin.longitude}&destination=${
//         destination.latitude},${destination.longitude}&key=${MAPS_API_KEY}`;

//       const data = await makeApiCall(url);

//       if (data.status === "OK") {
//         await apiCache.set(cacheKey, data);
//         return data;
//       }
//       throw new Error(data.error_message || "Failed to fetch directions");
//     } catch (error: any) {
//       console.error("Directions API Error:", error);
//       if (error.message.includes("limit")) {
//         setApiLimitReached(true);
//       }
//       // Fallback to straight line with estimated time
//       const distance = haversineDistance(origin, destination);
//       return {
//         status: "OK",
//         routes: [{
//           overview_polyline: {
//             points: encodePolyline([origin, destination])
//           },
//           legs: [{
//             duration: { text: `${Math.round(distance * 10)} mins`, value: distance * 600 },
//             distance: { text: `${distance.toFixed(1)} km`, value: distance * 1000 }
//           }]
//         }]
//       };
//     }
//   };

//   const encodePolyline = (points: Coordinate[]) => {
//     let encoded = '';
//     let prevLat = 0;
//     let prevLng = 0;

//     points.forEach(point => {
//       const lat = Math.round((point.latitude - prevLat) * 1e5);
//       const lng = Math.round((point.longitude - prevLng) * 1e5);
//       encoded += encodeSignedNumber(lat) + encodeSignedNumber(lng);
//       prevLat = point.latitude;
//       prevLng = point.longitude;
//     });

//     return encoded;
//   };

//   const encodeSignedNumber = (num: number) => {
//     let sgn_num = num << 1;
//     if (num < 0) sgn_num = ~sgn_num;
//     return encodeNumber(sgn_num);
//   };

//   const encodeNumber = (num: number) => {
//     let encode = '';
//     while (num >= 0x20) {
//       encode += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
//       num >>= 5;
//     }
//     encode += String.fromCharCode(num + 63);
//     return encode;
//   };

//   const decodePolyline = (encoded: string): Coordinate[] => {
//     const points: Coordinate[] = [];
//     let index = 0, lat = 0, lng = 0;

//     while (index < encoded.length) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lat += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lng += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }

//     return points;
//   };

//   const zoomToPolyline = (coordinates: Coordinate[]) => {
//     if (!mapRef.current || coordinates.length === 0) return;
    
//     const latitudes = coordinates.map(coord => coord.latitude);
//     const longitudes = coordinates.map(coord => coord.longitude);
    
//     mapRef.current.animateCamera({
//       center: {
//         latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
//         longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
//       },
//       heading: 0,
//       pitch: 0,
//       zoom: 11 - Math.max(
//         Math.max(...latitudes) - Math.min(...latitudes),
//         Math.max(...longitudes) - Math.min(...longitudes)
//       ),
//     });
//   };

//   const showRouteToDelivery = async (delivery: Delivery) => {
//     if (!location || loadingDirections) return;
    
//     setLoadingDirections(true);
//     setSelectedDelivery(delivery);
    
//     try {
//       const data = await fetchDirectionsWithCache(location, delivery);
      
//       if (data.status === "OK") {
//         const points = data.routes[0].overview_polyline.points;
//         const decodedPoints = decodePolyline(points);
//         setRouteCoordinates(decodedPoints);
//         setTravelTime(data.routes[0].legs[0].duration.text);
//         zoomToPolyline(decodedPoints);
//         setIsNavigationMode(true);
//         const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", delivery.id);
//       await updateDoc(deliveryRef, {
//         eta: eta,
//         etaUpdatedAt: new Date().toISOString()
//       });
      
//       setTravelTime(eta);
//       }
//     } catch (error: any) {
//       console.error("Failed to show route:", error);
//       Alert.alert(
//         "Limited Functionality",
//         error.message.includes("limit") 
//           ? "Map features are limited due to API quota. Using simplified navigation."
//           : "Network issue detected. Using offline mode."
//       );
//       // Fallback to straight line
//       setRouteCoordinates([location, delivery]);
//     } finally {
//       setLoadingDirections(false);
//     }
//   };

//   const toggleDeliveryRoute = () => {
//     setShowDeliveries(!showDeliveries);
//   };

//   const handleDeliveryTap = (delivery: Delivery) => {
//     Alert.alert(
//       "Confirm Delivery",
//       `Navigate to ${delivery.customer}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Navigate", onPress: () => showRouteToDelivery(delivery) }
//       ]
//     );
//   };

  

//   const handleAccept = async () => {
//     if (!shipmentId) return;
    
//     try {
//       // Update shipment status
//       const shipmentRef = doc(db, "Shipment", shipmentId);
//       await updateDoc(shipmentRef, { statusId: 3 });

//       // Update all deliveries status
//       const deliveriesRef = collection(shipmentRef, "deliveries");
//       const snapshot = await getDocs(deliveriesRef);
      
//       const batch = writeBatch(db);
//       snapshot.forEach(doc => {
//         batch.update(doc.ref, { statusId: 3 });
//       });
//       await batch.commit();

//       // Optimize route once
//       if (location) {
//         const pendingDeliveries = snapshot.docs
//           .filter(doc => doc.data().statusId !== 4)
//           .map(doc => ({
//             id: doc.id,
//             ...doc.data(),
//             deliveryNumber: doc.data().deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`
//           })) as Delivery[];
        
//         await optimizeDeliveryOrder(pendingDeliveries, location);
//       }

//       setIsModalVisible(false);
//       setShowRedDot(false);
//     } catch (error) {
//       console.error("Failed to accept shipment:", error);
//       Alert.alert("Error", "Failed to accept shipment. Please try again.");
//     }
//   };

//   const handleDecline = () => {
//     Alert.alert("Declined", "Please contact dispatcher for next steps");
//     setIsModalVisible(false);
//   };

//   const takePodPhoto = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'Camera access is needed for proof of delivery');
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets?.[0]?.uri) {
//         const manipulated = await manipulateAsync(
//           result.assets[0].uri,
//           [{ resize: { width: 800 } }],
//           { compress: 0.7, format: SaveFormat.JPEG }
//         );
//         setPodImage(manipulated.uri);
//       }
//     } catch (error) {
//       console.error('Camera error:', error);
//       Alert.alert('Error', 'Failed to take photo. Please try again.');
//     }
//   };

  

//   const uploadPod = async () => {
//     if (!podImage || !currentCompletedDelivery || !shipmentId) return;
  
//     setUploadingPod(true);
//     try {
//       const filename = `POD_${currentCompletedDelivery.deliveryNumber}_${Date.now()}.jpg`;
//       const response = await fetch(podImage);
//       const blob = await response.blob();
//       const storageRef = ref(storage, `proof-of-delivery/${shipmentId}/${filename}`);
      
//       await uploadBytes(storageRef, blob);
//       const downloadURL = await getDownloadURL(storageRef);
      
//       const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", currentCompletedDelivery.id);
//       await updateDoc(deliveryRef, {
//         podImageUrl: downloadURL,
//         podTimestamp: new Date().toISOString()
//       });
  
//       setPodImage(null);
//       setCurrentCompletedDelivery(null);
//       await checkAndUpdateShipmentStatus(shipmentId);
//       setSelectedDelivery(null);
//       setRouteCoordinates([])
//       setIsNavigationMode(false)
//       setShowPODModal(false);
//     } catch (error) {
//       console.error('POD upload error:', error);
//       Alert.alert('Error', 'Failed to upload proof of delivery');
//     } finally {
//       setUploadingPod(false);
//     }
//   };

//     useEffect(() => {
//     if (!shipmentId) return;

//     const deliveriesUnsubscribe = onSnapshot(
//       collection(db, "Shipment", shipmentId, "deliveries"),
//       (snapshot) => {
//         const updatedDeliveries = snapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             customer: data.customer || "",
//             address: data.address || "",
//             latitude: data.coordinates?.latitude || 0,
//             longitude: data.coordinates?.longitude || 0,
//             statusId: data.statusId || 0,
//             deliveryNumber: data.deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
//             podImageUrl: data.podImageUrl || null,
//           };
//         }) as Delivery[];

//         // Check for newly completed deliveries
//         const newCompleted = updatedDeliveries.find(d => 
//           d.statusId === 4 && 
//           !deliveryOrder.find(od => od.id === d.id && od.statusId === 4)
//         );

//         if (newCompleted) {
//           setCurrentCompletedDelivery(newCompleted);
//           setShowPODModal(true);
//         }
        
//         setDeliveryOrder(updatedDeliveries);
//         checkAndUpdateShipmentStatus(shipmentId);
//       }
//     );

//     return () => deliveriesUnsubscribe();
//   }, [shipmentId]);

//   const recenterMap = () => {
//     if (mapRef.current && location) {
//       mapRef.current.animateCamera({
//         center: location,
//         heading: heading,
//         pitch: isNavigationMode ? 45 : 0,
//         zoom: isNavigationMode ? 17 : 15,
//       });
//     }
//   };

//   const toggleNavigationMode = () => {
//     setIsNavigationMode(!isNavigationMode);
//     recenterMap();
//   };

//   if (loading || !location) {
//     return (
//       <View style={styles.loadingScreen}>
//         <LinearGradient colors={['#F38301', '#F8A34D']} style={styles.loadingGradient}>
//           <ActivityIndicator size="large" color="white" />
//           <Text style={styles.loadingText}>Loading your delivery map...</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <TouchableWithoutFeedback onPress={() => setShowDeliveries(false)}>
//       <View style={styles.container}>
//         {/* Map View */}
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: location.latitude,
//             longitude: location.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           customMapStyle={[
//             { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
//             { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
//           ]}
//           onPanDrag={() => setIsNavigationMode(false)}
//           maxZoomLevel={18}
//           minZoomLevel={10}
//           moveOnMarkerPress={false}
//           loadingEnabled={true}
//           loadingIndicatorColor="#F38301"
//           loadingBackgroundColor="white"
//         >
//           <Marker 
//             coordinate={location}
//             anchor={{ x: 0.5, y: 0.5 }}
//             rotation={heading}
//             flat={isNavigationMode}
//           >
//             <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
//               <Image
//                 source={currentLocationMarker}
//                 style={[
//                   styles.markerImage,
//                   isNavigationMode && { transform: [{ rotate: `${heading}deg` }] }
//                 ]}
//                 resizeMode="contain"
//               />
//             </Animated.View>
//           </Marker>

//           {showDeliveries && deliveryOrder.map((delivery) => (
//             <Marker
//               key={delivery.id}
//               coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
//               onPress={() => handleDeliveryTap(delivery)}
//               anchor={{x:0.5, y:0.5}}
//             >
//               <Animated.View style={[
//                 styles.markerContainer, 
//                 selectedDelivery?.id === delivery.id ? styles.selectedMarker : styles.deliveryMarker
//               ]}>
//                 <Image source={destinationMarker} style={styles.markerImage} resizeMode="contain" />
//                 <Text style={styles.markerText}>{delivery.customer.split(' ')[0]}</Text>
//               </Animated.View>
//             </Marker>
//           ))}

//           {routeCoordinates.length > 0 && (
//             <Polyline
//               coordinates={routeCoordinates}
//               strokeColor="#F38301"
//               strokeWidth={6}
//             />
//           )}
//         </MapView>

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.profileButton}
//             onPress={() => router.push(`/driver/editProfile?collectionName=${collectionName}&id=${id}`)}
//           >
//             <Image
//               source={profileImage ? { uri: profileImage } : require("../../assets/images/icon.png")}
//               style={styles.profileImage}
//             />
//             <View style={styles.profileTextContainer}>
//               <Text style={styles.greetingText}>Hello, {displayName}</Text>
//               <Text style={styles.statusText}>Active</Text>
//             </View>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.notificationButton}
//             onPress={() => {
//               setShowRedDot(false);
//               if (shipmentData?.statusId === 2) setIsModalVisible(true);
//             }}
//           >
//             <Ionicons name="notifications" size={24} color="#333" />
//             {showRedDot && <View style={styles.redDot} />}
//           </TouchableOpacity>
//         </View>

//         {/* Controls */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleNavigationMode}
//           >
//             <MaterialIcons name={isNavigationMode ? "navigation" : "my-location"} size={24} color="white" />
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleDeliveryRoute}
//           >
//             <MaterialIcons name="format-list-bulleted" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Delivery List */}
//         <Animated.View 
//           style={[
//             styles.deliveryListContainer,
//             { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
//           ]}
//         >
//           <LinearGradient
//             colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
//             style={styles.deliveryListGradient}
//           >
//             <View style={styles.deliveryListHeader}>
//               <Text style={styles.deliveryListTitle}>Delivery Route</Text>
//               <TouchableOpacity onPress={() => setShowDeliveries(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView style={styles.deliveryScrollView}>
//               {deliveryOrder.map((delivery, index) => (
//                 <TouchableOpacity
//                   key={delivery.id}
//                   style={[
//                     styles.deliveryItem,
//                     selectedDelivery?.id === delivery.id && styles.selectedDeliveryItem
//                   ]}
//                   onPress={() => handleDeliveryTap(delivery)}
//                 >
//                   <View style={styles.deliveryNumber}>
//                     <Text style={styles.deliveryNumberText}>{index + 1}</Text>
//                   </View>
//                   <View style={styles.deliveryInfo}>
//                     <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
//                     <Text style={styles.deliveryAddress}>{delivery.address}</Text>
//                     {selectedDelivery?.id === delivery.id && travelTime && (
//                       <View style={styles.etaContainer}>
//                         <MaterialIcons name="directions-car" size={16} color="#F38301" />
//                         <Text style={styles.etaText}>{travelTime}</Text>
//                       </View>
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </LinearGradient>
//         </Animated.View>

//         {/* Shipment Assignment Modal */}
//         <Modal visible={isModalVisible} transparent animationType="fade">
//           <View style={styles.modalBackground}>
//             <Animated.View style={[styles.modalContainer, { opacity: modalAnim }]}>
//               <View style={styles.modalContent}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>New Delivery Assignment</Text>
//                   <Text style={styles.modalSubtitle}>You've been assigned a new route</Text>
//                 </View>
                
//                 <View style={styles.modalBody}>
//                   <View style={styles.modalInfoItem}>
//                     <MaterialIcons name="confirmation-number" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>Shipment #: {shipmentData?.id}</Text>
//                   </View>
                  
//                   <View style={styles.modalInfoItem}>
//                     <MaterialIcons name="local-shipping" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>{deliveryOrder.length} deliveries</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.declineButton]}
//                     onPress={handleDecline}
//                   >
//                     <Text style={styles.modalButtonText}>Decline</Text>
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.acceptButton]}
//                     onPress={handleAccept}
//                   >
//                     <Text style={styles.modalButtonText}>Accept & Start</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Animated.View>
//           </View>
//         </Modal>

//         {/* POD Modal */}
//         <Modal visible={showPODModal} animationType="slide">
//           <View style={styles.podModalContainer}>
//             <View style={styles.podModalHeader}>
//               <Text style={styles.podModalTitle}>Proof of Delivery</Text>
//               <Text style={styles.podModalSubtitle}>
//                 Delivery #{currentCompletedDelivery?.deliveryNumber}
//               </Text>
//             </View>

//             <View style={styles.podImageContainer}>
//               {podImage ? (
//                 <Image source={{ uri: podImage }} style={styles.podImage} />
//               ) : (
//                 <View style={styles.podPlaceholder}>
//                   <Ionicons name="camera" size={60} color="#F38301" />
//                   <Text style={styles.podPlaceholderText}>No image captured</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.podButtonsContainer}>
//               <TouchableOpacity
//                 style={[styles.podButton, styles.podCaptureButton]}
//                 onPress={takePodPhoto}
//                 disabled={uploadingPod}
//               >
//                 <Text style={styles.podButtonText}>
//                   {podImage ? 'Retake Photo' : 'Capture Photo'}
//                 </Text>
//               </TouchableOpacity>

//               {podImage && (
//                 <TouchableOpacity
//                   style={[styles.podButton, styles.podUploadButton]}
//                   onPress={uploadPod}
//                   disabled={uploadingPod}
//                 >
//                   {uploadingPod ? (
//                     <ActivityIndicator color="white" />
//                   ) : (
//                     <Text style={styles.podButtonText}>Upload & Complete</Text>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>

//             <Text style={styles.podInstructions}>
//               Please capture clear photo of the delivered package at the destination.
//             </Text>
//           </View>
//         </Modal>

//         {loadingDirections && (
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#F38301" />
//               <Text style={styles.loadingMessage}>Calculating route...</Text>
//               {apiLimitReached && (
//                 <Text style={styles.apiLimitText}>Using simplified navigation due to API limits</Text>
//               )}
//             </View>
//           </View>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: 'white',
//     fontSize: 18,
//     marginTop: 20,
//     fontWeight: '500',
//   },
//   header: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   profileButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     borderRadius: 30,
//     padding: 8,
//     paddingRight: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: '#F38301',
//   },
//   profileTextContainer: {
//     marginLeft: 10,
//   },
//   greetingText: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   notificationButton: {
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   redDot: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     width: 10,
//     height: 10,
//     backgroundColor: 'red',
//     borderRadius: 5,
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 120,
//     right: 20,
//     zIndex: 10,
//   },
//   controlButton: {
//     backgroundColor: '#F38301',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   deliveryListContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: height * 0.6,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//     zIndex: 20,
//   },
//   deliveryListGradient: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   deliveryListHeader: {
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   deliveryListTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   deliveryScrollView: {
//     flex: 1,
//   },
//   deliveryScrollContent: {
//     paddingBottom: 30,
//   },
//   deliveryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: 'white',
//     marginHorizontal: 15,
//     marginVertical: 5,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   selectedDeliveryItem: {
//     borderLeftWidth: 4,
//     borderLeftColor: '#F38301',
//     backgroundColor: '#FFF9F2',
//   },
//   deliveryNumber: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#F38301',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   deliveryNumberText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   deliveryInfo: {
//     flex: 1,
//   },
//   deliveryCustomer: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#333',
//   },
//   deliveryAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 3,
//   },
//   etaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   etaText: {
//     fontSize: 13,
//     color: '#F38301',
//     marginLeft: 5,
//     fontWeight: '500',
//   },
//   markerContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   destinationMarker: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   destinationMarkerText: {
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   currentMarker: {
//     width: 60,
//     height: 60,
//   },
//   deliveryMarker: {
//     width: 50,
//     height: 50,
//   },
//   selectedMarker: {
//     width: 60,
//     height: 60,
//   },
//   markerImage: {
//     width: '100%',
//     height: '100%',
//   },
//   markerText: {
//     position: 'absolute',
//     bottom: -15,
//     fontWeight: 'bold',
//     fontSize: 12,
//     color: '#333',
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     paddingHorizontal: 5,
//     borderRadius: 3,
//   },
//   pulse: {
//     position: 'absolute',
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(243, 131, 1, 0.3)',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     padding: 20,
//     backgroundColor: '#F8F8F8',
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   modalBody: {
//     padding: 20,
//   },
//   modalInfoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   modalInfoText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 10,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   declineButton: {
//     backgroundColor: '#F8F8F8',
//     borderRightWidth: 1,
//     borderRightColor: '#EEE',
//   },
//   acceptButton: {
//     backgroundColor: '#F38301',
//   },
//   modalButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   acceptButtonText: {
//     color: 'white',
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '80%',
//     maxWidth: 300,
//   },
//   loadingMessage: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#333',
//   },
//   apiLimitText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: '#E53935',
//     textAlign: 'center',
//   },
//   podModalContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 20,
//   },
//   podModalHeader: {
//     marginBottom: 20,
//   },
//   podModalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
//   podModalSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   podImageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//     borderRadius: 10,
//     marginVertical: 20,
//   },
//   podImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   podPlaceholder: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   podPlaceholderText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   podButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   podButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   podCaptureButton: {
//     backgroundColor: '#F8F8F8',
//     borderWidth: 1,
//     borderColor: '#F38301',
//   },
//   podUploadButton: {
//     backgroundColor: '#F38301',
//   },
//   podButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   podCaptureButtonText: {
//     color: '#F38301',
//   },
//   podUploadButtonText: {
//     color: 'white',
//   },
//   podInstructions: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 10,
//   },
// });




// export default NotificationScreen;


// import React, { useEffect, useState, useRef } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, Alert, Modal,
//   ActivityIndicator, Image, Platform, ScrollView, Animated,
//   Easing, Dimensions, TouchableWithoutFeedback
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore, collection, query, where, doc,
//   updateDoc, getDocs, getDoc, writeBatch, onSnapshot
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from 'expo-location';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
// import * as ImagePicker from 'expo-image-picker';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// const { width, height } = Dimensions.get('window');
// const db = getFirestore(app);
// const storage = getStorage(app, "gs://glyde-s-eb857.firebasestorage.app");
// const MAPS_API_KEY = "AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0";

// // API Call Cache
// const apiCache = new Map<string, any>();
// const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes cache

// type Delivery = {
//   id: string;
//   customer: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   statusId: number;
//   eta?: string;
//   etaUpdatedAt?: string;
//   deliveryNumber?: string;
//   podImageUrl?: string | null;
//   coordinates?: {  // Add this to match Firebase structure
//     latitude: number;
//     longitude: number;
//   };
// };

// type Coordinate = {
//   latitude: number;
//   longitude: number;
// };

// const currentLocationMarker = require("../../assets/images/van.png");
// const destinationMarker = require("../../assets/images/down.png");

// const NotificationScreen = () => {
//   // State declarations
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState("");
//   const [shipmentData, setShipmentData] = useState<any>(null);
//   const [location, setLocation] = useState<Coordinate | null>(null);
//   const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
//   const [showDeliveries, setShowDeliveries] = useState(false);
//   const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
//   const [travelTime, setTravelTime] = useState<string | null>(null);
//   const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
//   const [loadingDirections, setLoadingDirections] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [collectionName, setCollectionName] = useState<string | null>(null);
//   const [id, setId] = useState<string | null>(null);
//   const [isNavigationMode, setIsNavigationMode] = useState(false);
//   const [showPODModal, setShowPODModal] = useState(false);
//   const [currentCompletedDelivery, setCurrentCompletedDelivery] = useState<Delivery | null>(null);
//   const [podImage, setPodImage] = useState<string | null>(null);
//   const [uploadingPod, setUploadingPod] = useState(false);
//   const [heading, setHeading] = useState(0);
//   const [completionPercentage, setCompletionPercentage] = useState(0);
//   const [isSwitchingToNavigation, setIsSwitchingToNavigation] = useState(false);
  
//   const mapRef = useRef<MapView>(null);
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const modalAnim = useRef(new Animated.Value(0)).current;
//   const [optimizedRoute, setOptimizedRoute] = useState<Delivery[]>([]);
//   const [lastApiCall, setLastApiCall] = useState<number>(0);

//   // Animation effects
//   useEffect(() => {
//     if (showDeliveries) {
//       Animated.timing(slideAnim, {
//         toValue: 0, duration: 300, easing: Easing.out(Easing.exp), useNativeDriver: true
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 1, duration: 300, useNativeDriver: true
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height, duration: 300, easing: Easing.in(Easing.exp), useNativeDriver: true
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 0, duration: 300, useNativeDriver: true
//       }).start();
//     }
//   }, [showDeliveries]);

//   useEffect(() => {
//     if (!shipmentId) return;

//     const deliveriesUnsubscribe = onSnapshot(
//       collection(db, "Shipment", shipmentId, "deliveries"),
//       (snapshot) => {
//         const updatedDeliveries = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           coordinates: doc.data().coordinates || {}
//         })) as Delivery[];

//         // Check for newly completed deliveries
//         const newCompleted = updatedDeliveries.find(d => 
//           d.statusId === 4 && 
//           !deliveryOrder.find(od => od.id === d.id && od.statusId === 4)
//         );

//         if (newCompleted) {
//           setCurrentCompletedDelivery(newCompleted);
//           setShowPODModal(true);
//         }
        
//         setDeliveryOrder(updatedDeliveries);
//         checkAndUpdateShipmentStatus();
//       }
//     );

//     return () => deliveriesUnsubscribe();
//   }, [shipmentId]);

//   useEffect(() => {
//     if (isModalVisible) {
//       Animated.timing(modalAnim, {
//         toValue: 1, duration: 300, useNativeDriver: true
//       }).start();
//     } else {
//       Animated.timing(modalAnim, {
//         toValue: 0, duration: 300, useNativeDriver: true
//       }).start();
//     }
//   }, [isModalVisible]);

//   const getDeliveryCoordinates = (delivery: Delivery) => {
//     // Try nested coordinates first, then root level as fallback
//     return {
//       latitude: delivery.coordinates?.latitude || delivery.latitude,
//       longitude: delivery.coordinates?.longitude || delivery.longitude
//     };
//   };

//   // Calculate completion percentage
//   useEffect(() => {
//     if (deliveryOrder.length > 0) {
//       const completedCount = deliveryOrder.filter(d => d.statusId === 4).length;
//       setCompletionPercentage(Math.round((completedCount / deliveryOrder.length) * 100));
//     } else {
//       setCompletionPercentage(0);
//     }
//   }, [deliveryOrder]);

//   // Check and update shipment status when all deliveries are completed
//   const checkAndUpdateShipmentStatus = async () => {
//     if (!shipmentId) return;
  
//     try {
//       const deliveriesRef = collection(db, "Shipment", shipmentId, "deliveries");
//       const snapshot = await getDocs(deliveriesRef);
      
//       const allDelivered = snapshot.docs.every(doc => doc.data().statusId === 4);
      
//       if (allDelivered) {
//         const shipmentRef = doc(db, "Shipment", shipmentId);
//         await updateDoc(shipmentRef, { 
//           statusId: 4,
//           completedAt: new Date().toISOString() 
//         });
//       }
//     } catch (error) {
//       console.error("Error updating shipment status:", error);
//       Alert.alert("Error", "Failed to update shipment status");
//     }
//   };


  // // Notification setup
  // useEffect(() => {
  //   const setupNotifications = async () => {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.warn('Push notifications permission not granted');
  //     }

  //     Notifications.setNotificationHandler({
  //       handleNotification: async () => ({
  //         shouldShowAlert: true,
  //         shouldPlaySound: true,
  //         shouldSetBadge: true,
  //       }),
  //     });

  //     const subscription = Notifications.addNotificationReceivedListener(notification => {
  //       console.log('Notification received:', notification);
  //       setShowRedDot(true);
  //     });

  //     return () => subscription.remove();
  //   };

  //   setupNotifications();
  // }, []);

  // // User and shipment data
  // useEffect(() => {
  //   const fetchPhoneNumber = async () => {
  //     try {
  //       const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
  //       setPhoneNumber(storedPhoneNumber);
  //     } catch (error: any) {
  //       console.error("Failed to fetch phone number:", error.message);
  //     }
  //   };
  //   fetchPhoneNumber();
  // }, []);

  // useEffect(() => {
  //   if (!phoneNumber) return;

  //   const fetchDriverInfo = async () => {
  //     try {
  //       const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
  //       const querySnapshot = await getDocs(usersQuery);

  //       if (!querySnapshot.empty) {
  //         const userData = querySnapshot.docs[0].data();
  //         setDeliverDriver(userData.phoneNumber || null);
  //         setDisplayName(userData.name || "Driver");
  //         setProfileImage(userData.imageUrl || null);
  //         setCollectionName("deliverydriver");
  //         setId(encodeURIComponent(userData.uid));
  //       }
  //     } catch (error: any) {
  //       console.error("Failed to fetch driver info:", error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDriverInfo();
  // }, [phoneNumber]);

//   // Shipment and deliveries management
//   useEffect(() => {
//     if (!deliverDriver) return;
  
//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", deliverDriver),
//       where("statusId", "in", [2, 3]) // StatusId 2 (assigned) or 3 (accepted)
//     );
  
//     const unsubscribeShipments = onSnapshot(shipmentsQuery, async (querySnapshot) => {
//       if (querySnapshot.empty) {
//         setShowRedDot(false);
//         setIsModalVisible(false);
//         setShipmentId("");
//         setShipmentData(null);
//         setDeliveryOrder([]);
//         return;
//       }
  
//       const shipmentDoc = querySnapshot.docs[0];
//       const shipmentData: any = { id: shipmentDoc.id, ...shipmentDoc.data() };
//       setShipmentId(shipmentDoc.id);
//       setShipmentData(shipmentData);

//       // Check if shipment is already completed
//       if (shipmentData.statusId === 4) {
//         setShowRedDot(false);
//         setIsModalVisible(false);
//         setDeliveryOrder([]);
//         return;
//       }
  
//       // Fetch deliveries for this shipment
//       const deliveriesQuery = query(collection(db, "Shipment", shipmentDoc.id, "deliveries"));
//       const deliveriesSnapshot = await getDocs(deliveriesQuery);
      
//       const deliveries: Delivery[] = deliveriesSnapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           customer: data.customer,
//           address: data.address,
//           // Get coordinates from nested object
//           latitude: data.coordinates?.latitude || 0,
//           longitude: data.coordinates?.longitude || 0,
//           statusId: data.statusId,
//           deliveryNumber: data.deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
//           podImageUrl: data.podImageUrl || null
//         };
//       }).filter(delivery => {
//         // Filter out deliveries with invalid coordinates
//         const isValid = delivery.latitude !== 0 && delivery.longitude !== 0;
//         if (!isValid) {
//           console.warn('Invalid coordinates for delivery:', delivery.id);
//         }
//         return isValid;
//       });
  
//       // Set deliveries and optimize route if accepted
//       if (shipmentData.statusId === 3 && location) {
//         const pendingDeliveries = deliveries.filter(d => d.statusId !== 4);
//         const optimized = await optimizeDeliveryOrder(pendingDeliveries, location);
//         setDeliveryOrder(optimized);
//       } else {
//         setDeliveryOrder(deliveries.filter(d => d.statusId !== 4));
//       }
  
//       // Find newly completed deliveries (statusId=4 without POD)
//       const newlyCompleted = deliveries.find(d => {
//         const wasCompleted = deliveryOrder.some(delivery => 
//           delivery.id === d.id && delivery.statusId === 4);
//         return d.statusId === 4 && !d.podImageUrl && !wasCompleted;
//       });
  
//       if (newlyCompleted) {
//         console.log("New completed delivery detected:", newlyCompleted.id);
//         setCurrentCompletedDelivery(newlyCompleted);
//         setShowPODModal(true);
        
//         // Immediately update local state
//         setDeliveryOrder(prev => prev.map(d => 
//           d.id === newlyCompleted.id ? newlyCompleted : d
//         ));
//       }
//       await checkAndUpdateShipmentStatus();
  
//       // Show modal for new assignments
//       if (shipmentData.statusId === 2) {
//         setShowRedDot(true);
//         setIsModalVisible(true);
//       } else {
//         setShowRedDot(false);
//       }
//     });
  
//     return () => unsubscribeShipments();
//   }, [deliverDriver, location]);

//   // Location tracking
//   useEffect(() => {
//     const startLocationTracking = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") return;

//         const currentLocation = await Location.getCurrentPositionAsync({});
//         setLocation({
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//         });

//         const subscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.Balanced,
//             timeInterval: 15000,
//             distanceInterval: 50,
//           },
//           (newLocation) => {
//             const newCoord = {
//               latitude: newLocation.coords.latitude,
//               longitude: newLocation.coords.longitude
//             };
            
//             // Only update if location changed significantly
//             if (!location || haversineDistance(location, newCoord) > 0.05) {
//               setLocation(newCoord);
//             }
            
//             if (newLocation.coords.heading) {
//               setHeading(newLocation.coords.heading);
//             }

//             if (isNavigationMode && mapRef.current) {
//               mapRef.current.animateCamera({
//                 center: newCoord,
//                 heading: newLocation.coords.heading || 0,
//                 pitch: 45,
//                 zoom: 17,
//               });
//             }
//           }
//         );

//         return () => subscription.remove();
//       } catch (error) {
//         console.error("Location tracking error:", error);
//       }
//     };

//     startLocationTracking();
//   }, [isNavigationMode]);

//   useEffect(() => {
//     if (selectedDelivery && location) {
//       const refreshETA = async () => {
//         try {
//           const data = await fetchDirectionsWithCache(location, selectedDelivery);
//           if (data.status === "OK") {
//             const etaText = data.routes[0].legs[0].duration.text;
//             setTravelTime(etaText);
            
//             // Update in Firestore if ETA changed significantly
//             const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", selectedDelivery.id);
//             await updateDoc(deliveryRef, {
//               eta: etaText,
//               etaUpdatedAt: new Date().toISOString()
//             });
//           }
//         } catch (error) {
//           console.error("Failed to refresh ETA:", error);
//         }
//       };
      
//       const interval = setInterval(refreshETA, 300000); // Refresh every 5 minutes
//       return () => clearInterval(interval);
//     }
//   }, [selectedDelivery, location]);

//   // Distance and route calculations
//   const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
//     const toRad = (x: number) => (x * Math.PI) / 180;
//     const R = 6371;
//     const dLat = toRad(coord2.latitude - coord1.latitude);
//     const dLon = toRad(coord2.longitude - coord1.longitude);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
//     return deliveries.sort((a, b) => {
//       const distanceA = haversineDistance(currentLocation, a);
//       const distanceB = haversineDistance(currentLocation, b);
//       return distanceA - distanceB;
//     });
//   };

//   const fetchDistanceMatrix = async (origins: Coordinate[], destinations: Delivery[]) => {
//     const cacheKey = `matrix_${origins.map(o => `${o.latitude},${o.longitude}`).join('|')}_${
//       destinations.map(d => `${d.latitude},${d.longitude}`).join('|')}`;
    
//     const cached = apiCache.get(cacheKey);
//     if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
//       return cached.data;
//     }

//     try {
//       const originStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
//       const destinationStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');
//       const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${MAPS_API_KEY}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.status === "OK") {
//         apiCache.set(cacheKey, { data, timestamp: Date.now() });
//         return data;
//       }
//       throw new Error(data.error_message || "Failed to fetch distance matrix");
//     } catch (error) {
//       console.error("Distance Matrix Error:", error);
//       throw error;
//     }
//   };

//   const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
//     try {
//       // First try with Distance Matrix API
//       const matrixResponse = await fetchDistanceMatrix([currentLocation], deliveries);
      
//       const travelTimes: Record<string, Record<string, number>> = { current: {} };
      
//       if (matrixResponse.rows[0]?.elements) {
//         matrixResponse.rows[0].elements.forEach((element: any, index: number) => {
//           travelTimes.current[deliveries[index].id] = element.status === "OK" ? 
//             element.duration.value : 
//             haversineDistance(currentLocation, deliveries[index]) * 200;
//         });
//       }

//       // Sort deliveries based on travel times
//       const sortedDeliveries = [...deliveries].sort((a, b) => {
//         return (travelTimes.current[a.id] || Infinity) - (travelTimes.current[b.id] || Infinity);
//       });

//       setDeliveryOrder(sortedDeliveries);
//       setOptimizedRoute(sortedDeliveries);
//       return sortedDeliveries;
//     } catch (error) {
//       console.error("Optimization failed, using fallback:", error);
//       // Fallback to simple distance sorting
//       const sorted = sortDeliveriesByDistance(deliveries, currentLocation);
//       setDeliveryOrder(sorted);
//       setOptimizedRoute(sorted);
//       return sorted;
//     }
//   };

//   const fetchDirectionsWithCache = async (origin: Coordinate, destination: Delivery) => {
//     const cacheKey = `directions_${origin.latitude},${origin.longitude}_${destination.latitude},${destination.longitude}`;
//     const now = Date.now();
    
//     const cached = apiCache.get(cacheKey);
//     if (cached && (now - cached.timestamp) < CACHE_EXPIRY) {
//       return cached.data;
//     }

//     try {
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
//         origin.latitude},${origin.longitude}&destination=${
//         destination.latitude},${destination.longitude}&key=${MAPS_API_KEY}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === "OK") {
//         apiCache.set(cacheKey, { data, timestamp: now });
//         return data;
//       }
//       throw new Error(data.error_message || "Failed to fetch directions");
//     } catch (error) {
//       console.error("Directions API Error:", error);
//       throw error;
//     }
//   };

//   const showRouteToDelivery = async (delivery: Delivery) => {
//     if (!location || loadingDirections) return;
    
//     setLoadingDirections(true);
//     setSelectedDelivery(delivery);
    
//     try {
//       const data = await fetchDirectionsWithCache(location, delivery);
      
//       if (data.status === "OK") {
//         const points = data.routes[0].overview_polyline.points;
//         const decodedPoints = decodePolyline(points);
//         setRouteCoordinates(decodedPoints);
//         const etaText = data.routes[0].legs[0].duration.text;
//         setTravelTime(etaText);
//         zoomToPolyline(decodedPoints);
//         setIsNavigationMode(true);
  
//         // Save ETA to Firestore
//         const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", delivery.id);
//         await updateDoc(deliveryRef, {
//           eta: etaText,
//           etaUpdatedAt: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error("Failed to show route:", error);
//       setRouteCoordinates([location, delivery]);
//     } finally {
//       setLoadingDirections(false);
//     }
//   };

//   const decodePolyline = (encoded: string): Coordinate[] => {
//     const points: Coordinate[] = [];
//     let index = 0, lat = 0, lng = 0;

//     while (index < encoded.length) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lat += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lng += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }

//     return points;
//   };

//   const zoomToPolyline = (coordinates: Coordinate[]) => {
//     if (!mapRef.current || coordinates.length === 0) return;
    
//     const latitudes = coordinates.map(coord => coord.latitude);
//     const longitudes = coordinates.map(coord => coord.longitude);
    
//     mapRef.current.animateCamera({
//       center: {
//         latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
//         longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
//       },
//       heading: 0,
//       pitch: 0,
//       zoom: 11 - Math.max(
//         Math.max(...latitudes) - Math.min(...latitudes),
//         Math.max(...longitudes) - Math.min(...longitudes)
//       ),
//     });
//   };

//   const toggleDeliveryRoute = () => {
//     setShowDeliveries(!showDeliveries);
//   };

//   const handleDeliveryTap = (delivery: Delivery) => {
//     console.log("Delivery tapped:", delivery.id); // Add this for debugging
//     if (selectedDelivery?.id === delivery.id) {
//       setSelectedDelivery(null);
//       setRouteCoordinates([]);
//       setIsNavigationMode(false);
//       return;
//     }
  
//     Alert.alert(
//       "Confirm Delivery",
//       `Navigate to ${delivery.customer}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Navigate", onPress: () => {
//           console.log("Navigate pressed for:", delivery.id); // Debug log
//           showRouteToDelivery(delivery);
//         }}
//       ]
//     );
//   };

//   const handleAccept = async () => {
//     if (!shipmentId) return;
    
//     try {
//       // Update shipment status
//       const shipmentRef = doc(db, "Shipment", shipmentId);
//       await updateDoc(shipmentRef, { statusId: 3 });

//       // Update all deliveries status
//       const deliveriesRef = collection(shipmentRef, "deliveries");
//       const snapshot = await getDocs(deliveriesRef);
      
//       const batch = writeBatch(db);
//       snapshot.forEach(doc => {
//         batch.update(doc.ref, { statusId: 3 });
//       });
//       await batch.commit();

//       // Optimize route once
//       if (location) {
//         const pendingDeliveries = snapshot.docs
//           .filter(doc => doc.data().statusId !== 4)
//           .map(doc => ({
//             id: doc.id,
//             ...doc.data(),
//             deliveryNumber: doc.data().deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`
//           })) as Delivery[];
        
//         await optimizeDeliveryOrder(pendingDeliveries, location);
//       }

//       setIsModalVisible(false);
//       setShowRedDot(false);
//     } catch (error) {
//       console.error("Failed to accept shipment:", error);
//       Alert.alert("Error", "Failed to accept shipment. Please try again.");
//     }
//   };

//   const handleDecline = () => {
//     Alert.alert("Declined", "Please contact dispatcher for next steps");
//     setIsModalVisible(false);
//   };

//   const takePodPhoto = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'Camera access is needed for proof of delivery');
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets?.[0]?.uri) {
//         const manipulated = await manipulateAsync(
//           result.assets[0].uri,
//           [{ resize: { width: 800 } }],
//           { compress: 0.7, format: SaveFormat.JPEG }
//         );
//         setPodImage(manipulated.uri);
//       }
//     } catch (error) {
//       console.error('Camera error:', error);
//       Alert.alert('Error', 'Failed to take photo. Please try again.');
//     }
//   };

//   const uploadPod = async () => {
//     if (!podImage || !currentCompletedDelivery || !shipmentId) return;
  
//     setUploadingPod(true);
//     try {
//       // Upload image to Firebase Storage
//       const filename = `POD_${currentCompletedDelivery.deliveryNumber}_${Date.now()}.jpg`;
//       const response = await fetch(podImage);
//       const blob = await response.blob();
//       const storageRef = ref(storage, `proof-of-delivery/${shipmentId}/${filename}`);
      
//       // Show upload progress
//       const uploadTask = uploadBytesResumable(storageRef, blob);
      
//       // Wait for upload to complete 34765
//       await uploadTask;
      
//       // Get download URL
//       const downloadURL = await getDownloadURL(storageRef);
  
//       // Update Firestore document
//       const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", currentCompletedDelivery.id);
//       await updateDoc(deliveryRef, {
//         podImageUrl: downloadURL,
//         statusId: 4, // Add this to mark delivery as completed
//         podTimestamp: new Date().toISOString()
//       });
  
//       // Update local state immediately
//       setDeliveryOrder(prev => prev.map(d => 
//         d.id === currentCompletedDelivery.id ? 
//         { ...d, statusId: 4, podImageUrl: downloadURL } : 
//         d
//       ));
  
//       // Show success feedback
//       Alert.alert(
//         "Success", 
//         "Proof of Delivery uploaded successfully!",
//         [{ text: "OK", onPress: () => setShowPODModal(false) }]
//       );
  
//       // Check shipment status
//       await checkAndUpdateShipmentStatus();
  
//       // Close modal and reset state
//       setPodImage(null);
//       setCurrentCompletedDelivery(null);
//       setSelectedDelivery(null);
//       setRouteCoordinates([]);
//       setIsNavigationMode(false);
//     } catch (error) {
//       console.error('POD upload error:', error);
//       Alert.alert(
//         "Upload Failed", 
//         "Could not upload proof of delivery. Please check your connection and try again."
//       );
//     } finally {
//       setUploadingPod(false);
//     }
//   };

//   const recenterMap = () => {
//     if (mapRef.current && location) {
//       mapRef.current.animateCamera({
//         center: location,
//         heading: heading,
//         pitch: isNavigationMode ? 45 : 0,
//         zoom: isNavigationMode ? 17 : 15,
//       });
//     }
//   };

//   const toggleNavigationMode = () => {
//     setIsSwitchingToNavigation(true);
//     setTimeout(() => {
//       setIsNavigationMode(!isNavigationMode);
//       recenterMap();
//       setIsSwitchingToNavigation(false);
//     }, 500);
//   };

//   const DeliveryStatusIndicator = ({ statusId }: { statusId: number }) => (
//     <View style={[
//       styles.statusIndicator,
//       statusId === 4 ? styles.statusDelivered : styles.statusPending
//     ]}>
//       <Text style={styles.statusText}>
//         {statusId === 4 ? 'Delivered' : 'Pending'}
//       </Text>
//     </View>
//   );

//   const NumberedMarker = ({ number, selected }: { number: number; selected: boolean }) => (
//     <View style={[
//       styles.numberedMarkerContainer,
//       selected && styles.selectedNumberedMarker
//     ]}>
//       <Text style={styles.markerNumber}>{number}</Text>
//     </View>
//   );

//   if (loading || !location) {
//     return (
//       <View style={styles.loadingScreen}>
//         <LinearGradient colors={['#F38301', '#F8A34D']} style={styles.loadingGradient}>
//           <ActivityIndicator size="large" color="white" />
//           <Text style={styles.loadingText}>Loading your delivery map...</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <TouchableWithoutFeedback onPress={() => setShowDeliveries(false)}>
//       <View style={styles.container}>
//         {/* Map View */}
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: location?.latitude || 0,
//             longitude: location?.longitude || 0,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           customMapStyle={[
//             { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
//             { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
//           ]}
//           onPanDrag={() => setIsNavigationMode(false)}
//           onMapReady={() => console.log('Map ready')}
//         >
//           <Marker 
//             coordinate={location}
//             anchor={{ x: 0.5, y: 0.5 }}
//             rotation={heading}
//             flat={isNavigationMode}
//           >
//             <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
//               <Image
//                 source={currentLocationMarker}
//                 style={[
//                   styles.markerImage,
//                   isNavigationMode && { transform: [{ rotate: `${heading}deg` }] }
//                 ]}
//                 resizeMode="contain"
//               />
//             </Animated.View>
//           </Marker>

//           {deliveryOrder.map((delivery, index) => {
//   const { latitude, longitude } = getDeliveryCoordinates(delivery);
//   if (!latitude || !longitude) return null;

//   return (
//     <Marker
//       key={`marker-${delivery.id}`}
//       coordinate={{ latitude, longitude }}
//       onPress={() => handleDeliveryTap(delivery)}
//     >
//       <NumberedMarker number={index + 1} selected={selectedDelivery?.id === delivery.id} />
//     </Marker>
//   );
// })}

//           {routeCoordinates.length > 0 && (
//             <Polyline
//               coordinates={routeCoordinates}
//               strokeColor="#F38301"
//               strokeWidth={6}
//             />
//           )}
//         </MapView>

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.profileButton}
//             onPress={() => router.push(`/driver/editProfile?collectionName=${collectionName}&id=${id}`)}
//           >
//             <Image
//               source={profileImage ? { uri: profileImage } : require("../../assets/images/icon.png")}
//               style={styles.profileImage}
//             />
//             <View style={styles.profileTextContainer}>
//               <Text style={styles.greetingText}>Hello, {displayName}</Text>
//               <Text style={styles.statusText}>On Delivery</Text>
//             </View>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.notificationButton}
//             onPress={() => {
//               setShowRedDot(false);
//               if (shipmentData?.statusId === 2) setIsModalVisible(true);
//             }}
//           >
//             <Ionicons name="notifications" size={24} color="#333" />
//             {showRedDot && <View style={styles.redDot} />}
//           </TouchableOpacity>
//         </View>

//         {/* Progress Bar */}
//         {deliveryOrder.length > 0 && (
//           <View style={styles.progressContainer}>
//             <Text style={styles.progressText}>
//               {completionPercentage}% Complete
//             </Text>
//             <View style={styles.progressBar}>
//               <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
//             </View>
//           </View>
//         )}

//         {/* Controls */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleNavigationMode}
//           >
//             <MaterialIcons name={isNavigationMode ? "navigation" : "my-location"} size={24} color="white" />
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleDeliveryRoute}
//           >
//             <MaterialIcons name="format-list-bulleted" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Delivery List */}
//         <Animated.View 
//           style={[
//             styles.deliveryListContainer,
//             { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
//           ]}
//         >
//           <LinearGradient
//             colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
//             style={styles.deliveryListGradient}
//           >
//             <View style={styles.deliveryListHeader}>
//               <Text style={styles.deliveryListTitle}>Delivery Route</Text>
//               <TouchableOpacity onPress={() => setShowDeliveries(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView style={styles.deliveryScrollView}>
//               {deliveryOrder.map((delivery, index) => (
//                 <TouchableOpacity
//                 key={delivery.id}
//                 style={[
//                   styles.deliveryItem,
//                   selectedDelivery?.id === delivery.id && styles.selectedDeliveryItem
//                 ]}
//                 onPress={() => handleDeliveryTap(delivery)}
//               >
//                 <View style={styles.deliveryNumber}>
//                   <Text style={styles.deliveryNumberText}>{index + 1}</Text>
//                 </View>
//                 <View style={styles.deliveryInfo}>
//                   <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
//                   <Text style={styles.deliveryAddress}>{delivery.address}</Text>
//                   {(selectedDelivery?.id === delivery.id || delivery.eta) && (
//                     <View style={styles.etaContainer}>
//                       <MaterialIcons name="directions-car" size={16} color="#F38301" />
//                       <Text style={styles.etaText}>
//                         ETA: {selectedDelivery?.id === delivery.id ? travelTime : delivery.eta}
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </LinearGradient>
//         </Animated.View>

//         {/* Shipment Assignment Modal */}
//         <Modal visible={isModalVisible} transparent animationType="fade">
//           <View style={styles.modalBackground}>
//             <Animated.View style={[styles.modalContainer, { opacity: modalAnim }]}>
//               <View style={styles.modalContent}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>New Delivery Assignment</Text>
//                   <Text style={styles.modalSubtitle}>You've been assigned a new route</Text>
//                 </View>
                
//                 <View style={styles.modalBody}>
//                   <View style={styles.modalInfoItem}>
//                     <MaterialIcons name="confirmation-number" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>Shipment #: {shipmentData?.id}</Text>
//                   </View>
                  
//                   <View style={styles.modalInfoItem}>
//                     <MaterialIcons name="local-shipping" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>{deliveryOrder.length} deliveries</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.declineButton]}
//                     onPress={handleDecline}
//                   >
//                     <Text style={styles.modalButtonText}>Decline</Text>
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.acceptButton]}
//                     onPress={handleAccept}
//                   >
//                     <Text style={[styles.modalButtonText, styles.acceptButtonText]}>Accept & Start</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Animated.View>
//           </View>
//         </Modal>

//         {/* POD Modal */}
//         <Modal visible={showPODModal} animationType="slide">
//           <View style={styles.podModalContainer}>
//             <View style={styles.podModalHeader}>
//               <Text style={styles.podModalTitle}>Proof of Delivery</Text>
//               <Text style={styles.podModalSubtitle}>
//                 Delivery #{currentCompletedDelivery?.deliveryNumber}
//               </Text>
//             </View>

//             <View style={styles.podImageContainer}>
//               {podImage ? (
//                 <Image source={{ uri: podImage }} style={styles.podImage} />
//               ) : (
//                 <View style={styles.podPlaceholder}>
//                   <Ionicons name="camera" size={60} color="#F38301" />
//                   <Text style={styles.podPlaceholderText}>No image captured</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.podButtonsContainer}>
//               <TouchableOpacity
//                 style={[styles.podButton, styles.podCaptureButton]}
//                 onPress={takePodPhoto}
//                 disabled={uploadingPod}
//               >
//                 <Text style={[styles.podButtonText, styles.podCaptureButtonText]}>
//                   {podImage ? 'Retake Photo' : 'Capture Photo'}
//                 </Text>
//               </TouchableOpacity>

//               {podImage && (
//                 <TouchableOpacity
//                   style={[styles.podButton, styles.podUploadButton]}
//                   onPress={uploadPod}
//                   disabled={uploadingPod}
//                 >
//                   {uploadingPod ? (
//                     <ActivityIndicator color="white" />
//                   ) : (
//                     <Text style={[styles.podButtonText, styles.podUploadButtonText]}>Upload & Complete</Text>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>

//             <Text style={styles.podInstructions}>
//               Please capture clear photo of the delivered package at the destination.
//             </Text>
//           </View>
//         </Modal>

//         {loadingDirections && (
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#F38301" />
//               <Text style={styles.loadingMessage}>Calculating route...</Text>
//             </View>
//           </View>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: 'white',
//     fontSize: 18,
//     marginTop: 20,
//     fontWeight: '500',
//   },
//   header: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   profileButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     borderRadius: 30,
//     padding: 8,
//     paddingRight: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: '#F38301',
//   },
//   profileTextContainer: {
//     marginLeft: 10,
//   },
//   greetingText: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   notificationButton: {
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   redDot: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     width: 10,
//     height: 10,
//     backgroundColor: 'red',
//     borderRadius: 5,
//   },
//   progressContainer: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 110 : 90,
//     left: 20,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     borderRadius: 10,
//     padding: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   progressText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#EEE',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#4CAF50',
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 120,
//     right: 20,
//     zIndex: 10,
//   },
//   controlButton: {
//     backgroundColor: '#F38301',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   deliveryListContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: height * 0.6,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//     zIndex: 20,
//   },
//   deliveryListGradient: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   deliveryListHeader: {
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   deliveryListTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   deliveryScrollView: {
//     flex: 1,
//   },
//   markerImage: {
//         width: '100%',
//         height: '100%',
//       },
//   deliveryScrollContent: {
//     paddingBottom: 30,
//   },
//   deliveryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: 'white',
//     marginHorizontal: 15,
//     marginVertical: 5,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   selectedDeliveryItem: {
//     borderLeftWidth: 4,
//     borderLeftColor: '#F38301',
//     backgroundColor: '#FFF9F2',
//   },
//   deliveryNumber: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#F38301',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   deliveryNumberText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   deliveryInfo: {
//     flex: 1,
//   },
//   deliveryCustomer: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#333',
//   },
//   deliveryAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 3,
//   },
//   etaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   etaText: {
//     fontSize: 13,
//     color: '#F38301',
//     marginLeft: 5,
//     fontWeight: '500',
//   },
//   completedContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   completedText: {
//     fontSize: 13,
//     color: '#4CAF50',
//     marginLeft: 5,
//     fontWeight: '500',
//   },
//   markerContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   currentMarker: {
//     width: 60,
//     height: 60,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 8
//   },
//   statusIndicator: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12
//   },
//   statusDelivered: {
//     backgroundColor: '#4CAF50',
//   },
//   statusPending: {
//     backgroundColor: '#FFC107',
//   },
//   numberedMarkerContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#F38301',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'white',
//   },
//   selectedNumberedMarker: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E53935',
//   },
//   markerNumber: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     padding: 20,
//     backgroundColor: '#F8F8F8',
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   modalBody: {
//     padding: 20,
//   },
//   modalInfoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   modalInfoText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 10,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   declineButton: {
//     backgroundColor: '#F8F8F8',
//     borderRightWidth: 1,
//     borderRightColor: '#EEE',
//   },
//   acceptButton: {
//     backgroundColor: '#F38301',
//   },
//   modalButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   acceptButtonText: {
//     color: 'white',
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '80%',
//     maxWidth: 300,
//   },
//   loadingMessage: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#333',
//   },
//   podModalContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 20,
//   },
//   podModalHeader: {
//     marginBottom: 20,
//   },
//   podModalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
//   podModalSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   podImageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//     borderRadius: 10,
//     marginVertical: 20,
//   },
//   podImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   podPlaceholder: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   podPlaceholderText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   podButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   podButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   podCaptureButton: {
//     backgroundColor: '#F8F8F8',
//     borderWidth: 1,
//     borderColor: '#F38301',
//   },
//   podUploadButton: {
//     backgroundColor: '#F38301',
//   },
//   podButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   podCaptureButtonText: {
//     color: '#F38301',
//   },
//   podUploadButtonText: {
//     color: 'white',
//   },
//   podInstructions: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 10,
//   },
// });

// export default NotificationScreen;


import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';

const DeliveryDriverScreen = () => {
  const chartData = [
    { value: 5, label: 'Mon' },
    { value: 8, label: 'Tue' },
    { value: 6, label: 'Wed' },
    { value: 10, label: 'Thu' },
    { value: 3, label: 'Fri' },
    { value: 7, label: 'Sat' },
    { value: 4, label: 'Sun' },
  ];

  return (
    <LinearGradient colors={['#fff', '#fff', '#fff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>👋 Welcome, James</Text>

        <View style={styles.summaryContainer}>
          <SummaryCard icon="truck" label="Pending" count={3} color="#FFA500" />
          <SummaryCard icon="progress-clock" label="In Progress" count={2} color="#1E90FF" />
          <SummaryCard icon="check-circle-outline" label="Delivered" count={10} color="#32CD32" />
        </View>

        <Text style={styles.chartTitle}>Weekly Deliveries</Text>
        <View style={styles.chartContainer}>
          <BarChart
            barWidth={30}
            noOfSections={5}
            barBorderRadius={6}
            frontColor="#61DBFB"
            data={chartData}
            yAxisThickness={0}
            xAxisColor="transparent"
            yAxisColor="transparent"
          />
        </View>
      </ScrollView>

      <View style={styles.navBar}>
        <FontAwesome5 name="home" size={24} color="#ffffff" />
        <MaterialCommunityIcons name="map-marker-radius" size={28} color="#ffffffa0" />
        <MaterialCommunityIcons name="account-circle" size={28} color="#ffffffa0" />
      </View>
    </LinearGradient>
  );
};

const SummaryCard = ({ icon, label, count, color }: { icon: string; label: string; count: number; color: string }) => {
  const Icon = MaterialCommunityIcons;
  return (
    <View style={[styles.card, { backgroundColor: color + 'dd' }]}>
      <Icon name={icon} size={28} color="#fff" />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardCount}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    marginHorizontal: 5,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 14,
  },
  cardCount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  chartContainer: {
    backgroundColor: '#ffffff10',
    padding: 16,
    borderRadius: 12,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    height: 70,
    width: '100%',
    backgroundColor: '#00000040',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backdropFilter: 'blur(10px)',
  },
});

export default DeliveryDriverScreen;
