// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc
// } from "firebase/firestore";
// import { app } from "../firebase";
// import StepIndicator from "react-native-step-indicator";

// const db = getFirestore(app);

// const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
// const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

// const customStyles = {
//   stepIndicatorSize: 30,
//   currentStepIndicatorSize: 40,
//   separatorStrokeWidth: 2,
//   currentStepStrokeWidth: 3,
//   stepStrokeCurrentColor: "#F6984C",
//   stepStrokeWidth: 3,
//   stepStrokeFinishedColor: "#F6984C",
//   stepStrokeUnFinishedColor: "#aaaaaa",
//   separatorFinishedColor: "#F6984C",
//   separatorUnFinishedColor: "#aaaaaa",
//   stepIndicatorFinishedColor: "#F6984C",
//   stepIndicatorUnFinishedColor: "#ffffff",
//   stepIndicatorCurrentColor: "#ffffff",
//   stepIndicatorLabelFontSize: 13,
//   currentStepIndicatorLabelFontSize: 13,
//   stepIndicatorLabelCurrentColor: "#F6984C",
//   stepIndicatorLabelFinishedColor: "#ffffff",
//   stepIndicatorLabelUnFinishedColor: "#aaaaaa",
//   labelColor: "#999999",
//   labelSize: 13,
//   currentStepLabelColor: "#fe7013",
// };

