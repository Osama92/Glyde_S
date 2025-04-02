// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   Image,
//   Platform,
//   ScrollView,
//   Animated,
//   Easing,
//   Dimensions,
//   TouchableWithoutFeedback
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   doc,
//   updateDoc,
//   getDocs,
//   setDoc,
//   writeBatch,
//   onSnapshot
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import { GoogleMap, LoadScript, Marker as WebMarker, Polyline as WebPolyline } from "@react-google-maps/api";
// import * as Location from 'expo-location';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';

// const { width, height } = Dimensions.get('window');
// const db = getFirestore(app);
// const MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

// type Delivery = {
//   id: string;
//   customer: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   statusId: number;
// };

// type Coordinate = {
//   latitude: number;
//   longitude: number;
// };

// // Custom marker images
// const currentLocationMarker = require("../../assets/images/van.png");
// const destinationMarker = require("../../assets/images/down.png");

// const NotificationScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState("");
//   const [shipmentData, setShipmentData] = useState<any>(null);
//   const [location, setLocation] = useState<Coordinate | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [tracking, setTracking] = useState<boolean>(false);
//   const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
//   const [showDeliveries, setShowDeliveries] = useState(false);
//   const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
//   const [travelTime, setTravelTime] = useState<string | null>(null);
//   const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
//   const [loadingDirections, setLoadingDirections] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [collectionName, setCollectionName] = useState<string | null>(null);
//   const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
//   const [id, setId] = useState<string | null>(null);
//   const [mapType, setMapType] = useState<'standard' | 'navigation'>('standard');
  
//   const mapRef = useRef<MapView>(null);
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Toggle delivery route view
//   const toggleDeliveryRoute = () => {
//     setShowDeliveries(!showDeliveries);
//   };

//   // Animation for showing/hiding delivery list
//   useEffect(() => {
//     if (showDeliveries) {
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.exp),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height,
//         duration: 300,
//         easing: Easing.in(Easing.exp),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [showDeliveries]);

//   useEffect(() => {
//     // Request notification permissions when screen mounts
//     const requestPermissions = async () => {
//       await Notifications.requestPermissionsAsync();
//     };
//     requestPermissions();

//     // Listen for notifications when app is foregrounded
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       console.log('Notification received:', notification);
//       // You can update UI state here if needed
//     });

//     return () => subscription.remove();
//   }, []);

//   // Fetch phone number from storage
//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       try {
//         const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!storedPhoneNumber) {
//           Alert.alert("Error", "No phone number found. Please log in again.");
//           return;
//         }
//         setPhoneNumber(storedPhoneNumber);
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
//       }
//     };
//     fetchPhoneNumber();
//   }, []);

//   // Fetch driver info when phone number is available
//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchDeliverDriver = async () => {
//       try {
//         const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(usersQuery);

//         if (!querySnapshot.empty) {
//           const userData = querySnapshot.docs[0].data();
//           setDeliverDriver(userData.phoneNumber || null);
//           setDisplayName(userData.name || "Unknown User");
//           setProfileImage(userData.imageUrl || null);
//           setCollectionName("deliverydriver");
//           const encodedID = encodeURIComponent(userData.uid);
//           setId(encodedID);
//         }
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDeliverDriver();
//   }, [phoneNumber]);

//   // Watch for shipment assignments
//   useEffect(() => {
//     if (!deliverDriver) return;

//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", deliverDriver)
//     );

//     const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
//       let activeShipment: any = null;

//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.statusId === 2 || data.statusId === 3) {
//           activeShipment = { id: doc.id, ...data };
//         }
//       });

//       if (activeShipment) {
//         setShipmentId(activeShipment.id);
//         setShipmentData(activeShipment);
//         setShowRedDot(true);
//       } else {
//         setShowRedDot(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [deliverDriver]);

//   // Re-sort deliveries when location changes
//   useEffect(() => {
//     if (location && deliveryOrder.length > 0) {
//       optimizeDeliveryOrder(deliveryOrder, location);
//     }
//   }, [location]);

//   // Fetch and optimize deliveries when shipment changes
//   useEffect(() => {
//     if (!shipmentId) return;

//     const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
//     const unsubscribeDeliveries = onSnapshot(deliveriesQuery, async (querySnapshot) => {
//       const deliveries: Delivery[] = querySnapshot.docs
//         .map((doc) => ({
//           id: doc.id,
//           customer: doc.data().customer,
//           address: doc.data().address,
//           latitude: doc.data().latitude,
//           longitude: doc.data().longitude,
//           statusId: doc.data().statusId,
//         }))
//         .filter((delivery) => delivery.statusId !== 4); // Filter out completed deliveries

//       if (location) {
//         const optimizedDeliveries = await optimizeDeliveryOrder(deliveries, location);
//         setDeliveryOrder(optimizedDeliveries);
//       }

//       // If all deliveries are completed, update shipment statusId to 4
//       if (deliveries.length === 0) {
//         updateDoc(doc(db, "Shipment", shipmentId), { statusId: 4 });
//       }
//     });

//     return () => unsubscribeDeliveries();
//   }, [shipmentId, location]);

//   // Location tracking setup
//   useEffect(() => {
//     const startLocationTracking = async () => {
//       try {
//         // Request location permissions
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Error", "Permission to access location was denied.");
//           return;
//         }

//         // Get initial location
//         let currentLocation = await Location.getCurrentPositionAsync({});
//         setLocation({
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//         });

//         // Start watching the user's location
//         const subscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 5000,
//             distanceInterval: 10,
//           },
//           (newLocation) => {
//             setLocation({
//               latitude: newLocation.coords.latitude,
//               longitude: newLocation.coords.longitude,
//             });
//           }
//         );

