// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
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


  
  
//     const fetchUserDetails = async () => {
//       try {
//         // Get phone number from AsyncStorage
//         const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!phoneNumber) {
//           Alert.alert("Error", "No phone number found. Please log in again.");
//           return;
//         }

//         // Search through collections to find the user
//         for (const colName of collections) {
//           const userQuery = query(
//             collection(db, colName),
//             where("phoneNumber", "==", phoneNumber)
//           );
//           const querySnapshot = await getDocs(userQuery);

//           if (!querySnapshot.empty) {
//             const userDoc = querySnapshot.docs[0].data();
//             setDisplayName(userDoc.name || "Unknown User");
//             setCollectionName(colName);
//             break;
//           }
//         }

//         setLoading(false);
//       } catch (error: any) {
//         setLoading(false);
//         Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//       }
//     };

//     const fetchDeliveryDetails = async () => {
//       try {
//         if (!displayName) return;
    
//         const shipmentQuery = collection(db, "Shipment");
//         const shipmentSnapshot = await getDocs(shipmentQuery);
    
//         let deliveryNumber = "";
//         let statusId = "";
    
//         shipmentSnapshot.forEach(async (shipmentDoc) => {
//           const deliveriesCollection = collection(
//             db,
//             "Shipment",
//             shipmentDoc.id,
//             "deliveries"
//           );
//           const deliveriesQuery = query(
//             deliveriesCollection,
//             where("customer", "==", displayName)
//           );
//           const deliveriesSnapshot = await getDocs(deliveriesQuery);
    
//           if (!deliveriesSnapshot.empty) {
//             deliveriesSnapshot.forEach((deliveryDoc) => {
//               const deliveryData = deliveryDoc.data();
//               deliveryNumber = deliveryData.deliveryNumber;
//               statusId = shipmentDoc.data().statusId;
//             });
//           }
//         });
    
//         if (deliveryNumber && statusId) {
//           Alert.alert(
//             "Delivery Details",
//             `Delivery Number: ${deliveryNumber}\nStatus ID: ${statusId}`
//           );
//           console.log('e work?')
//         }
//       } catch (error:any) {
//         Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
//       }
//     };

//     useEffect(() => {
//       const fetchAllDetails = async () => {
//         await fetchUserDetails();
//         fetchDeliveryDetails();
//       };
    
//       fetchAllDetails();
//     }, []);
  
    
    



//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="orange" />
//       </View>
//     );
//   }

  

//   return (
//     <View style={styles.container}>
      
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
//               <Text style={{ fontSize: 35}}>W-R5432</Text>
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
//             currentPosition={1} // Change this index based on the current progress
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
//             <Text style={{fontWeight:'600', marginBottom:10}}>Delivery Origin</Text>
//             <Text>Delivery Date</Text>
//             </View>
//           </View>
//         </View>
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








// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
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

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         // Get phone number from AsyncStorage
//         const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!phoneNumber) {
//           Alert.alert("Error", "No phone number found. Please log in again.");
//           return;
//         }

//         // Search through collections to find the user
//         for (const colName of collections) {
//           const userQuery = query(
//             collection(db, colName),
//             where("phoneNumber", "==", phoneNumber)
//           );
//           const querySnapshot = await getDocs(userQuery);

//           if (!querySnapshot.empty) {
//             const userDoc = querySnapshot.docs[0].data();
//             setDisplayName(userDoc.name || "Unknown User");
//             setCollectionName(colName);
//             break;
//           }
//         }

//         setLoading(false);
//       } catch (error: any) {
//         setLoading(false);
//         Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
//       }
//     };

//     fetchUserDetails();
//   }, []);

//   useEffect(() => {
//     const fetchDeliveryDetails = async () => {
//       if (!displayName) return;

//       try {
//         const shipmentQuery = query(collection(db, "Shipment"));
//         const shipmentSnapshot = await getDocs(shipmentQuery);

//         shipmentSnapshot.forEach(async (shipmentDoc) => {
//           const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//           const deliveriesQuery = query(
//             deliveriesRef,
//             where("customer", "==", displayName)
//           );

//           const deliveriesSnapshot = await getDocs(deliveriesQuery);

//           if (!deliveriesSnapshot.empty) {
//             const deliveryDoc = deliveriesSnapshot.docs[0].data();

//             // Assign statusId and set deliveryNumber
//             setDeliveryNumber(deliveryDoc.deliveryNumber || "N/A");
//           }
//         });
//       } catch (error: any) {
//         Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
//       }
//     };

//     fetchDeliveryDetails();
//   }, [displayName]);

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
//         </View>
//       </View>
//       <ScrollView style={{ width: "100%", height: "70%" }}>
//         <View
//           style={{
//             width: "100%",
//             height: 300,
//             backgroundColor: "#f4f4f4",
//             borderRadius: 20,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//             Delivery Number
//           </Text>
//           <Text style={{ fontSize: 35 }}>{deliveryNumber || "No Delivery"}</Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   TopNav: {
//     flexDirection: "row",
//     width: "100%",
//     height: "30%",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },



import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
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
} from "firebase/firestore";
import { app } from "../firebase";
import StepIndicator from "react-native-step-indicator";

const db = getFirestore(app);

const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

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

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deliveryNumber, setDeliveryNumber] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
          setCollectionName(colName);
          break;
        }
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
    }
  };

  const fetchDeliveryDetails = async () => {
    if (!displayName) return;
  
    try {
      console.log("Fetching delivery details...");
      console.log("Display Name:", displayName);
  
      const shipmentQuery = query(collection(db, "Shipment"));
      const shipmentSnapshot = await getDocs(shipmentQuery);
  
      for (const shipmentDoc of shipmentSnapshot.docs) {
        const shipmentData = shipmentDoc.data();
        console.log("Shipment Document:", shipmentData);
  
        const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
        const deliveriesQuery = query(
          deliveriesRef,
          where("customer", "==", displayName)
        );
  
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        console.log("Deliveries Snapshot Size:", deliveriesSnapshot.size);
  
        if (!deliveriesSnapshot.empty) {
          const deliveryDoc = deliveriesSnapshot.docs[0].data();
          console.log("Delivery Document:", deliveryDoc);
  
          setDeliveryNumber(deliveryDoc.deliveryNumber || "N/A");
          setStatusId(shipmentData.statusId || 0);
          return; // Stop looping after finding the first match
        }
      }
  
      console.log("No matching delivery found.");
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
      console.error(error);
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
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

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
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: "50%",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/Aisha5.jpeg")}
              resizeMode="cover"
              style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Hi, {displayName}
              </Text>
              <TouchableOpacity>
                <Text>Edit my Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "50%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#EDEBEB",
                borderRadius: 20,
                margin: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/Pin.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Your location
              </Text>
              <TouchableOpacity>
                <Text>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.rightNav}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: "46%",
              alignItems: "center",
              backgroundColor: "#f4f4f4",
              borderRadius: 30,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#EDEBEB",
                borderRadius: 20,
                margin: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/Trackk.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Track Delivery
              </Text>
              <TouchableOpacity>
                <Text>Track by ID</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "46%",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f4f4f4",
              borderRadius: 30,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#F6984C",
                borderRadius: 20,
                margin: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/Support.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20}}
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <TouchableOpacity>
                <Text>Support Desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/*Scroll View will live here */}
      <ScrollView style={{ width: "100%", height: "70%" }}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        <View
          style={{
            width: "100%",
            height: 300,
            backgroundColor: "#f4f4f4",
            borderRadius: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              height: "30%",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              marginTop: 10,
            }}
          >
            <View
              style={{ width: "60%", height: "100%", justifyContent: "center" }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "400", marginBottom: 10 }}
              >
                Incoming Deliveries
              </Text>
              <Text style={{ fontSize: 35}}>{deliveryNumber||"No Delivery"}</Text>
            </View>
            <View
              style={{
                width: "30%",
                height: "40%",
                backgroundColor: "#F6984C",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TouchableOpacity>
                <Text style={{ color: "white" }}>View on Map</Text>
              </TouchableOpacity>
            </View>
          </View>
            <View style={{width:'100%', height: '30%', marginTop: 20, justifyContent:'center'}}>
            <StepIndicator
            customStyles={customStyles}
            currentPosition={statusId ? parseInt(statusId) : undefined} // Change this index based on the current progress
            labels={labels}
            stepCount={4}
          />
            </View>
          <View style={{width:'100%', height: '25%', position:'absolute', bottom:0, flexDirection: 'row'}}>
            <View style={{width:'50%', height: '100%',justifyContent:'center', alignItems: 'center'}}>
              <Text style={{fontWeight:'600', marginBottom:10}}>Delivery Origin</Text>
              <Text>Delivery Date</Text>
            </View>
            <View style={{width:'50%', height: '100%', justifyContent:'center', alignItems: 'center'}}>
            <Text style={{fontWeight:'600', marginBottom:10}}>Delivery Origin</Text>
            <Text>Delivery Date</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor:'#fff'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  TopNav: {
    flexDirection: "row",
    width: "100%",
    height: "30%",
    justifyContent: "space-between",
    //backgroundColor: 'green',
    alignItems: "center",
  },
  leftNav: {
    backgroundColor: "#f4f4f4",
    width: "48%",
    height: "60%",
    borderRadius: 30,
  },
  rightNav: {
    //backgroundColor:'#f4f4f4',
    width: "48%",
    height: "60%",
    borderRadius: 30,
    justifyContent: "space-between",
  },
});