// export default function Dashboard() {
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [collectionName, setCollectionName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [deliveryNumber, setDeliveryNumber] = useState<string | null>(null);
//   const [statusId, setStatusId] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   const fetchUserDetails = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (!phoneNumber) {
//         Alert.alert("Error", "No phone number found. Please log in again.");
//         return;
//       }

//       for (const colName of collections) {
//         const userQuery = query(
//           collection(db, colName),
//           where("phoneNumber", "==", phoneNumber)
//         );
//         const querySnapshot = await getDocs(userQuery);

//         if (!querySnapshot.empty) {
//           const userDoc = querySnapshot.docs[0].data();
//           setDisplayName(userDoc.name || "Unknown User");
//           setCollectionName(colName);
//           break;
//         }
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//     }
//   };

//   const fetchDeliveryDetails = async () => {
//     if (!displayName) return;
  
//     try {
//       console.log("Fetching delivery details...");
//       console.log("Display Name:", displayName);
  
//       const shipmentQuery = query(collection(db, "Shipment"));
//       const shipmentSnapshot = await getDocs(shipmentQuery);
  
//       for (const shipmentDoc of shipmentSnapshot.docs) {
//         const shipmentData = shipmentDoc.data();
//         console.log("Shipment Document:", shipmentData);
  
//         const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//         const deliveriesQuery = query(
//           deliveriesRef,
//           where("customer", "==", displayName)
//         );
  
//         const deliveriesSnapshot = await getDocs(deliveriesQuery);
//         console.log("Deliveries Snapshot Size:", deliveriesSnapshot.size);
  
//         if (!deliveriesSnapshot.empty) {
//           const deliveryDoc = deliveriesSnapshot.docs[0].data();
//           console.log("Delivery Document:", deliveryDoc);
  
//           setDeliveryNumber(deliveryDoc.deliveryNumber || "N/A");
//           setStatusId(shipmentData.statusId || 0);
//           return; // Stop looping after finding the first match
//         }
//       }
  
//       console.log("No matching delivery found.");
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
//       console.error(error);
//     }
//   };
//   // Add these to the Dashboard component
// const handleDeliverButtonPress = async () => {
//   if (!deliveryNumber) {
//     Alert.alert("Error", "Please provide a delivery number.");
//     return;
//   }

//   try {
//     // Find the current shipment containing this delivery
//     const shipmentQuery = query(collection(db, "Shipment"));
//     const shipmentSnapshot = await getDocs(shipmentQuery);

//     for (const shipmentDoc of shipmentSnapshot.docs) {
//       const shipmentData = shipmentDoc.data();

//       const deliveriesRef = collection(
//         db,
//         "Shipment",
//         shipmentDoc.id,
//         "deliveries"
//       );

//       // Get the specific delivery with the entered deliveryNumber
//       const deliveryQuery = query(
//         deliveriesRef,
//         where("deliveryNumber", "==", deliveryNumber)
//       );
//       const deliverySnapshot = await getDocs(deliveryQuery);

//       if (deliverySnapshot.empty) {
//         Alert.alert("Error", "No matching delivery found.");
//         return;
//       }

//       const deliveryDoc = deliverySnapshot.docs[0];
//       const deliveryData = deliveryDoc.data();

//       // Ensure this delivery belongs to the current customer
//       if (deliveryData.customer !== displayName) {
//         Alert.alert("Error", "This delivery does not belong to the current customer.");
//         return;
//       }

//       // Update the delivery status to "completed"
//       await updateDoc(deliveryDoc.ref, { deliveryStatus: "completed" });

//       // Check if all deliveries for the shipment are completed
//       const allDeliveriesSnapshot = await getDocs(deliveriesRef);
//       const allDeliveries = allDeliveriesSnapshot.docs.map((doc) => doc.data());
//       const allCompleted = allDeliveries.every(
//         (delivery) => delivery.deliveryStatus === "completed"
//       );

//       if (allCompleted) {
//         // Update the shipment statusId to 4
//         await updateDoc(doc(db, "Shipment", shipmentDoc.id), { statusId: 4 });
//         Alert.alert("Success", "All deliveries completed. Shipment marked as delivered.");
//       } else {
//         // Indicate there are still incomplete deliveries
//         Alert.alert(
//           "Pending Deliveries",
//           "There are still deliveries pending completions."
//         );
//       }
//     }
//   } catch (error:any) {
//     Alert.alert("Error", `Failed to update delivery: ${error.message}`);
//   }
// };
  

//   const fetchAllData = async () => {
//     setLoading(true);
//     await fetchUserDetails();
//     await fetchDeliveryDetails();
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//         <View style={styles.container}>
      
//       <View style={styles.TopNav}>
//         <View style={styles.leftNav}>
//           <View
//             style={{
//               flexDirection: "row",
//               width: "100%",
//               height: "50%",
//               alignItems: "center",
//             }}
//           >
//             <Image
//               source={require("../../assets/images/Aisha5.jpeg")}
//               resizeMode="cover"
//               style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
//             />
//             <View style={{ flexDirection: "column" }}>
//               <Text style={{ fontWeight: "600", marginBottom: 3 }}>
//                 Hi, {displayName}
//               </Text>
//               <TouchableOpacity>
//                 <Text>Edit my Profile</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View
//             style={{
//               width: "100%",
//               height: "50%",
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 backgroundColor: "#EDEBEB",
//                 borderRadius: 20,
//                 margin: 5,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Image
//                 source={require("../../assets/images/Pin.png")}
//                 resizeMode="cover"
//                 style={{ width: 20, height: 20 }}
//               />
//             </View>
//             <View style={{ flexDirection: "column" }}>
//               <Text style={{ fontWeight: "600", marginBottom: 3 }}>
//                 Your location
//               </Text>
//               <TouchableOpacity>
//                 <Text>Home</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//         <View style={styles.rightNav}>
//           <View
//             style={{
//               flexDirection: "row",
//               width: "100%",
//               height: "46%",
//               alignItems: "center",
//               backgroundColor: "#f4f4f4",
//               borderRadius: 30,
//             }}
//           >
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 backgroundColor: "#EDEBEB",
//                 borderRadius: 20,
//                 margin: 5,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Image
//                 source={require("../../assets/images/Trackk.png")}
//                 resizeMode="cover"
//                 style={{ width: 20, height: 20 }}
//               />
//             </View>
//             <View style={{ flexDirection: "column" }}>
//               <Text style={{ fontWeight: "600", marginBottom: 3 }}>
//                 Track Delivery
//               </Text>
//               <TouchableOpacity>
//                 <Text>Track by ID</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View
//             style={{
//               width: "100%",
//               height: "46%",
//               flexDirection: "row",
//               alignItems: "center",
//               backgroundColor: "#f4f4f4",
//               borderRadius: 30,
//             }}
//           >
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 backgroundColor: "#F6984C",
//                 borderRadius: 20,
//                 margin: 5,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Image
//                 source={require("../../assets/images/Support.png")}
//                 resizeMode="cover"
//                 style={{ width: 20, height: 20}}
//               />
//             </View>
//             <View style={{ flexDirection: "column" }}>
//               <TouchableOpacity>
//                 <Text>Support Desk</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//       {/*Scroll View will live here */}
//       <ScrollView style={{ width: "100%", height: "70%" }}>
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
//         <View
//           style={{
//             width: "100%",
//             height: 300,
//             backgroundColor: "#f4f4f4",
//             borderRadius: 20,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               height: "30%",
//               width: "100%",
//               alignItems: "center",
//               justifyContent: "space-around",
//               marginTop: 10,
//             }}
//           >
//             <View
//               style={{ width: "60%", height: "100%", justifyContent: "center" }}
//             >
//               <Text
//                 style={{ fontSize: 20, fontWeight: "400", marginBottom: 10 }}
//               >
//                 Incoming Deliveries
//               </Text>
//               <Text style={{ fontSize: 35}}>{deliveryNumber||"No Delivery"}</Text>
//             </View>
//             <View
//               style={{
//                 width: "30%",
//                 height: "40%",
//                 backgroundColor: "#F6984C",
//                 borderRadius: 20,
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}
//             >
//               <TouchableOpacity>
//                 <Text style={{ color: "white" }}>View on Map</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//             <View style={{width:'100%', height: '30%', marginTop: 20, justifyContent:'center'}}>
//             <StepIndicator
//             customStyles={customStyles}
//             currentPosition={statusId ? parseInt(statusId) : undefined} // Change this index based on the current progress
//             labels={labels}
//             stepCount={4}
//           />
//             </View>
//           <View style={{width:'100%', height: '25%', position:'absolute', bottom:0, flexDirection: 'row'}}>
//             <View style={{width:'50%', height: '100%',justifyContent:'center', alignItems: 'center'}}>
//               <Text style={{fontWeight:'600', marginBottom:10}}>Delivery Origin</Text>
//               <Text>Delivery Date</Text>
//             </View>
//             <View style={{width:'50%', height: '100%', justifyContent:'center', alignItems: 'center'}}>
//             <Text style={{fontWeight:'600', marginBottom:10}}>Delivery Destination</Text>
//             <Text>Delivery Date</Text>
//             </View>
//           </View>
//         </View>
//         <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
//   <TouchableOpacity
//     style={{
//       backgroundColor: "#4CAF50",
//       padding: 10,
//       borderRadius: 5,
//     }}
//     onPress={handleDeliverButtonPress}
//   >
//     <Text style={{ color: "#fff" }}>Deliver</Text>
//   </TouchableOpacity>
// </View>
//       </ScrollView>
//     </View>

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     //justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor:'#fff'
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   info: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   label: {
//     fontWeight: "bold",
//   },
//   TopNav: {
//     flexDirection: "row",
//     width: "100%",
//     height: "30%",
//     justifyContent: "space-between",
//     //backgroundColor: 'green',
//     alignItems: "center",
//   },
//   leftNav: {
//     backgroundColor: "#f4f4f4",
//     width: "48%",
//     height: "60%",
//     borderRadius: 30,
//   },
//   rightNav: {
//     //backgroundColor:'#f4f4f4',
//     width: "48%",
//     height: "60%",
//     borderRadius: 30,
//     justifyContent: "space-between",
//   },
// });

// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import StepIndicator from "react-native-step-indicator";

// const db = getFirestore(app);

// const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
// const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

// const customStyles = {
//   stepIndicatorSize: 30,
//   currentStepIndicatorSize: 40,
//   separatorStrokeWidth: 2,
//   currentStepStrokeWidth: 3,
//   stepStrokeCurrentColor: "#F6984C",
//   stepStrokeWidth: 3,
//   stepStrokeFinishedColor: "#F6984C",
//   stepStrokeUnFinishedColor: "#aaaaaa",
//   separatorFinishedColor: "#F6984C",
//   separatorUnFinishedColor: "#aaaaaa",
//   stepIndicatorFinishedColor: "#F6984C",
//   stepIndicatorUnFinishedColor: "#ffffff",
//   stepIndicatorCurrentColor: "#ffffff",
//   stepIndicatorLabelFontSize: 13,
//   currentStepIndicatorLabelFontSize: 13,
//   stepIndicatorLabelCurrentColor: "#F6984C",
//   stepIndicatorLabelFinishedColor: "#ffffff",
//   stepIndicatorLabelUnFinishedColor: "#aaaaaa",
//   labelColor: "#999999",
//   labelSize: 13,
//   currentStepLabelColor: "#fe7013",
// };

// export default function Dashboard() {
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [deliveryNumber, setDeliveryNumber] = useState<string | null>(null);
//   const [statusId, setStatusId] = useState<number | null>(null);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   const fetchUserDetails = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (!phoneNumber) {
//         Alert.alert("Error", "No phone number found. Please log in again.");
//         return;
//       }

//       for (const colName of collections) {
//         const userQuery = query(
//           collection(db, colName),
//           where("phoneNumber", "==", phoneNumber)
//         );
//         const querySnapshot = await getDocs(userQuery);

//         if (!querySnapshot.empty) {
//           const userDoc = querySnapshot.docs[0].data();
//           setDisplayName(userDoc.name || "Unknown User");
//           break;
//         }
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//     }
//   };

//   const fetchDeliveryDetails = async () => {
//     if (!displayName) return;

//     try {
//       const shipmentQuery = query(collection(db, "Shipment"));
//       const shipmentSnapshot = await getDocs(shipmentQuery);

//       for (const shipmentDoc of shipmentSnapshot.docs) {
//         const shipmentData = shipmentDoc.data();

//         const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//         const deliveriesQuery = query(
//           deliveriesRef,
//           where("customer", "==", displayName)
//         );

//         const deliveriesSnapshot = await getDocs(deliveriesQuery);

//         if (!deliveriesSnapshot.empty) {
//           const deliveries = deliveriesSnapshot.docs.map((doc) => doc.data());
//           const allDelivered = deliveries.every((d) => d.statusId === 4);

//           setDeliveryNumber(deliveries[0].deliveryNumber || "N/A");
//           setStatusId(shipmentData.statusId || 0);

//           if (allDelivered) {
//             // Update shipment status to "Delivered" (4)
//             await updateDoc(doc(db, "Shipment", shipmentDoc.id), { statusId: 4 });
//           }
//           return;
//         }
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
//     }
//   };

//   const fetchAllData = async () => {
//     setLoading(true);
//     await fetchUserDetails();
//     await fetchDeliveryDetails();
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.TopNav}>
//         <View style={styles.leftNav}>
//           <Image
//             source={require("../../assets/images/Aisha5.jpeg")}
//             resizeMode="cover"
//             style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
//           />
//           <Text style={{ fontWeight: "600" }}>Hi, {displayName}</Text>
//         </View>
//       </View>