//         setLocationSubscription(subscription);
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to start location tracking: ${error.message}`);
//       }
//     };

//     startLocationTracking();

//     return () => {
//       if (locationSubscription) {
//         locationSubscription.remove();
//       }
//     };
//   }, []);

//   // Update driver location in Firebase
//   useEffect(() => {
//     const updateDriverLocation = async () => {
//       if (!phoneNumber || !location) return;

//       try {
//         const driversQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(driversQuery);

//         if (!querySnapshot.empty) {
//           const driverDoc = querySnapshot.docs[0];
//           const driverRef = doc(db, "deliverydriver", driverDoc.id);

//           await updateDoc(driverRef, {
//             Latitude: location.latitude,
//             Longitude: location.longitude,
//           });
//         }
//       } catch (error: any) {
//         console.error("Failed to update location in Firebase:", error.message);
//       }
//     };

//     updateDriverLocation();
//   }, [location, phoneNumber]);

//   // Haversine distance calculation
//   const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
//     const toRad = (x: number) => (x * Math.PI) / 180;
//     const R = 6371; // Earth's radius in km
//     const dLat = toRad(coord2.latitude - coord1.latitude);
//     const dLon = toRad(coord2.longitude - coord1.longitude);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(coord1.latitude)) *
//         Math.cos(toRad(coord2.latitude)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Distance in km
//   };

//   // Sort deliveries by distance (fallback)
//   const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
//     return deliveries.sort((a, b) => {
//       const distanceA = haversineDistance(currentLocation, {
//         latitude: a.latitude,
//         longitude: a.longitude,
//       });
//       const distanceB = haversineDistance(currentLocation, {
//         latitude: b.latitude,
//         longitude: b.longitude,
//       });
//       return distanceA - distanceB;
//     });
//   };

//   // Fetch travel times between points
//   const fetchTravelTimes = async (origin: Coordinate, destinations: Delivery[]) => {
//     const travelTimes: { [key: string]: { [key: string]: number } } = {};
  
//     // Add current location as starting point
//     const allPoints = [{ id: "current", latitude: origin.latitude, longitude: origin.longitude }, ...destinations];
  
//     for (const pointA of allPoints) {
//       travelTimes[pointA.id] = {};
  
//       for (const pointB of allPoints) {
//         if (pointA.id === pointB.id) continue;
  
//         const originStr = `${pointA.latitude},${pointA.longitude}`;
//         const destinationStr = `${pointB.latitude},${pointB.longitude}`;
//         const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
//         try {
//           const response = await fetch(url);
//           const data = await response.json();
  
//           if (data.status === "OK") {
//             const duration = data.routes[0].legs[0].duration.value;
//             travelTimes[pointA.id][pointB.id] = duration;
//           } else {
//             console.error("Directions API Error:", data);
//             travelTimes[pointA.id][pointB.id] = Infinity;
//           }
//         } catch (error) {
//           console.error("Fetch Travel Times Error:", error);
//           travelTimes[pointA.id][pointB.id] = Infinity;
//         }
//       }
//     }
  
//     return travelTimes;
//   };

//   // Solve Traveling Salesman Problem (nearest neighbor)
//   const solveTSP = (travelTimes: { [key: string]: { [key: string]: number } }, startId: string) => {
//     const visited = new Set<string>();
//     const route: string[] = [startId];
//     let currentId = startId;
  
//     while (visited.size < Object.keys(travelTimes).length - 1) {
//       visited.add(currentId);
  
//       let nextId: string | null = null;
//       let minTime = Infinity;
  
//       for (const pointId in travelTimes[currentId]) {
//         if (!visited.has(pointId) && travelTimes[currentId][pointId] < minTime) {
//           minTime = travelTimes[currentId][pointId];
//           nextId = pointId;
//         }
//       }
  
//       if (nextId) {
//         route.push(nextId);
//         currentId = nextId;
//       } else {
//         break;
//       }
//     }
  
//     return route;
//   };

//   // Optimize delivery order using Google Maps API
//   const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
//     let optimizedDeliveries: Delivery[] = [];
  
//     try {
//       const travelTimes = await fetchTravelTimes(currentLocation, deliveries);
//       if (Object.keys(travelTimes).length > 0) {
//         const optimalRoute = solveTSP(travelTimes, "current");
  
//         // Remove the "current" point from the route
//         const deliveryIds = optimalRoute.slice(1);
  
//         // Sort deliveries based on the optimal route
//         optimizedDeliveries = deliveryIds.map((id) =>
//           deliveries.find((delivery) => delivery.id === id)
//         ).filter((delivery) => delivery !== undefined) as Delivery[];
//       } else {
//         // Fallback to Haversine distance if travel times are not available
//         Alert.alert("Info", "No internet connection. Using approximate distance for optimization.");
//         optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
//       }
//     } catch (error) {
//       console.error("Optimization Error:", error);
//       // Fallback to Haversine distance if an error occurs
//       Alert.alert("Info", "Failed to fetch optimized route. Using approximate distance for optimization.");
//       optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
//     }
  
//     return optimizedDeliveries;
//   };

//   // Fetch ETA for a delivery
//   const fetchETA = async (origin: Coordinate, destination: Delivery) => {
//     const originStr = `${origin.latitude},${origin.longitude}`;
//     const destinationStr = `${destination.latitude},${destination.longitude}`;
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
//     try {
//       const response = await fetch(url);
//       const data = await response.json();
  
//       if (data.status === "OK") {
//         const duration = data.routes[0].legs[0].duration.text;
//         return duration;
//       } else {
//         console.error("Directions API Error:", data);
//         Alert.alert("Error", "Failed to fetch ETA. Please check your API key and coordinates.");
//       }
//     } catch (error) {
//       console.error("Fetch ETA Error:", error);
//       Alert.alert("Error", "Failed to fetch ETA. Please check your internet connection.");
//     }
  
//     return null;
//   };

//   // Update delivery ETA in Firebase
//   const updateDeliveryETA = async (deliveryId: string, eta: string) => {
//     try {
//       const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", deliveryId);
//       await updateDoc(deliveryRef, { eta });
//     } catch (error) {
//       console.error("Update ETA Error:", error);
//     }
//   };

//   // Fetch directions between two points
//   const fetchDirections = async (origin: Coordinate, destination: Delivery) => {
//     setLoadingDirections(true);
//     const originStr = `${origin.latitude},${origin.longitude}`;
//     const destinationStr = `${destination.latitude},${destination.longitude}`;
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === "OK") {
//         const points = data.routes[0].overview_polyline.points;
//         const decodedPoints = decodePolyline(points);
//         setRouteCoordinates(decodedPoints);

//         const duration = data.routes[0].legs[0].duration.text;
//         setTravelTime(duration);
//         zoomToPolyline(decodedPoints);
//         setMapType('navigation'); // Switch to navigation view
//       } else {
//         console.error("Directions API Error:", data);
//         Alert.alert("Error", "Failed to fetch directions. Please check your API key and coordinates.");
//       }
//     } catch (error: any) {
//       console.error("Fetch Directions Error:", error);
//       Alert.alert("Error", `Failed to fetch directions: ${error.message}`);
//     } finally {
//       setLoadingDirections(false);
//     }
//   };

//   // Decode polyline points
//   const decodePolyline = (encoded: string): Coordinate[] => {
//     const points: Coordinate[] = [];
//     let index = 0,
//       len = encoded.length;
//     let lat = 0,
//       lng = 0;

//     while (index < len) {
//       let b,
//         shift = 0,
//         result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
//       lng += dlng;

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }

//     return points;
//   };

//   // Zoom to a specific marker
//   const zoomToMarker = (delivery: Delivery) => {
//     if (mapRef.current) {
//       mapRef.current.animateToRegion({
//         latitude: delivery.latitude,
//         longitude: delivery.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }, 1000);
//     }
//   };

//   // Zoom to show the entire polyline
//   const zoomToPolyline = (coordinates: Coordinate[]) => {
//     if (mapRef.current && coordinates.length > 0) {
//       const latitudes = coordinates.map((coord) => coord.latitude);
//       const longitudes = coordinates.map((coord) => coord.longitude);
  
//       const minLat = Math.min(...latitudes);
//       const maxLat = Math.max(...latitudes);
//       const minLng = Math.min(...longitudes);
//       const maxLng = Math.max(...longitudes);
  
//       mapRef.current.animateToRegion(
//         {
//           latitude: (minLat + maxLat) / 2,
//           longitude: (minLng + maxLng) / 2,
//           latitudeDelta: maxLat - minLat + 0.1,
//           longitudeDelta: maxLng - minLng + 0.1,
//         },
//         1000
//       );
//     }
//   };

//   // Handle delivery selection
//   const handleDeliveryTap = async (delivery: Delivery) => {
//     setSelectedDelivery(delivery);
  
//     Alert.alert(
//       "Confirm Delivery",
//       `Do you want to deliver to ${delivery.customer}?`,
//       [
//         {
//           text: "No",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             if (location) {
//               const eta = await fetchETA(location, delivery);
//               if (eta) {
//                 await updateDeliveryETA(delivery.id, eta);
//                 zoomToMarker(delivery);
//                 fetchDirections(location, delivery);
//                 startPeriodicETAUpdates(delivery);
//               }
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Start periodic ETA updates
//   const startPeriodicETAUpdates = (delivery: Delivery) => {
//     const interval = setInterval(async () => {
//       if (location) {
//         const eta = await fetchETA(location, delivery);
//         if (eta) {
//           await updateDeliveryETA(delivery.id, eta);
//         }
//       }
//     }, 5 * 60 * 1000); // 5 minutes
  
//     return () => clearInterval(interval);
//   };

//   // Handle shipment acceptance
//   const handleAccept = async () => {
//     if (!shipmentId) return;
//     try {
//       const shipmentDocRef = doc(db, "Shipment", shipmentId);
  
//       // Update shipment statusId to 3
//       await updateDoc(shipmentDocRef, { statusId: 3 });
  
//       // Fetch all deliveries in the subcollection
//       const deliveriesCollectionRef = collection(shipmentDocRef, "deliveries");
//       const deliveriesSnapshot = await getDocs(deliveriesCollectionRef);
  
//       // Update statusId of each delivery to 3
//       const batch = writeBatch(db);
//       deliveriesSnapshot.forEach((doc) => {
//         batch.update(doc.ref, { statusId: 3 });
//       });
//       await batch.commit();
  
//       Alert.alert("Success", "Shipment and deliveries accepted.");
//       setIsModalVisible(false);
//       setShowRedDot(false);
//       startTracking();
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to update shipment: ${error.message}`);
//     }
//   };

