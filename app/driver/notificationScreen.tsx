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
// import { onSnapshot, query, where, updateDoc, getFirestore, collection, doc } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// const NotificationScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showRedDot, setShowRedDot] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [shipmentId, setShipmentId] = useState(""); // Shipment with statusId == 2
//   const [shipmentDisplayName, setShipmentDisplayName] = useState<string>("");
//   const [driverName, setDriverName] = useState<string>("");
//   const [assignedVanNo, setAssignedVanNo] = useState<string>("");

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

//   // Listen for real-time shipment updates
//   useEffect(() => {
//     if (!phoneNumber) return;

//     const shipmentsQuery = query(
//       collection(db, "Shipment"),
//       where("mobileNumber", "==", phoneNumber),
//       where("statusId", "==", 2)
//     );

//     const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
//       if (!querySnapshot.empty) {
//         const shipment = querySnapshot.docs[0]; // Assuming one shipment per user
//         setShipmentId(shipment.id);
//         setShipmentDisplayName(shipment.data().mobileNumber);
//         setDriverName(shipment.data().driverName);
//         setShowRedDot(true);
//         console.log("Shipment found:", shipment.id, shipment.data());
//       } else {
//         setShowRedDot(false);
//         setShipmentId("");
//         console.log("No shipments found for phoneNumber:", phoneNumber);
//       }
//       setLoading(false); // Mark loading as false once the query executes
//     });

//     return () => unsubscribe();
//   }, [phoneNumber]);

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
//       {/* Notification Icon */}
//       <View
//         style={styles.iconContainer}
        
//       >
//         <TouchableOpacity style={styles.icon} onPress={() => shipmentId && setIsModalVisible(true)}>
//           <Image source={require("../../assets/images/notifications.png")} style={{width: 30, height:30}} />
//           {showRedDot && <View style={styles.redDot} />}
//         </TouchableOpacity>
//         </View>
//       {shipmentDisplayName ? <Text>📦 {shipmentDisplayName}</Text> : <Text>No shipments available.</Text>}
//       <TouchableOpacity onPress={()=>router.navigate("/driver/shipmentScreen")}>
//         <Text>View all shipments</Text>
//       </TouchableOpacity>
//       <Text>Driver: {driverName}</Text>
//       <Text>{assignedVanNo}</Text>

//       {/* Modal for Accept/Decline */}
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
//     marginTop:30,
//   },
//   iconContainer: {
//     position: "relative",
//     width:'100%',
//     alignItems:'flex-end',
//     backgroundColor:'#fff'
//   },
//   icon: {
//     width: 40,
//     height: 40,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight:20
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
  Button,
  ActivityIndicator,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onSnapshot, query, where, updateDoc, getFirestore, collection, doc, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";

const db = getFirestore(app);

const NotificationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState(""); 
  const [shipmentDisplayName, setShipmentDisplayName] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [assignedVanNo, setAssignedVanNo] = useState<string>("");
  const [vehicleNo, setVehicleNo] = useState<string>("");

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
        console.log("Fetched phoneNumber:", storedPhoneNumber);
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
      }
    };

    fetchPhoneNumber();
  }, []);

  // Fetch deliverDriver from Firestore
  useEffect(() => {
    if (!phoneNumber) return;

    const fetchDeliverDriver = async () => {
      try {
        const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          console.log("userData:", userData);
          setDeliverDriver(userData.phoneNumber || null);
          setAssignedVanNo(userData.AssignedVanNo || "");
          console.log("Fetched deliverDriver:", userData.name);
          console.log("Fetched vehicleNo:", userData.AssignedVanNo);
        } else {
          console.log("No user found with this phoneNumber.");
          
        }
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
      }
    };

    fetchDeliverDriver();
  }, [phoneNumber]);

  // Listen for real-time shipment updates
  useEffect(() => {
    if (!deliverDriver || !vehicleNo) return;

    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", deliverDriver),
      where("vehicleNo", "==", assignedVanNo),
      where("statusId", "==", 2)
    );

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const shipment = querySnapshot.docs[0]; // Assuming one shipment per user
        setShipmentId(shipment.id);
        setShipmentDisplayName(shipment.data().mobileNumber);
        setDriverName(shipment.data().driverName);
        setAssignedVanNo(shipment.data().assignedVanNo);
        setShowRedDot(true);
        console.log("Shipment found:", shipment.id, shipment.data());
      } else {
        setShowRedDot(false);
        setShipmentId("");
        console.log("No shipments found for deliverDriver:", deliverDriver);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deliverDriver, vehicleNo]);

  const handleAccept = async () => {
    try {
      if (shipmentId) {
        const shipmentDocRef = doc(db, "Shipment", shipmentId);
        await updateDoc(shipmentDocRef, { statusId: 3 });
        Alert.alert("Success", "Shipment accepted.");
        setIsModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to update shipment: ${error.message}`);
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "You have declined the shipment.");
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.icon} onPress={() => shipmentId && setIsModalVisible(true)}>
          <Image source={require("../../assets/images/notifications.png")} style={{width: 30, height:30}} />
          {showRedDot && <View style={styles.redDot} />}
        </TouchableOpacity>
      </View>
      {shipmentDisplayName ? <Text>📦 {shipmentDisplayName}</Text> : <Text>No shipments available.</Text>}
      <TouchableOpacity onPress={()=>router.navigate("/driver/shipmentScreen")}>
        <Text>View all shipments</Text>
      </TouchableOpacity>
      <Text>Driver: {deliverDriver}</Text>
      <Text>Assigned Van No: {assignedVanNo}</Text>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Do you accept this shipment?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={handleAccept} />
            <Button title="Decline" onPress={handleDecline} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 30,
  },
  iconContainer: {
    position: "relative",
    width: "100%",
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    position: "absolute",
    top: 5,
    right: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
});

export default NotificationScreen;