//       <ScrollView
//         style={{ width: "100%" }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.card}>
//           <Text style={styles.title}>Incoming Deliveries</Text>
//           <Text style={styles.deliveryNumber}>{deliveryNumber || "No Delivery"}</Text>

//           <StepIndicator
//             customStyles={customStyles}
//             currentPosition={statusId ?? 0}
//             labels={labels}
//             stepCount={4}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   TopNav: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   leftNav: { flexDirection: "row", alignItems: "center" },
//   card: {
//     backgroundColor: "#f4f4f4",
//     padding: 20,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   deliveryNumber: { fontSize: 30, fontWeight: "bold" },
// });

{/* comment here */}

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import StepIndicator from "react-native-step-indicator";
import { app } from "../firebase";

const db = getFirestore(app);

const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);

  const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#F6984C",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "#F6984C",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#F6984C",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#F6984C",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#F6984C",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 13,
  currentStepLabelColor: "#fe7013",
};

  const fetchUserDetails = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (!phoneNumber) {
        Alert.alert("Error", "No phone number found. Please log in again.");
        return;
      }

      for (const colName of collections) {
        const userQuery = query(
          collection(db, colName),
          where("phoneNumber", "==", phoneNumber)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          
          const userDoc = querySnapshot.docs[0].data();
          setDisplayName(userDoc.name || "Unknown User");
          break;
        }
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch user detail: ${error.message}`);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (displayName) {
      fetchDeliveryDetails();
    }
  }, [displayName]);

  const fetchDeliveryDetails = async () => {
    if (!displayName) return;

    try {
      const shipmentQuery = query(collection(db, "Shipment"));
      const shipmentSnapshot = await getDocs(shipmentQuery);

      const pending: any[] = [];
      const completed: any[] = [];

      for (const shipmentDoc of shipmentSnapshot.docs) {
        const shipmentData = shipmentDoc.data();

        const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
        const deliveriesQuery = query(
          deliveriesRef,
          where("customer", "==", displayName)
        );

        const deliveriesSnapshot = await getDocs(deliveriesQuery);

        

        deliveriesSnapshot.forEach((doc) => {
          const delivery:any = { id: doc.id, ...doc.data(), shipmentId: shipmentDoc.id };
          if (delivery.statusId === 3) {
            pending.push(delivery);
          } else if (delivery.statusId === 4) {
            completed.push(delivery);
          }
        });
      }

      setPendingDeliveries(pending);
      setCompletedDeliveries(completed);
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
    }
  };

  const markAsReceived = async (delivery: any) => {
    try {
      const deliveryRef = doc(
        db,
        "Shipment",
        delivery.shipmentId,
        "deliveries",
        delivery.id
      );
      await updateDoc(deliveryRef, { statusId: 4 });

      setPendingDeliveries((prev) =>
        prev.filter((item) => item.id !== delivery.id)
      );
      setCompletedDeliveries((prev) => [delivery, ...prev]);
    } catch (error: any) {
      Alert.alert("Error", `Failed to update delivery: ${error.message}`);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await fetchUserDetails();
    await fetchDeliveryDetails();
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);



  const onRefresh = useCallback(async () => {
    //setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    await fetchUserDetails();
    await fetchDeliveryDetails();
  }, []);

    const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => (
    <View style={styles.deliveryItem}>
      <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={item.statusId}
        labels={labels}
        stepCount={4}
      />
      {isPending && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => markAsReceived(item)}
        >
          <Text style={styles.buttonText}>Received</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.TopNav}>
        <View style={styles.leftNav}>
          <Image
            source={require("../../assets/images/Aisha5.jpeg")}
            resizeMode="cover"
            style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
          />
          <Text style={{ fontWeight: "600" }}>Hi, {displayName}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pending Deliveries</Text>
      <FlatList
       data={pendingDeliveries}
       keyExtractor={(item) => `${item.shipmentId}-${item.id}`}
       renderItem={(item) => renderDeliveryItem(item, true)}
       refreshControl={
         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
       }
      />

      <Text style={styles.sectionTitle}>Completed Transactions</Text>
      <FlatList
        data={completedDeliveries}
        keyExtractor={(item) => `${item.shipmentId}-${item.id}`}
        renderItem={(item) => renderDeliveryItem(item, false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  TopNav: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  leftNav: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
    deliveryItem: {
    flexDirection: "column",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deliveryNumber: { fontSize: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#F6984C",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});




// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   RefreshControl,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   onSnapshot,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import StepIndicator from "react-native-step-indicator";
// import { app } from "../firebase";

// const db = getFirestore(app);

// const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
// const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

// export default function Dashboard() {
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
//   const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);

//   const customStyles = {
//   stepIndicatorSize: 30,
//   currentStepIndicatorSize: 40,
//   separatorStrokeWidth: 2,
//   currentStepStrokeWidth: 3,
//   stepStrokeCurrentColor: "#F6984C",
//   stepStrokeWidth: 3,
//   stepStrokeFinishedColor: "#F6984C",
//   stepStrokeUnFinishedColor: "#aaaaaa",
//   separatorFinishedColor: "#F6984C",
//   separatorUnFinishedColor: "#aaaaaa",
//   stepIndicatorFinishedColor: "#F6984C",
//   stepIndicatorUnFinishedColor: "#ffffff",
//   stepIndicatorCurrentColor: "#ffffff",
//   stepIndicatorLabelFontSize: 13,
//   currentStepIndicatorLabelFontSize: 13,
//   stepIndicatorLabelCurrentColor: "#F6984C",
//   stepIndicatorLabelFinishedColor: "#ffffff",
//   stepIndicatorLabelUnFinishedColor: "#aaaaaa",
//   labelColor: "#999999",
//   labelSize: 13,
//   currentStepLabelColor: "#fe7013",
// };

//   const fetchUserDetails = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (!phoneNumber) {
//         Alert.alert("Error", "No phone number found. Please log in again.");
//         return;
//       }

//       for (const colName of collections) {
//         const userQuery = query(
//           collection(db, colName),
//           where("phoneNumber", "==", phoneNumber)
//         );
//         const unsubscribe = onSnapshot(userQuery, (snapshot) => {
//           if (!snapshot.empty) {
//             const userDoc = snapshot.docs[0].data();
//             setDisplayName(userDoc.name || "Unknown User");
//           }
//         });
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//     }
//   };

//   const fetchDeliveryDetails = () => {
//     if (!displayName) return;

//     const shipmentsRef = collection(db, "Shipment");
//     const shipmentQuery = query(shipmentsRef);

//     const unsubscribe = onSnapshot(shipmentQuery, (shipmentSnapshot) => {
//       const pending: any[] = [];
//       const completed: any[] = [];

//       shipmentSnapshot.forEach((shipmentDoc) => {
//         const shipmentData = shipmentDoc.data();
//         const deliveriesRef = collection(
//           db,
//           "Shipment",
//           shipmentDoc.id,
//           "deliveries"
//         );
//         const deliveriesQuery = query(
//           deliveriesRef,
//           where("customer", "==", displayName)
//         );

//         onSnapshot(deliveriesQuery, (deliveriesSnapshot) => {
//           deliveriesSnapshot.forEach((doc) => {
//             const delivery: any = {
//               id: doc.id,
//               ...doc.data(),
//               shipmentId: shipmentDoc.id,
//             };

//             if (delivery.statusId === 4) {
//               completed.push(delivery);
//             } else {
//               pending.push(delivery);
//             }
//           });

          

//           setPendingDeliveries(pending);
//           setCompletedDeliveries(completed);
//         });
//       });
//     });
//     return () => unsubscribe();
//   };

//   const markAsReceived = async (delivery: any) => {
//     try {
//       const deliveryRef = doc(
//         db,
//         "Shipment",
//         delivery.shipmentId,
//         "deliveries",
//         delivery.id
//       );
//       await updateDoc(deliveryRef, { statusId: 4 });
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to update delivery: ${error.message}`);
//     }
//   };