//   // Handle shipment decline
//   const handleDecline = () => {
//     Alert.alert("Declined", "You have declined the shipment. Please meet the field agent for clarifications.");
//     setIsModalVisible(false);
//   };

//   // Start tracking location
//   const startTracking = async () => {
//     setTracking(true);
//     await updateCurrentLocation();
//     setInterval(updateCurrentLocation, 10 * 60 * 1000); // Update every 10 minutes
//   };

//   // Update current location in Firebase
//   const updateCurrentLocation = async () => {
//     try {
//       let currentLocation = await Location.getCurrentPositionAsync({});
//       const newLocation = {
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//         timestamp: new Date().toISOString(),
//       };
//       setLocation(newLocation);

//       if (!shipmentId) return;

//       await setDoc(doc(db, "currentLocation", shipmentId), {
//         shipmentId,
//         location: newLocation,
//       }, { merge: true });
//     } catch (error: any) {
//       console.error("Failed to update location:", error.message);
//     }
//   };

//   // Handle notification press
//   const handleNotificationPress = () => {
//     if (shipmentData?.statusId === 3) {
//       setShowRedDot(false);
//       Alert.alert("Active Trip", "You are currently on an active delivery trip.");
//     } else if (shipmentId) {
//       setIsModalVisible(true);
//     }
//   };

//   if (loading || !location) {
//     return (
//       <View style={styles.loadingScreen}>
//         <LinearGradient
//           colors={['#F38301', '#F8A34D']}
//           style={styles.loadingGradient}
//         >
//           <ActivityIndicator size="large" color="white" />
//           <Text style={styles.loadingText}>Loading your delivery map...</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <TouchableWithoutFeedback onPress={() => setShowDeliveries(false)}>
//       <View style={styles.container}>
//         {/* Full-Screen Map */}
//         {Platform.OS === "web" ? (
//           <LoadScript googleMapsApiKey={MAPS_API_KEY}>
//             <GoogleMap
//               mapContainerStyle={styles.map}
//               center={{ lat: location.latitude, lng: location.longitude }}
//               zoom={15}
//               options={{
//                 styles: [
//                   {
//                     featureType: "poi",
//                     elementType: "labels",
//                     stylers: [{ visibility: "off" }]
//                   },
//                   {
//                     featureType: "transit",
//                     elementType: "labels",
//                     stylers: [{ visibility: "off" }]
//                   }
//                 ]
//               }}
//             >
//               <WebMarker 
//                 position={{ lat: location.latitude, lng: location.longitude }}
//                 icon={{
//                   url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//                   scaledSize: new window.google.maps.Size(40, 40)
//                 }}
//               />
//               {showDeliveries && deliveryOrder.map((delivery) => (
//                 <WebMarker
//                   key={delivery.id}
//                   position={{ lat: delivery.latitude, lng: delivery.longitude }}
//                   onClick={() => handleDeliveryTap(delivery)}
//                   icon={{
//                     url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//                     scaledSize: new window.google.maps.Size(40, 40)
//                   }}
//                 />
//               ))}
//               {routeCoordinates.length > 0 && (
//                 <WebPolyline
//                   path={routeCoordinates.map((coord) => ({ lat: coord.latitude, lng: coord.longitude }))}
//                   options={{
//                     strokeColor: "#F38301",
//                     strokeOpacity: 0.8,
//                     strokeWeight: 6,
//                   }}
//                 />
//               )}
//             </GoogleMap>
//           </LoadScript>
//         ) : (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: location.latitude,
//               longitude: location.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//             ref={mapRef}
//             customMapStyle={[
//               {
//                 "featureType": "poi",
//                 "elementType": "labels",
//                 "stylers": [
//                   {
//                     "visibility": "off"
//                   }
//                 ]
//               },
//               {
//                 "featureType": "transit",
//                 "elementType": "labels",
//                 "stylers": [
//                   {
//                     "visibility": "off"
//                   }
//                 ]
//               }
//             ]}
//             mapType={mapType === 'navigation' ? 'mutedStandard' : 'standard'}
//           >
//             <Marker coordinate={location}>
//               <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
//                 <Image
//                   source={currentLocationMarker}
//                   style={styles.markerImage}
//                   resizeMode="contain"
//                 />
//                 <View style={styles.pulse} />
//               </Animated.View>
//             </Marker>
//             {showDeliveries && deliveryOrder.map((delivery) => (
//               <Marker
//                 key={delivery.id}
//                 coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
//                 onPress={() => handleDeliveryTap(delivery)}
//               >
//                 <Animated.View style={[
//                   styles.markerContainer, 
//                   selectedDelivery?.id === delivery.id ? styles.selectedMarker : styles.deliveryMarker
//                 ]}>
//                   <Image
//                     source={destinationMarker}
//                     style={styles.markerImage}
//                     resizeMode="contain"
//                   />
//                   <Text style={styles.markerText}>{delivery.customer.split(' ')[0]}</Text>
//                 </Animated.View>
//               </Marker>
//             ))}
//             {routeCoordinates.length > 0 && (
//               <Polyline
//                 coordinates={routeCoordinates}
//                 strokeColor="#F38301"
//                 strokeWidth={6}
//                 lineDashPattern={[10, 10]}
//               />
//             )}
//           </MapView>
//         )}

//         {/* Header with Profile and Notifications */}
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
//             onPress={handleNotificationPress}
//           >
//             <Ionicons name="notifications" size={24} color="#333" />
//             {showRedDot && <View style={styles.redDot} />}
//           </TouchableOpacity>
//         </View>

//         {/* Delivery Controls */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleDeliveryRoute}
//           >
//             <MaterialIcons 
//               name={showDeliveries ? "list" : "format-list-bulleted"} 
//               size={24} 
//               color="white" 
//             />
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={() => {
//               if (location && mapRef.current) {
//                 mapRef.current.animateToRegion(
//                   {
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   },
//                   1000
//                 );
//                 setMapType('standard'); // Reset to standard view
//               }
//             }}
//           >
//             <MaterialIcons name="my-location" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Delivery List */}
//         <Animated.View 
//           style={[
//             styles.deliveryListContainer,
//             { 
//               transform: [{ translateY: slideAnim }],
//               opacity: fadeAnim
//             }
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
            
//             <ScrollView 
//               style={styles.deliveryScrollView}
//               contentContainerStyle={styles.deliveryScrollContent}
//             >
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

//         {/* Modal for Shipment Details */}
//         <Modal visible={isModalVisible} transparent animationType="fade">
//           <View style={styles.modalBackground}>
//             <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
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
//                     <MaterialIcons name="route" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>Route: {shipmentData?.route}</Text>
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

//         {/* Loading Indicator for Directions */}
//         {loadingDirections && (
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#F38301" />
//               <Text style={styles.loadingMessage}>Calculating best route...</Text>
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
//     top: 50,
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
//     marginBottom: 10,
//   },
//   deliveryListTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   deliveryListSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 5,
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
// });

// export default NotificationScreen;




// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   Image,
//   Platform,
//   ScrollView,
//   Animated,
//   Easing,
//   Dimensions,
//   TouchableWithoutFeedback,
//   Linking
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   doc,
//   updateDoc,
//   getDocs,
//   setDoc,
//   writeBatch,
//   onSnapshot
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import { GoogleMap, LoadScript, Marker as WebMarker, Polyline as WebPolyline } from "@react-google-maps/api";
// import * as Location from 'expo-location';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
// import * as ImagePicker from 'expo-image-picker';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// const { width, height } = Dimensions.get('window');
// const db = getFirestore(app);
// const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");
// const MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

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

// // Custom marker images
// const currentLocationMarker = require("../../assets/images/van.png");
// const destinationMarker = require("../../assets/images/down.png");

// const NotificationScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState("");
//   const [shipmentData, setShipmentData] = useState<any>(null);
//   const [location, setLocation] = useState<Coordinate | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [tracking, setTracking] = useState<boolean>(false);
//   const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
//   const [showDeliveries, setShowDeliveries] = useState(false);
//   const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
//   const [travelTime, setTravelTime] = useState<string | null>(null);
//   const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
//   const [loadingDirections, setLoadingDirections] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [collectionName, setCollectionName] = useState<string | null>(null);
//   const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
//   const [id, setId] = useState<string | null>(null);
//   const [isNavigationMode, setIsNavigationMode] = useState(false);
//   const [showPODModal, setShowPODModal] = useState(false);
//   const [currentCompletedDelivery, setCurrentCompletedDelivery] = useState<Delivery | null>(null);
//   const [podImage, setPodImage] = useState<string | null>(null);
//   const [uploadingPod, setUploadingPod] = useState(false);
//   const [heading, setHeading] = useState(0);
  
//   const mapRef = useRef<MapView>(null);
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const modalAnim = useRef(new Animated.Value(0)).current;

//   // Toggle delivery route view
//   const toggleDeliveryRoute = () => {
//     setShowDeliveries(!showDeliveries);
//   };

//   // Animation for showing/hiding delivery list
//   useEffect(() => {
//     if (showDeliveries) {
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.exp),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height,
//         duration: 300,
//         easing: Easing.in(Easing.exp),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [showDeliveries]);

