// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
//   Button,
//   ActivityIndicator,
//   Image
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { onSnapshot, query, where, updateDoc, getFirestore, collection, doc, getDocs } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// const NotificationScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState(""); 
//   const [shipmentDisplayName, setShipmentDisplayName] = useState<string>("");
//   const [driverName, setDriverName] = useState<string>("");
//   const [assignedVanNo, setAssignedVanNo] = useState<string>("");
//   const [vehicleNo, setVehicleNo] = useState<string>("");

//   // Fetch phone number from AsyncStorage
//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       try {
//         const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!storedPhoneNumber) {
//           Alert.alert("Error", "No phone number found. Please log in again.");
//           return;
//         }
//         setPhoneNumber(storedPhoneNumber);
//         console.log("Fetched phoneNumber:", storedPhoneNumber);
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
//       }
//     };

//     fetchPhoneNumber();
//   }, []);

//   // Fetch deliverDriver from Firestore
//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchDeliverDriver = async () => {
//       try {
//         const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
//         const querySnapshot = await getDocs(usersQuery);

//         if (!querySnapshot.empty) {
//           const userData = querySnapshot.docs[0].data();
//           console.log("userData:", userData);
//           setDeliverDriver(userData.phoneNumber || null);
//           setAssignedVanNo(userData.AssignedVanNo || "");
//           console.log("Fetched deliverDriver:", userData.name);
//           console.log("Fetched vehicleNo:", userData.AssignedVanNo);
//         } else {
//           console.log("No user found with this phoneNumber.");
          
//         }
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
//       } finally {
//         setLoading(false)
//       }
//     };

//     fetchDeliverDriver();
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (!deliverDriver || !assignedVanNo) return; // Ensure dependencies exist before setting the listener
  
//     console.log("Listening for shipments:", { deliverDriver, assignedVanNo });
  
//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", deliverDriver),
//       where("vehicleNo", "==", assignedVanNo)
//     );
  
//     const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
//       console.log("Snapshot triggered:", querySnapshot.size);
  
//       let foundActiveShipment = false;
  
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.statusId === 2) {
//           foundActiveShipment = true;
//           setShipmentId(doc.id);
//           setShipmentDisplayName(data.mobileNumber);
//           setDriverName(data.driverName);
//           setAssignedVanNo(data.assignedVanNo);
//           console.log("Active shipment found:", doc.id, data);
//         }
//       });
  
//       setShowRedDot(foundActiveShipment);
//       setLoading(false); // Ensure loading state is updated
//     });
  
//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, [deliverDriver, assignedVanNo]); // Depend on deliverDriver and assignedVanNo
  

//   const handleAccept = async () => {
//     try {
//       if (shipmentId) {
//         const shipmentDocRef = doc(db, "Shipment", shipmentId);
//         await updateDoc(shipmentDocRef, { statusId: 3 });
//         Alert.alert("Success", "Shipment accepted.");
//         setIsModalVisible(false);
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to update shipment: ${error.message}`);
//     }
//   };

//   const handleDecline = () => {
//     Alert.alert("Declined", "You have declined the shipment.");
//     setIsModalVisible(false);
//   };

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="orange" />
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.iconContainer}>
//         <TouchableOpacity style={styles.icon} onPress={() => shipmentId && setIsModalVisible(true)}>
//           <Image source={require("../../assets/images/notifications.png")} style={{width: 30, height:30}} />
//           {showRedDot && <View style={styles.redDot} />}
//         </TouchableOpacity>
//       </View>
//       {shipmentDisplayName ? <Text>📦 {shipmentDisplayName}</Text> : <Text>No shipments available.</Text>}
//       <TouchableOpacity onPress={()=>router.navigate("/driver/shipmentScreen")}>
//         <Text>View all shipments</Text>
//       </TouchableOpacity>
//       <Text>Driver: {deliverDriver}</Text>
//       <Text>Assigned Van No: {assignedVanNo}</Text>

//       <Modal visible={isModalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalText}>Do you accept this shipment?</Text>
//           <View style={styles.buttonContainer}>
//             <Button title="Accept" onPress={handleAccept} />
//             <Button title="Decline" onPress={handleDecline} />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     marginTop: 30,
//   },
//   iconContainer: {
//     position: "relative",
//     width: "100%",
//     alignItems: "flex-end",
//     backgroundColor: "#fff",
//   },
//   icon: {
//     width: 40,
//     height: 40,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 20,
//   },
//   redDot: {
//     width: 10,
//     height: 10,
//     backgroundColor: "red",
//     borderRadius: 5,
//     position: "absolute",
//     top: 5,
//     right: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalText: {
//     fontSize: 18,
//     marginBottom: 20,
//     color: "white",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "80%",
//   },
// });

// export default NotificationScreen;

import React, { useEffect, useState } from "react";
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
  setDoc
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps"; // Native Maps
import { GoogleMap, LoadScript, Marker as WebMarker } from "@react-google-maps/api"; // Web Maps
import * as Location from "expo-location";

const db = getFirestore(app);
const MAPS_API_KEY = "YAIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

const NotificationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState<boolean>(false);

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
        if (data.statusId === 2) {
          activeShipment = { id: doc.id, ...data };
        }
      });

      if (activeShipment) {
        setShipmentId(activeShipment.id);
        setShipmentData(activeShipment);
        setShowRedDot(true);
      } else {
        setShowRedDot(false);
      }
    });

    return () => unsubscribe();
  }, [deliverDriver]);

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
          console.log("Mobile Location Permission:", status);
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
      startTracking();
    } catch (error: any) {
      Alert.alert("Error", `Failed to update shipment: ${error.message}`);
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "You have declined the shipment.");
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
        </MapView>
      )}

      {/* Notification Icon */}
      <TouchableOpacity style={styles.notificationIcon} onPress={() => shipmentId && setIsModalVisible(true)}>
        <Image source={require("../../assets/images/notifications.png")} style={{ width: 40, height: 40 }} />
        {showRedDot && <View style={styles.redDot} />}
      </TouchableOpacity>

      {/* Modal for Shipment Details */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Shipment Number: <Text style={{ fontWeight: "bold" }}>{shipmentData?.id}</Text></Text>
          <Text>Pick-up point: {shipmentData?.route1}</Text>
          <Text>Destination: {shipmentData?.route2}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Accept</Text>
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
  redDot: { width: 10, height: 10, backgroundColor: "red", borderRadius: 5, position: "absolute", top: 0, right: 0 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  buttonContainer: { flexDirection: "row", gap: 20 },
  rejectButton: { backgroundColor: "red", padding: 15, borderRadius: 10 },
  acceptButton: { backgroundColor: "green", padding: 15, borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
});

export default NotificationScreen;