//   const fetchAllData = async () => {
//     setLoading(true);
//     await fetchUserDetails();
//     fetchDeliveryDetails();
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [displayName]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   }, []);

//   const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => (
//     <View style={styles.deliveryItem}>
//       <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
//       <StepIndicator
//         customStyles={customStyles}
//         currentPosition={item.statusId}
//         labels={labels}
//         stepCount={4}
//       />
//       {isPending && (
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => markAsReceived(item)}
//         >
//           <Text style={styles.buttonText}>Received</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.TopNav}>
//         <View style={styles.leftNav}>
//           <Image
//             source={require("../../assets/images/Aisha5.jpeg")}
//             resizeMode="cover"
//             style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
//           />
//           <Text style={{ fontWeight: "600" }}>Hello, {displayName}</Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Pending Deliveries</Text>
//       <FlatList
//         data={pendingDeliveries}
//         keyExtractor={(item) => item.id}
//         renderItem={(item) => renderDeliveryItem(item, true)}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       />

//       <Text style={styles.sectionTitle}>Completed Transactions</Text>
//       <FlatList
//         data={completedDeliveries}
//         keyExtractor={(item) => item.id}
//         renderItem={(item) => renderDeliveryItem(item, false)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   TopNav: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   leftNav: { flexDirection: "row", alignItems: "center" },
//   sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
//   deliveryItem: {
//     flexDirection: "column",
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   deliveryNumber: { fontSize: 16, fontWeight: "600" },
//   button: {
//     backgroundColor: "#F6984C",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
// });



// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   RefreshControl,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { app } from "../firebase";

// const db = getFirestore(app);

// const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
// const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

// export default function Dashboard() {
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
//   const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState<any[]>([]);

//   const fetchUserDetails = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (!phoneNumber) {
//         Alert.alert("Error", "No phone number found. Please log in again.");
//         return;
//       }

//       for (const colName of collections) {
//         const userQuery = query(
//           collection(db, colName),
//           where("phoneNumber", "==", phoneNumber)
//         );
//         const querySnapshot = await getDocs(userQuery);

//         if (!querySnapshot.empty) {
//           const userDoc = querySnapshot.docs[0].data();
//           setDisplayName(userDoc.name || "Unknown User");
//           break;
//         }
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//     }
//   };

//   const fetchDeliveryDetails = async () => {
//     if (!displayName) return;

//     try {
//       const shipmentQuery = query(collection(db, "Shipment"));
//       const shipmentSnapshot = await getDocs(shipmentQuery);

//       const pending: any[] = [];
//       const completed: any[] = [];

//       for (const shipmentDoc of shipmentSnapshot.docs) {
//         const shipmentData = shipmentDoc.data();

//         const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//         const deliveriesQuery = query(
//           deliveriesRef,
//           where("customer", "==", displayName)
//         );

//         const deliveriesSnapshot = await getDocs(deliveriesQuery);