//   // Animation for modal
//   useEffect(() => {
//     if (isModalVisible) {
//       Animated.timing(modalAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(modalAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [isModalVisible]);

//   useEffect(() => {
//     // Request notification permissions when screen mounts
//     const requestPermissions = async () => {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Warning', 'Push notifications permission not granted!');
//       }
//     };
//     requestPermissions();

//     // Listen for notifications when app is foregrounded
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       console.log('Notification received:', notification);
//       setShowRedDot(true);
//     });

//     return () => subscription.remove();
//   }, []);

//   // Fetch phone number from storage
//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       try {
//         const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!storedPhoneNumber) {
//           Alert.alert("Error", "No phone number found. Please log in again.");
//           return;
//         }
//         setPhoneNumber(storedPhoneNumber);
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
//       }
//     };
//     fetchPhoneNumber();
//   }, []);

//   // Fetch driver info when phone number is available
//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchDeliverDriver = async () => {
//       try {
//         const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(usersQuery);

//         if (!querySnapshot.empty) {
//           const userData = querySnapshot.docs[0].data();
//           setDeliverDriver(userData.phoneNumber || null);
//           setDisplayName(userData.name || "Unknown User");
//           setProfileImage(userData.imageUrl || null);
//           setCollectionName("deliverydriver");
//           const encodedID = encodeURIComponent(userData.uid);
//           setId(encodedID);
//         }
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDeliverDriver();
//   }, [phoneNumber]);

//   // Watch for shipment assignments
//   useEffect(() => {
//     if (!deliverDriver) return;

//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", deliverDriver),
//       where("statusId", "in", [2, 3]) // Only listen for statusId 2 (assigned) or 3 (accepted)
//     );

//     const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
//       if (querySnapshot.empty) {
//         setShowRedDot(false);
//         setIsModalVisible(false);
//         return;
//       }

//       const shipmentDoc = querySnapshot.docs[0];
//       const shipmentData = { id: shipmentDoc.id, ...shipmentDoc.data() };
//       setShipmentId(shipmentDoc.id);
//       setShipmentData(shipmentData);

//       // Only show modal for new assignments (statusId 2)
//       if (shipmentData.statusId === 2) {
//         setShowRedDot(true);
//       } else {
//         setShowRedDot(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [deliverDriver]);

//   // Re-sort deliveries when location changes
//   useEffect(() => {
//     if (location && deliveryOrder.length > 0) {
//       optimizeDeliveryOrder(deliveryOrder, location);
//     }
//   }, [location]);

//   // Fetch and optimize deliveries when shipment changes
//   useEffect(() => {
//     if (!shipmentId) return;
  
//     const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
//     const unsubscribeDeliveries = onSnapshot(deliveriesQuery, async (querySnapshot) => {
//       const deliveries: Delivery[] = [];
      
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         deliveries.push({
//           id: doc.id,
//           customer: data.customer,
//           address: data.address,
//           latitude: data.latitude,
//           longitude: data.longitude,
//           statusId: data.statusId,
//           deliveryNumber: data.deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
//           podImageUrl: data.podImageUrl || null // Add this line to include podImageUrl in the Delivery type
//         });
//       });
  
//       // Check for any deliveries that were just completed AND don't have POD uploaded yet
//       const newlyCompleted = deliveries.find(d => 
//         d.statusId === 4 && 
//         !d.podImageUrl && // Only show if POD hasn't been uploaded
//         !deliveryOrder.some(od => od.id === d.id && od.statusId === 4)
//       );
  
//       if (newlyCompleted && !currentCompletedDelivery) {
//         setCurrentCompletedDelivery(newlyCompleted);
//         setShowPODModal(true);
//       }
  
//       const pendingDeliveries = deliveries.filter((delivery) => delivery.statusId !== 4);
  
//       if (location) {
//         const optimizedDeliveries = await optimizeDeliveryOrder(pendingDeliveries, location);
//         setDeliveryOrder(optimizedDeliveries);
//       }
  
//       if (pendingDeliveries.length === 0) {
//         updateDoc(doc(db, "Shipment", shipmentId), { statusId: 4 });
//       }
//     });
  
//     return () => unsubscribeDeliveries();
//   }, [shipmentId, location, currentCompletedDelivery, deliveryOrder]);

//   // Location tracking setup with heading
//   useEffect(() => {
//     const startLocationTracking = async () => {
//       try {
//         // Request location permissions
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Error", "Permission to access location was denied.");
//           return;
//         }

//         // Get initial location
//         let currentLocation = await Location.getCurrentPositionAsync({});
//         setLocation({
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//         });

//         // Start watching the user's location and heading
//         const subscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 1000,
//             distanceInterval: 1,
//           },
//           (newLocation) => {
//             setLocation({
//               latitude: newLocation.coords.latitude,
//               longitude: newLocation.coords.longitude,
//             });
            
//             if (newLocation.coords.heading) {
//               setHeading(newLocation.coords.heading);
//             }

//             // In navigation mode, keep the map centered on the user with proper bearing
//             if (isNavigationMode && mapRef.current) {
//               mapRef.current.animateCamera({
//                 center: {
//                   latitude: newLocation.coords.latitude,
//                   longitude: newLocation.coords.longitude,
//                 },
//                 heading: newLocation.coords.heading || 0,
//                 pitch: 45, // Slight tilt for navigation view
//                 zoom: 17, // Close zoom level for navigation
//               });
//             }
//           }
//         );

//         setLocationSubscription(subscription);
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to start location tracking: ${error.message}`);
//       }
//     };

//     startLocationTracking();

//     return () => {
//       if (locationSubscription) {
//         locationSubscription.remove();
//       }
//     };
//   }, [isNavigationMode]);

//   // Update driver location in Firebase
//   useEffect(() => {
//     const updateDriverLocation = async () => {
//       if (!phoneNumber || !location) return;

//       try {
//         const driversQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(driversQuery);

//         if (!querySnapshot.empty) {
//           const driverDoc = querySnapshot.docs[0];
//           const driverRef = doc(db, "deliverydriver", driverDoc.id);

//           await updateDoc(driverRef, {
//             Latitude: location.latitude,
//             Longitude: location.longitude,
//             lastUpdated: new Date().toISOString()
//           });
//         }
//       } catch (error: any) {
//         console.error("Failed to update location in Firebase:", error.message);
//       }
//     };

//     const interval = setInterval(updateDriverLocation, 10000); // Update every 10 seconds
//     updateDriverLocation(); // Initial update
    
//     return () => clearInterval(interval);
//   }, [location, phoneNumber]);

//   // Haversine distance calculation
//   const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
//     const toRad = (x: number) => (x * Math.PI) / 180;
//     const R = 6371; // Earth's radius in km
//     const dLat = toRad(coord2.latitude - coord1.latitude);
//     const dLon = toRad(coord2.longitude - coord1.longitude);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(coord1.latitude)) *
//         Math.cos(toRad(coord2.latitude)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Distance in km
//   };

//   // Sort deliveries by distance (fallback)
//   const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
//     return deliveries.sort((a, b) => {
//       const distanceA = haversineDistance(currentLocation, {
//         latitude: a.latitude,
//         longitude: a.longitude,
//       });
//       const distanceB = haversineDistance(currentLocation, {
//         latitude: b.latitude,
//         longitude: b.longitude,
//       });
//       return distanceA - distanceB;
//     });
//   };

//   // Fetch travel times between points
//   const fetchTravelTimes = async (origin: Coordinate, destinations: Delivery[]) => {
//     const travelTimes: { [key: string]: { [key: string]: number } } = {};
  
//     // Add current location as starting point
//     const allPoints = [{ id: "current", latitude: origin.latitude, longitude: origin.longitude }, ...destinations];
  
//     for (const pointA of allPoints) {
//       travelTimes[pointA.id] = {};
  
//       for (const pointB of allPoints) {
//         if (pointA.id === pointB.id) continue;
  
//         const originStr = `${pointA.latitude},${pointA.longitude}`;
//         const destinationStr = `${pointB.latitude},${pointB.longitude}`;
//         const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
//         try {
//           const response = await fetch(url);
//           const data = await response.json();
  
//           if (data.status === "OK") {
//             const duration = data.routes[0].legs[0].duration.value;
//             travelTimes[pointA.id][pointB.id] = duration;
//           } else {
//             console.error("Directions API Error:", data);
//             travelTimes[pointA.id][pointB.id] = Infinity;
//           }
//         } catch (error) {
//           console.error("Fetch Travel Times Error:", error);
//           travelTimes[pointA.id][pointB.id] = Infinity;
//         }
//       }
//     }
  
//     return travelTimes;
//   };

//   // Solve Traveling Salesman Problem (nearest neighbor)
//   const solveTSP = (travelTimes: { [key: string]: { [key: string]: number } }, startId: string) => {
//     const visited = new Set<string>();
//     const route: string[] = [startId];
//     let currentId = startId;
  
//     while (visited.size < Object.keys(travelTimes).length - 1) {
//       visited.add(currentId);
  
//       let nextId: string | null = null;
//       let minTime = Infinity;
  
//       for (const pointId in travelTimes[currentId]) {
//         if (!visited.has(pointId) && travelTimes[currentId][pointId] < minTime) {
//           minTime = travelTimes[currentId][pointId];
//           nextId = pointId;
//         }
//       }
  
//       if (nextId) {
//         route.push(nextId);
//         currentId = nextId;
//       } else {
//         break;
//       }
//     }
  
//     return route;
//   };

//   // Optimize delivery order using Google Maps API
//   const optimizeDeliveryOrder = async (deliveries: Delivery[], currentLocation: Coordinate) => {
//     let optimizedDeliveries: Delivery[] = [];
  
//     try {
//       const travelTimes = await fetchTravelTimes(currentLocation, deliveries);
//       if (Object.keys(travelTimes).length > 0) {
//         const optimalRoute = solveTSP(travelTimes, "current");
  
//         // Remove the "current" point from the route
//         const deliveryIds = optimalRoute.slice(1);
  
//         // Sort deliveries based on the optimal route
//         optimizedDeliveries = deliveryIds.map((id) =>
//           deliveries.find((delivery) => delivery.id === id)
//         ).filter((delivery) => delivery !== undefined) as Delivery[];
//       } else {
//         // Fallback to Haversine distance if travel times are not available
//         Alert.alert("Info", "No internet connection. Using approximate distance for optimization.");
//         optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
//       }
//     } catch (error) {
//       console.error("Optimization Error:", error);
//       // Fallback to Haversine distance if an error occurs
//       Alert.alert("Info", "Failed to fetch optimized route. Using approximate distance for optimization.");
//       optimizedDeliveries = sortDeliveriesByDistance(deliveries, currentLocation);
//     }
  
//     return optimizedDeliveries;
//   };

//   // Fetch ETA for a delivery
//   const fetchETA = async (origin: Coordinate, destination: Delivery) => {
//     const originStr = `${origin.latitude},${origin.longitude}`;
//     const destinationStr = `${destination.latitude},${destination.longitude}`;
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
  
//     try {
//       const response = await fetch(url);
//       const data = await response.json();
  
//       if (data.status === "OK") {
//         const duration = data.routes[0].legs[0].duration.text;
//         return duration;
//       } else {
//         console.error("Directions API Error:", data);
//         Alert.alert("Error", "Failed to fetch ETA. Please check your API key and coordinates.");
//       }
//     } catch (error) {
//       console.error("Fetch ETA Error:", error);
//       Alert.alert("Error", "Failed to fetch ETA. Please check your internet connection.");
//     }
  
//     return null;
//   };

//   // Update delivery ETA in Firebase
//   const updateDeliveryETA = async (deliveryId: string, eta: string) => {
//     try {
//       const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", deliveryId);
//       await updateDoc(deliveryRef, { eta });
//     } catch (error) {
//       console.error("Update ETA Error:", error);
//     }
//   };

//   // Fetch directions between two points
//   const fetchDirections = async (origin: Coordinate, destination: Delivery) => {
//     setLoadingDirections(true);
//     const originStr = `${origin.latitude},${origin.longitude}`;
//     const destinationStr = `${destination.latitude},${destination.longitude}`;
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === "OK") {
//         const points = data.routes[0].overview_polyline.points;
//         const decodedPoints = decodePolyline(points);
//         setRouteCoordinates(decodedPoints);

//         const duration = data.routes[0].legs[0].duration.text;
//         setTravelTime(duration);
//         zoomToPolyline(decodedPoints);
//         setIsNavigationMode(true); // Switch to navigation view
//       } else {
//         console.error("Directions API Error:", data);
//         Alert.alert("Error", "Failed to fetch directions. Please check your API key and coordinates.");
//       }
//     } catch (error: any) {
//       console.error("Fetch Directions Error:", error);
//       Alert.alert("Error", `Failed to fetch directions: ${error.message}`);
//     } finally {
//       setLoadingDirections(false);
//     }
//   };

//   // Decode polyline points
//   const decodePolyline = (encoded: string): Coordinate[] => {
//     const points: Coordinate[] = [];
//     let index = 0,
//       len = encoded.length;
//     let lat = 0,
//       lng = 0;

//     while (index < len) {
//       let b,
//         shift = 0,
//         result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
//       lng += dlng;

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }

//     return points;
//   };

//   // Zoom to a specific marker
//   const zoomToMarker = (delivery: Delivery) => {
//     if (mapRef.current) {
//       mapRef.current.animateCamera({
//         center: {
//           latitude: delivery.latitude,
//           longitude: delivery.longitude,
//         },
//         zoom: 15,
//       });
//     }
//   };

//   // Zoom to show the entire polyline
//   const zoomToPolyline = (coordinates: Coordinate[]) => {
//     if (mapRef.current && coordinates.length > 0) {
//       const latitudes = coordinates.map((coord) => coord.latitude);
//       const longitudes = coordinates.map((coord) => coord.longitude);
  
//       const minLat = Math.min(...latitudes);
//       const maxLat = Math.max(...latitudes);
//       const minLng = Math.min(...longitudes);
//       const maxLng = Math.max(...longitudes);
  
//       mapRef.current.animateCamera({
//         center: {
//           latitude: (minLat + maxLat) / 2,
//           longitude: (minLng + maxLng) / 2,
//         },
//         heading: 0,
//         pitch: 0,
//         zoom: maxLat - minLat > maxLng - minLng ? 
//           11 - (maxLat - minLat) : 
//           11 - (maxLng - minLng),
//       });
//     }
//   };

//   // Handle delivery selection
//   const handleDeliveryTap = async (delivery: Delivery) => {
//     setSelectedDelivery(delivery);
  
//     Alert.alert(
//       "Confirm Delivery",
//       `Do you want to deliver to ${delivery.customer}?`,
//       [
//         {
//           text: "No",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             if (location) {
//               const eta = await fetchETA(location, delivery);
//               if (eta) {
//                 await updateDeliveryETA(delivery.id, eta);
//                 zoomToMarker(delivery);
//                 fetchDirections(location, delivery);
//                 startPeriodicETAUpdates(delivery);
//               }
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Start periodic ETA updates
//   const startPeriodicETAUpdates = (delivery: Delivery) => {
//     const interval = setInterval(async () => {
//       if (location) {
//         const eta = await fetchETA(location, delivery);
//         if (eta) {
//           await updateDeliveryETA(delivery.id, eta);
//         }
//       }
//     }, 5 * 60 * 1000); // 5 minutes
  
//     return () => clearInterval(interval);
//   };

//   // Handle shipment acceptance
//   const handleAccept = async () => {
//     if (!shipmentId) return;
//     try {
//       const shipmentDocRef = doc(db, "Shipment", shipmentId);
  
//       // Update shipment statusId to 3
//       await updateDoc(shipmentDocRef, { statusId: 3 });
  
//       // Fetch all deliveries in the subcollection
//       const deliveriesCollectionRef = collection(shipmentDocRef, "deliveries");
//       const deliveriesSnapshot = await getDocs(deliveriesCollectionRef);
  
//       // Update statusId of each delivery to 3
//       const batch = writeBatch(db);
//       deliveriesSnapshot.forEach((doc) => {
//         batch.update(doc.ref, { statusId: 3 });
//       });
//       await batch.commit();
  
//       Alert.alert("Success", "Shipment and deliveries accepted.");
//       setIsModalVisible(false);
//       setShowRedDot(false);
//       startTracking();
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to update shipment: ${error.message}`);
//     }
//   };

//   // Handle shipment decline
//   const handleDecline = () => {
//     Alert.alert("Declined", "You have declined the shipment. Please meet the field agent for clarifications.");
//     setIsModalVisible(false);
//   };

//   // Start tracking location
//   const startTracking = async () => {
//     setTracking(true);
//     await updateCurrentLocation();
//     setInterval(updateCurrentLocation, 10 * 60 * 1000); // Update every 10 minutes
//   };

//   // Update current location in Firebase
//   const updateCurrentLocation = async () => {
//     try {
//       let currentLocation = await Location.getCurrentPositionAsync({});
//       const newLocation = {
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//         timestamp: new Date().toISOString(),
//       };
//       setLocation(newLocation);

//       if (!shipmentId) return;

//       await setDoc(doc(db, "currentLocation", shipmentId), {
//         shipmentId,
//         location: newLocation,
//       }, { merge: true });
//     } catch (error: any) {
//       console.error("Failed to update location:", error.message);
//     }
//   };

//   // Handle notification press
//   const handleNotificationPress = () => {
//     if (!showRedDot) return;
    
//     if (shipmentData?.statusId === 3) {
//       setShowRedDot(false);
//       Alert.alert("Active Trip", "You are currently on an active delivery trip.");
//     } else if (shipmentId && shipmentData?.statusId === 2) {
//       setIsModalVisible(true);
//       setShowRedDot(false);
//     }
//   };

//   // Take POD photo
//   const takePodPhoto = async () => {
//     try {
//       // Request camera permissions
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'We need camera permissions to capture proof of delivery');
//         return;
//       }