//         deliveriesSnapshot.forEach((doc) => {
//           const delivery: any = { id: doc.id, ...doc.data(), shipmentId: shipmentDoc.id };
//           if (delivery.statusId === 4) {
//             completed.push(delivery);
//           } else {
//             pending.push(delivery);
//           }
//         });
//       }

//       setPendingDeliveries(pending);
//       setCompletedDeliveries(completed);
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
//     }
//   };

//   const fetchDeliveryMaterials = async (delivery: any) => {
//     try {
//       const materialsRef = collection(
//         db,
//         "Shipment",
//         delivery.shipmentId,
//         "deliveries",
//         delivery.id,
//         "materials"
//       );
//       const materialsSnapshot = await getDocs(materialsRef);
//       const materials = materialsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setSelectedDeliveryDetails(materials);
//       setIsModalVisible(true);
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch delivery materials: ${error.message}`);
//     }
//   };

//   const fetchAllData = async () => {
//     setLoading(true);
//     await fetchUserDetails();
//     await fetchDeliveryDetails();
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   }, []);

//   const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => (
//     <TouchableOpacity onPress={() => fetchDeliveryMaterials(item)}>
//       <View style={styles.deliveryItem}>
//         <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
//         <Text>Status: {labels[item.statusId]}</Text>
//         {isPending && (
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => markAsReceived(item)}
//           >
//             <Text style={styles.buttonText}>Received</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.TopNav}>
//         <View style={styles.leftNav}>
//           <Image
//             source={require("../../assets/images/Aisha5.jpeg")}
//             resizeMode="cover"
//             style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
//           />
//           <Text style={{ fontWeight: "600" }}>Hello, {displayName}</Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Pending Deliveries</Text>
//       <FlatList
//         data={pendingDeliveries}
//         keyExtractor={(item) => item.id}
//         renderItem={(item) => renderDeliveryItem(item, true)}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       />

//       <Text style={styles.sectionTitle}>Completed Transactions</Text>
//       <FlatList
//         data={completedDeliveries}
//         keyExtractor={(item) => item.id}
//         renderItem={(item) => renderDeliveryItem(item, false)}
//       />

//       {/* Modal for Delivery Details */}
//       <Modal visible={isModalVisible} transparent={true} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Delivery Details</Text>
//           <View style={styles.tableHeader}>
//             <Text style={styles.tableHeaderCell}>Material</Text>
//             <Text style={styles.tableHeaderCell}>Quantity</Text>
//           </View>
//           <FlatList
//             data={selectedDeliveryDetails}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.tableRow}>
//                 <Text style={styles.tableCell}>{item.materialName}</Text>
//                 <Text style={styles.tableCell}>{item.quantity}</Text>
//               </View>
//             )}
//           />
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsModalVisible(false)}
//           >
//             <Text style={styles.closeButtonText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   tableHeader: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   tableHeaderCell: { fontWeight: "bold", flex: 1, textAlign: "center" },
//   tableRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 5 },
//   tableCell: { flex: 1, textAlign: "center" },
//   closeButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: "#F6984C",
//     borderRadius: 5,
//   },
//   closeButtonText: { color: "#fff", fontWeight: "bold" },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   TopNav: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   leftNav: { flexDirection: "row", alignItems: "center" },
//   sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
//   deliveryItem: {
//     flexDirection: "column",
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   deliveryNumber: { fontSize: 16, fontWeight: "600" },
//   button: {
//     backgroundColor: "#F6984C",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  
// });