//       // Launch camera
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         // Compress and resize the image
//         const manipulatedImage = await manipulateAsync(
//           result.assets[0].uri,
//           [{ resize: { width: 800 } }],
//           { compress: 0.7, format: SaveFormat.JPEG }
//         );
        
//         setPodImage(manipulatedImage.uri);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo. Please try again.');
//     }
//   };

//   const recenterMap = () => {
//     if (mapRef.current && location) {
//       mapRef.current.animateCamera({
//         center: {
//           latitude: location.latitude,
//           longitude: location.longitude,
//         },
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

//   // Upload POD to Firebase
//   const uploadPod = async () => {
//     if (!podImage || !currentCompletedDelivery || !shipmentId) return;
  
//     setUploadingPod(true);
//     try {
//       // Generate unique filename
//       const filename = `POD_${currentCompletedDelivery.deliveryNumber}_${Date.now()}.jpg`;
      
//       // Convert image to blob
//       const response = await fetch(podImage);
//       const blob = await response.blob();
      
//       // Create storage reference
//       const storageRef = ref(storage, `proof-of-delivery/${shipmentId}/${filename}`);
      
//       // Upload file
//       await uploadBytes(storageRef, blob);
      
//       // Get download URL
//       const downloadURL = await getDownloadURL(storageRef);
      
//       // Update delivery document with POD info
//       const deliveryRef = doc(db, "Shipment", shipmentId, "deliveries", currentCompletedDelivery.id);
//       await updateDoc(deliveryRef, {
//         podImageUrl: downloadURL,
//         podTimestamp: new Date().toISOString()
//       });
  
//       // Success - close modal and reset state
//       setPodImage(null);
//       setCurrentCompletedDelivery(null); // Clear this first
//       setShowPODModal(false); // Then close modal
//       Alert.alert('Success', 'Proof of delivery uploaded successfully!');
//     } catch (error) {
//       console.error('Error uploading POD:', error);
//       Alert.alert('Error', 'Failed to upload proof of delivery. Please try again.');
//     } finally {
//       setUploadingPod(false);
//     }
//   };

//   // Exit navigation mode
//   const exitNavigationMode = () => {
//     setIsNavigationMode(false);
//     if (mapRef.current && location) {
//       mapRef.current.animateCamera({
//         center: {
//           latitude: location.latitude,
//           longitude: location.longitude,
//         },
//         heading: 0,
//         pitch: 0,
//         zoom: 15,
//       });
//     }
//   };

//   if (loading || !location) {
//     return (
//       <View style={styles.loadingScreen}>
//         <LinearGradient
//           colors={['#F38301', '#F8A34D']}
//           style={styles.loadingGradient}
//         >
//           <ActivityIndicator size="large" color="white" />
//           <Text style={styles.loadingText}>Loading your delivery map...</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <TouchableWithoutFeedback onPress={() => setShowDeliveries(false)}>
//       <View style={styles.container}>
//         {/* Full-Screen Map */}
//         {Platform.OS === "web" ? (
//           <LoadScript googleMapsApiKey={MAPS_API_KEY}>
//             <GoogleMap
//               mapContainerStyle={styles.map}
//               center={{ lat: location.latitude, lng: location.longitude }}
//               zoom={15}
//               options={{
//                 styles: [
//                   {
//                     featureType: "poi",
//                     elementType: "labels",
//                     stylers: [{ visibility: "off" }]
//                   },
//                   {
//                     featureType: "transit",
//                     elementType: "labels",
//                     stylers: [{ visibility: "off" }]
//                   }
//                 ]
//               }}
//             >
//               <WebMarker 
//                 position={{ lat: location.latitude, lng: location.longitude }}
//                 icon={{
//                   url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//                   scaledSize: new window.google.maps.Size(40, 40)
//                 }}
//               />
//               {showDeliveries && deliveryOrder.map((delivery) => (
//                 <WebMarker
//                   key={delivery.id}
//                   position={{ lat: delivery.latitude, lng: delivery.longitude }}
//                   onClick={() => handleDeliveryTap(delivery)}
//                   icon={{
//                     url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//                     scaledSize: new window.google.maps.Size(40, 40)
//                   }}
//                 />
//               ))}
//               {routeCoordinates.length > 0 && (
//                 <WebPolyline
//                   path={routeCoordinates.map((coord) => ({ lat: coord.latitude, lng: coord.longitude }))}
//                   options={{
//                     strokeColor: "#F38301",
//                     strokeOpacity: 0.8,
//                     strokeWeight: 6,
//                   }}
//                 />
//               )}
//             </GoogleMap>
//           </LoadScript>
//         ) : (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: location.latitude,
//               longitude: location.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//             ref={mapRef}
//             provider={PROVIDER_GOOGLE}
//             customMapStyle={[
//               {
//                 "featureType": "poi",
//                 "elementType": "labels",
//                 "stylers": [
//                   {
//                     "visibility": "off"
//                   }
//                 ]
//               },
//               {
//                 "featureType": "transit",
//                 "elementType": "labels",
//                 "stylers": [
//                   {
//                     "visibility": "off"
//                   }
//                 ]
//               }
//             ]}
//             rotateEnabled={true}
//             zoomEnabled={true}
//             pitchEnabled={true}
//             scrollEnabled={true}
//             onPanDrag={() => setIsNavigationMode(false)}
//             showsUserLocation={false} // We're using custom marker
//             showsMyLocationButton={false}
//             showsCompass={false}
//             toolbarEnabled={false}
//             onRegionChangeComplete={(region) => {
//               if (isNavigationMode) {
//                 // Recenter if user pans too far in navigation mode
//                 if (location && haversineDistance(
//                   {latitude: region.latitude, longitude: region.longitude},
//                   location
//                 ) > 0.5) { // 0.5 km threshold
//                   recenterMap();
//                 }
//               }
//             }}
//           >
//             <Marker 
//               coordinate={location}
//               anchor={{ x: 0.5, y: 0.5 }}
//               rotation={heading}
//               flat={isNavigationMode}
//             >
//               <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
//                 <Image
//                   source={currentLocationMarker}
//                   style={[
//                     styles.markerImage,
//                     isNavigationMode && { transform: [{ rotate: `${heading}deg` }] }
//                   ]}
//                   resizeMode="contain"
//                 />
//                 {!isNavigationMode && <View style={styles.pulse} />}
//               </Animated.View>
//             </Marker>
//             {showDeliveries && deliveryOrder.map((delivery) => (
//               <Marker
//                 key={delivery.id}
//                 coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
//                 onPress={() => handleDeliveryTap(delivery)}
//                 anchor={{x:0.5, y:0.5}}
//               >
//                 <Animated.View style={[
//                   styles.markerContainer, 
//                   selectedDelivery?.id === delivery.id ? styles.selectedMarker : styles.deliveryMarker
//                 ]}>
//                   <Image
//                     source={destinationMarker}
//                     style={styles.markerImage}
//                     resizeMode="contain"
//                   />
//                   <Text style={styles.markerText}>{delivery.customer.split(' ')[0]}</Text>
//                 </Animated.View>
//               </Marker>
//             ))}
//             {routeCoordinates.length > 0 && (
//               <Polyline
//                 coordinates={routeCoordinates}
//                 strokeColor="#F38301"
//                 strokeWidth={6}
//                 lineDashPattern={[10, 10]}
//               />
//             )}
//           </MapView>
//         )}

//         {/* Header with Profile and Notifications */}
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
//             onPress={handleNotificationPress}
//           >
//             <Ionicons name="notifications" size={24} color="#333" />
//             {showRedDot && <View style={styles.redDot} />}
//           </TouchableOpacity>
//         </View>

//         {/* Delivery Controls */}
//         <View style={styles.controlsContainer}>
//           {isNavigationMode ? (
//             <TouchableOpacity
//               style={styles.controlButton}
//               onPress={toggleNavigationMode}
//             >
//               <MaterialIcons name={isNavigationMode ? "navigation" : "my-location"} size={24} color="white" />
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TouchableOpacity
//                 style={styles.controlButton}
//                 onPress={toggleDeliveryRoute}
//               >
//                 <MaterialIcons 
//                   name={showDeliveries ? "list" : "format-list-bulleted"} 
//                   size={24} 
//                   color="white" 
//                 />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={styles.controlButton}
//                 onPress={() => {
//                   if (location && mapRef.current) {
//                     mapRef.current.animateCamera({
//                       center: {
//                         latitude: location.latitude,
//                         longitude: location.longitude,
//                       },
//                       zoom: 15,
//                     });
//                   }
//                 }}
//               >
//                 <MaterialIcons name="my-location" size={24} color="white" />
//               </TouchableOpacity>
//             </>
//           )}
//         </View>

//         {/* Delivery List */}
//         <Animated.View 
//           style={[
//             styles.deliveryListContainer,
//             { 
//               transform: [{ translateY: slideAnim }],
//               opacity: fadeAnim
//             }
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
            
//             <ScrollView 
//               style={styles.deliveryScrollView}
//               contentContainerStyle={styles.deliveryScrollContent}
//             >
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

//         {/* Modal for Shipment Details */}
//         <Modal 
//           visible={isModalVisible} 
//           transparent 
//           animationType="fade"
//           onRequestClose={() => {
//             // Prevent closing on Android back button
//             if (shipmentData?.statusId === 2) {
//               Alert.alert(
//                 "Action Required",
//                 "You must either accept or decline this shipment",
//                 [{ text: "OK" }]
//               );
//             }
//           }}
//         >
//           <View style={styles.modalBackground}>
//             <Animated.View 
//               style={[
//                 styles.modalContainer, 
//                 { 
//                   opacity: modalAnim,
//                   transform: [{
//                     translateY: modalAnim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [20, 0]
//                     })
//                   }]
//                 }
//               ]}
//             >
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
//                     <MaterialIcons name="route" size={24} color="#F38301" />
//                     <Text style={styles.modalInfoText}>Route: {shipmentData?.route}</Text>
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

//         {/* POD Capture Modal */}
//         <Modal
//   visible={showPODModal}
//   transparent={false}
//   animationType="slide"
//   onRequestClose={() => {
//     if (podImage) {
//       // Only allow closing if we have an image
//       setShowPODModal(false);
//       setCurrentCompletedDelivery(null);
//       setPodImage(null);
//     } else {
//       Alert.alert(
//         "Action Required",
//         "You must capture proof of delivery before continuing",
//         [{ text: "OK" }]
//       );
//     }
//   }}
// >
//           <View style={styles.podModalContainer}>
//             <View style={styles.podModalHeader}>
//               <Text style={styles.podModalTitle}>Proof of Delivery</Text>
//               <Text style={styles.podModalSubtitle}>
//                 Delivery #{currentCompletedDelivery?.deliveryNumber} - {currentCompletedDelivery?.customer}
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
//               This photo will be saved as proof of delivery.
//             </Text>
//           </View>
//         </Modal>

//         {/* Loading Indicator for Directions */}
//         {loadingDirections && (
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#F38301" />
//               <Text style={styles.loadingMessage}>Calculating best route...</Text>
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
//   // POD Modal Styles
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
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";
import Mapbox, { Camera, MapView, PointAnnotation, ShapeSource, LineLayer } from '@rnmapbox/maps';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, query, where, doc, updateDoc, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Initialize Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZ2x5ZGUtZ2x5ZGVyIiwiYSI6ImNtOHp3OG8xbzBmZnUybnNpOW9jcTE4aWEifQ.ahL12-w_gWqdmq0FIC76-g');
Mapbox.setWellKnownTileServer('Mapbox');

const { width, height } = Dimensions.get('window');
const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");

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

// Custom marker images
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
  const [location, setLocation] = useState<Coordinate>({ latitude: 0, longitude: 0 });
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
  
  // Refs
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Toggle delivery route view
  const toggleDeliveryRoute = () => setShowDeliveries(!showDeliveries);

  // Animation for showing/hiding delivery list
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showDeliveries ? 0 : height,
      duration: 300,
      easing: showDeliveries ? Easing.out(Easing.exp) : Easing.in(Easing.exp),
      useNativeDriver: true,
    }).start();
    
    Animated.timing(fadeAnim, {
      toValue: showDeliveries ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showDeliveries]);

  // Animation for modal
  useEffect(() => {
    Animated.timing(modalAnim, {
      toValue: isModalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isModalVisible]);

  // Fetch phone number from storage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        setPhoneNumber(storedPhoneNumber || null);
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
      }
    };
    fetchPhoneNumber();
  }, []);

  // Fetch driver info when phone number is available
  useEffect(() => {
    if (!phoneNumber) return;

    const fetchDeliverDriver = async () => {
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
        Alert.alert("Error", `Failed to fetch driver info: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliverDriver();
  }, [phoneNumber]);

  // Watch for shipment assignments
  useEffect(() => {
    if (!deliverDriver) return;

    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", deliverDriver),
      where("statusId", "in", [2, 3])
    );

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      if (querySnapshot.empty) {
        setShowRedDot(false);
        setIsModalVisible(false);
        return;
      }

      const shipmentDoc = querySnapshot.docs[0];
      const shipmentData = { id: shipmentDoc.id, ...shipmentDoc.data() };
      setShipmentId(shipmentDoc.id);
      setShipmentData(shipmentData);
      setShowRedDot(shipmentData.statusId === 2);
    });

    return () => unsubscribe();
  }, [deliverDriver]);

  // Fetch and optimize deliveries when shipment changes
  useEffect(() => {
    if (!shipmentId) return;
  
    const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
    const unsubscribeDeliveries = onSnapshot(deliveriesQuery, async (querySnapshot) => {
      const deliveries: Delivery[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        customer: doc.data().customer,
        address: doc.data().address,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        statusId: doc.data().statusId,
        deliveryNumber: doc.data().deliveryNumber || `DEL-${doc.id.substring(0, 5).toUpperCase()}`,
        podImageUrl: doc.data().podImageUrl || null
      }));
  
      const newlyCompleted = deliveries.find(d => 
        d.statusId === 4 && !d.podImageUrl && !deliveryOrder.some(od => od.id === d.id && od.statusId === 4)
      );
  
      if (newlyCompleted) {
        setCurrentCompletedDelivery(newlyCompleted);
        setShowPODModal(true);
      }
  
      const pendingDeliveries = deliveries.filter(d => d.statusId !== 4);
      if (location.latitude !== 0) {
        setDeliveryOrder(sortDeliveriesByDistance(pendingDeliveries, location));
      }
  
      if (pendingDeliveries.length === 0) {
        updateDoc(doc(db, "Shipment", shipmentId), { statusId: 4 });
      }
    });
  
    return () => unsubscribeDeliveries();
  }, [shipmentId, location]);

  // Location tracking
  useEffect(() => {
    let subscription: Location.LocationSubscription;
    
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setLocation(newCoords);
          if (newLocation.coords.heading) setHeading(newLocation.coords.heading);
          
          if (isNavigationMode && cameraRef.current) {
            cameraRef.current.setCamera({
              centerCoordinate: [newCoords.longitude, newCoords.latitude],
              heading: newLocation.coords.heading || 0,
              pitch: 45,
              zoomLevel: 17,
              animationDuration: 1000
            });
          }
        }
      );
    };

    startTracking();
    return () => subscription?.remove();
  }, [isNavigationMode]);

  // Haversine distance calculation
  const haversineDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Sort deliveries by distance
  const sortDeliveriesByDistance = (deliveries: Delivery[], currentLocation: Coordinate) => {
    return [...deliveries].sort((a, b) => {
      const distanceA = haversineDistance(currentLocation, a);
      const distanceB = haversineDistance(currentLocation, b);
      return distanceA - distanceB;
    });
  };

  // Fetch directions using Mapbox
  const fetchDirections = async (origin: Coordinate, destination: Delivery) => {
    setLoadingDirections(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=your_mapbox_access_token`
      );
      const data = await response.json();
      
      if (data.routes?.[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map(([lon, lat]: number[]) => ({
          longitude: lon,
          latitude: lat
        }));
        
        const duration = Math.round(data.routes[0].duration / 60);
        setRouteCoordinates(coordinates);
        setTravelTime(duration > 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`);
        zoomToPolyline(coordinates);
        setIsNavigationMode(true);
      }
    } catch (error) {
      console.error("Directions error:", error);
      Alert.alert("Error", "Failed to get directions");
    } finally {
      setLoadingDirections(false);
    }
  };

  // Zoom to show the entire polyline
  const zoomToPolyline = (coordinates: Coordinate[]) => {
    if (coordinates.length > 0 && cameraRef.current) {
      const lons = coordinates.map(c => c.longitude);
      const lats = coordinates.map(c => c.latitude);
      
      cameraRef.current.fitBounds(
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
        100,  // padding
        1000  // animation duration
      );
    }
  };

  // Handle delivery selection
  const handleDeliveryTap = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    Alert.alert(
      "Confirm Delivery",
      `Deliver to ${delivery.customer}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => location && fetchDirections(location, delivery) }
      ]
    );
  };

  // Recenter map
  const recenterMap = () => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: isNavigationMode ? 17 : 15,
        heading: isNavigationMode ? heading : 0,
        pitch: isNavigationMode ? 45 : 0,
        animationDuration: 1000
      });
    }
  };

  // Toggle navigation mode
  const toggleNavigationMode = () => {
    setIsNavigationMode(!isNavigationMode);
    recenterMap();
  };

  // Take POD photo
  const takePodPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') throw new Error("Permission denied");

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
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Upload POD to Firebase
  const uploadPod = async () => {
    if (!podImage || !currentCompletedDelivery || !shipmentId) return;
    
    setUploadingPod(true);
    try {
      const filename = `POD_${currentCompletedDelivery.deliveryNumber}_${Date.now()}.jpg`;
      const blob = await (await fetch(podImage)).blob();
      const storageRef = ref(storage, `proof-of-delivery/${shipmentId}/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateDoc(
        doc(db, "Shipment", shipmentId, "deliveries", currentCompletedDelivery.id),
        { podImageUrl: downloadURL, podTimestamp: new Date().toISOString() }
      );
      
      setPodImage(null);
      setCurrentCompletedDelivery(null);
      setShowPODModal(false);
      Alert.alert("Success", "POD uploaded!");
    } catch (error) {
      Alert.alert("Error", "Failed to upload POD");
    } finally {
      setUploadingPod(false);
    }
  };

  if (loading || location.latitude === 0) {
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
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          rotateEnabled
          scrollEnabled
          zoomEnabled
          pitchEnabled
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [location.longitude, location.latitude],
              zoomLevel: 15
            }}
            followUserLocation={isNavigationMode}
            followUserMode={isNavigationMode ? 'compass' : 'normal'}
            followZoomLevel={isNavigationMode ? 17 : 15}
            followPitch={isNavigationMode ? 45 : 0}
          />

          {/* Current Location Marker */}
          <PointAnnotation
      id="userLocation"
      coordinate={[location.longitude, location.latitude]}
      anchor={{ x: 0.5, y: 0.5 }} // Corrected to use an object with `x` and `y` properties
    >
      <Animated.View style={[styles.markerContainer, styles.currentMarker]}>
        <Image
          source={currentLocationMarker}
          style={[
            styles.markerImage,
            isNavigationMode ? { transform: [{ rotate: `${heading}deg` }] } : {},
          ]}
          resizeMode="contain"
        />
        {!isNavigationMode && <View style={styles.pulse} />}
      </Animated.View>
    </PointAnnotation>
          {/* Delivery Markers */}
          {showDeliveries && deliveryOrder.map((delivery) => (
            <PointAnnotation
              key={delivery.id}
              id={`delivery-${delivery.id}`}
              coordinate={[delivery.longitude, delivery.latitude]}
              anchor={{ x: 0.5, y: 0.5 }}
              onSelected={() => handleDeliveryTap(delivery)}
            >
              <Animated.View style={[
                styles.markerContainer,
                selectedDelivery?.id === delivery.id ? styles.selectedMarker : styles.deliveryMarker
              ]}>
                <Image source={destinationMarker} style={styles.markerImage} resizeMode="contain" />
                <Text style={styles.markerText}>{delivery.customer.split(' ')[0]}</Text>
              </Animated.View>
            </PointAnnotation>
          ))}

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates.map(c => [c.longitude, c.latitude])
                },
                properties: {} // Add an empty properties object
              }}
            >
              <LineLayer
                id="routeFill"
                style={{
                  lineColor: '#F38301',
                  lineWidth: 6,
                  lineOpacity: 0.8
                }}
              />
            </ShapeSource>
          )}
        </Mapbox.MapView>

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
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#333" />
            {showRedDot && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleDeliveryRoute}
          >
            <MaterialIcons 
              name={showDeliveries ? "list" : "format-list-bulleted"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleNavigationMode}
          >
            <MaterialIcons 
              name={isNavigationMode ? "navigation" : "my-location"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Delivery List */}
        <Animated.View 
          style={[
            styles.deliveryListContainer,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
          ]}
        >
          <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']} style={styles.deliveryListGradient}>
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

        {/* POD Modal */}
        <Modal visible={showPODModal} animationType="slide">
          <View style={styles.podModalContainer}>
            <View style={styles.podModalHeader}>
              <Text style={styles.podModalTitle}>Proof of Delivery</Text>
              <Text style={styles.podModalSubtitle}>
                Delivery #{currentCompletedDelivery?.deliveryNumber} - {currentCompletedDelivery?.customer}
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

        {/* Loading Overlay */}
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
    flex: 1,
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
  podInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationScreen;
