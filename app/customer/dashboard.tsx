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
  Modal,
  ScrollView,
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
  onSnapshot
} from "firebase/firestore";
import StepIndicator from "react-native-step-indicator";
import { app } from "../firebase";
import { router } from "expo-router";
import axios from "axios";

const db = getFirestore(app);

const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

const GOOGLE_MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [vehicleNo, setVehicleNo] = useState<string | null>(null);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [loadingCompleted, setLoadingCompleted] = useState<boolean>(true);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status === "OK") {
        return response.data.results[0].formatted_address; // First result is usually the most relevant
      } else {
        throw new Error("Geocoding failed.");
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return "Address not found";
    }
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
          setProfileImage(userDoc.imageUrl || null);
          setCollectionName(colName);
          const encodedID = encodeURIComponent(userDoc.uid);
          setId(encodedID);
          const { latitude, longitude } = userDoc.location || {};

          const getAddress = async () => {
            const address = await reverseGeocode(latitude, longitude);
            if (userDoc.location != null) {
              setLocationLabel("Verified");
            } else {
              setLocationLabel("Not Verified");
            }
          };

          getAddress();

          break;
        }
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch user detail: ${error.message}`);
    }
  };

  const fetchDeliveryDetails = async () => {
    if (!displayName) return;
  
    setLoadingPending(true);
    setLoadingCompleted(true);
  
    try {
      const shipmentQuery = query(collection(db, "Shipment"));
      const shipmentSnapshot = await getDocs(shipmentQuery);
  
      const pending: any[] = [];
      const completed: any[] = [];
  
      for (const shipmentDoc of shipmentSnapshot.docs) {
        const shipmentData = shipmentDoc.data();
  
        const deliveriesRef = collection(
          db,
          "Shipment",
          shipmentDoc.id,
          "deliveries"
        );
        const deliveriesQuery = query(
          deliveriesRef,
          where("customer", "==", displayName)
        );
  
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
  
        deliveriesSnapshot.forEach((doc) => {
          const delivery: any = {
            id: doc.id,
            ...doc.data(),
            shipmentId: shipmentDoc.id,
          };
          if (
            delivery.statusId === 1 ||
            delivery.statusId === 2 ||
            delivery.statusId === 3
          ) {
            pending.push(delivery);
            setVehicleNo(shipmentData.vehicleNo);
          } else if (delivery.statusId === 4) {
            completed.push(delivery);
          }
        });
      }
  
      setPendingDeliveries(pending);
      setCompletedDeliveries(completed);
    } catch (error: any) {
      Alert.alert(
        "Error",
        `Failed to fetch delivery details: ${error.message}`
      );
    } finally {
      setLoadingPending(false);
      setLoadingCompleted(false);
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

  const markAsReceived = async (delivery: any) => {
    try {
      const deliveryRef = doc(
        db,
        "Shipment",
        delivery.shipmentId,
        "deliveries",
        delivery.id
      );
      await updateDoc(deliveryRef, {
        statusId: 4,
        deliveredAt: new Date().toDateString(),
      });

      setPendingDeliveries((prev) =>
        prev.filter((item) => item.id !== delivery.id)
      );
      setCompletedDeliveries((prev) => [delivery, ...prev]);
    } catch (error: any) {
      Alert.alert("Error", `Failed to update delivery: ${error.message}`);
    }
  };

  const fetchAllData = async () => {
    await fetchUserDetails();
    await fetchDeliveryDetails();
    setLoading(false);
    setRefreshing(false)
    console.log("called")
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    
    await fetchDeliveryDetails();
   
  }, [displayName]);

  const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => {
    const handlePress = (deliveryItem: any) => {
      setSelectedItem(deliveryItem);
      setModalVisible(true);
    };

    const confirmDelivery = () => {
      if (selectedItem) {
        markAsReceived(selectedItem);
      }
      setModalVisible(false);
    };

    return (
      <View style={styles.deliveryItem}>
        <Text style={styles.deliveryNumber}>
          <Text style={{ fontSize: 14 }}>Delivery No:</Text>{" "}
          {item.deliveryNumber}
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 20 }}>
          <Text>Vehicle No:</Text> {vehicleNo}
        </Text>
        {(item.eta) && (<Text> Your delivery is arriving in: {item.eta}</Text>)}
        <StepIndicator
          customStyles={customStyles}
          currentPosition={item.statusId}
          labels={labels}
          stepCount={4}
        />
        {isPending && (
          <TouchableOpacity
            style={[styles.button, item.statusId < 3 && styles.disabledButton]}
            onPress={() => handlePress(item)}
            disabled={item.statusId < 3}
          >
            <Text style={styles.buttonText}>Delivered</Text>
          </TouchableOpacity>
        )}

        {/* Confirmation Modal */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to mark this delivery as received?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmDelivery}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderCompletedItem = ({ item }: { item: any }, isPending: boolean) => (
    <View style={styles.deliveryItem1}>
      <View style={{ flexDirection: "column", width: "70%", height: "100%" }}>
        <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
        <Text>Confirmed on: {item.deliveredAt}</Text>
      </View>
      <View
        style={{
          width: 100,
          height: 40,
          backgroundColor: "green",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#ffff" }}>Successful</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="orange" />
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
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../../assets/images/icon.png")
              }
              resizeMode="cover"
              style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Hi, {displayName}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/customer/editProfile?collectionName=${collectionName}&id=${id}`
                  )
                }
              >
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
              <Text>{locationLabel}</Text>
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
                Track Shipment
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/agent/trackShipment")}
              >
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
                style={{ width: 20, height: 20 }}
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
      <ScrollView style={{ width: "100%" }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }>
        <Text style={styles.sectionTitle}>Incoming Deliveries</Text>

        {loadingPending ? (
          <ActivityIndicator
            size="small"
            color="orange"
            style={{ marginTop: 15 }}
          />
        ) : pendingDeliveries.length === 0 ? (
          <Text style={styles.emptyText}>No pending deliveries.</Text>
        ) : (
          <FlatList
            data={pendingDeliveries}
            keyExtractor={(item) => item.id}
            renderItem={(item) => renderDeliveryItem(item, true)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Completed Deliveries Section */}
        <Text style={styles.sectionTitle}>Completed Transactions</Text>
        {loadingCompleted ? (
          <ActivityIndicator
            size="small"
            color="orange"
            style={{ marginTop: 15 }}
          />
        ) : completedDeliveries.length === 0 ? (
          <Text style={styles.emptyText}>No completed transactions.</Text>
        ) : (
          <FlatList
            data={completedDeliveries}
            keyExtractor={(item) => item.id}
            renderItem={(item) => renderCompletedItem(item, false)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
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
    height: 130,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },
  leftNav: {
    backgroundColor: "#f4f4f4",
    width: "48%",
    height: "80%",
    borderRadius: 30,
    marginBottom: 10,
  },
  rightNav: {
    width: "48%",
    height: "80%",
    borderRadius: 30,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 10,
  },
  deliveryNumber: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  deliveryItem: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    height: 240,
    marginBottom: 15
  },
  deliveryItem1: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#Adebb3",
    borderRadius: 10,
    width: "100%",
    height: 80,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#F6984C",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
  noDeliveriesContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "gray",
  },
  emptyText: {
    color: "lightgrey",
    alignSelf: "center",
    fontSize: 20,
    marginTop: 15,
  },
});

// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
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
//   onSnapshot
// } from "firebase/firestore";
// import StepIndicator from "react-native-step-indicator";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

// export default function Dashboard() {
//   const [displayName, setDisplayName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
//   const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
//   const [vehicleNo, setVehicleNo] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<any>(null);

//   // Fetch User Details
//   const fetchUserDetails = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (!phoneNumber) {
//         Alert.alert("Error", "No phone number found. Please log in again.");
//         return;
//       }

//       const userQuery = query(
//         collection(db, "customer"),
//         where("phoneNumber", "==", phoneNumber)
//       );
//       const querySnapshot = await getDocs(userQuery);

//       if (!querySnapshot.empty) {
//         const userDoc = querySnapshot.docs[0].data();
//         setDisplayName(userDoc.name || "Unknown User");
//       }
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to fetch user detail: ${error.message}`);
//     }
//   };

//   // Fetch Delivery Details using onSnapshot (Real-time updates)
//   const fetchDeliveryDetails = useCallback(() => {
//     if (!displayName) return;

//     setLoading(true);
    
//     const shipmentQuery = query(collection(db, "Shipment"));
    
//     const unsubscribe = onSnapshot(shipmentQuery, async (shipmentSnapshot) => {
//       const pending: any[] = [];
//       const completed: any[] = [];

//       for (const shipmentDoc of shipmentSnapshot.docs) {
//         const shipmentData = shipmentDoc.data();
//         const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//         const deliveriesQuery = query(deliveriesRef, where("customer", "==", displayName));

//         const deliveriesSnapshot = await getDocs(deliveriesQuery);

//         deliveriesSnapshot.forEach((doc) => {
//           const delivery = { id: doc.id, ...doc.data(), shipmentId: shipmentDoc.id };
//           if (delivery.statusId < 4) {
//             pending.push(delivery);
//             setVehicleNo(shipmentData.vehicleNo);
//           } else {
//             completed.push(delivery);
//           }
//         });
//       }

//       setPendingDeliveries(pending);
//       setCompletedDeliveries(completed);
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup function
//   }, [displayName]);

//   useEffect(() => {
//     fetchUserDetails();
//   }, []);

//   useEffect(() => {
//     if (displayName) {
//       const unsubscribe = fetchDeliveryDetails();
//       return () => unsubscribe?.();
//     }
//   }, [displayName]);

//   // Handle Pull to Refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchUserDetails();
//     fetchDeliveryDetails();
//     setRefreshing(false);
//   }, []);

//   // Mark Delivery as Received
//   const markAsReceived = async (delivery: any) => {
//     try {
//       const deliveryRef = doc(db, "Shipment", delivery.shipmentId, "deliveries", delivery.id);
//       await updateDoc(deliveryRef, { statusId: 4, deliveredAt: new Date().toDateString() });

//       setPendingDeliveries((prev) => prev.filter((item) => item.id !== delivery.id));
//       setCompletedDeliveries((prev) => [delivery, ...prev]);
//     } catch (error: any) {
//       Alert.alert("Error", `Failed to update delivery: ${error.message}`);
//     }
//   };

//   const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => {
//     return (
//       <View style={styles.deliveryItem}>
//         <Text style={styles.deliveryNumber}>Delivery No: {item.deliveryNumber}</Text>
//         <Text>Vehicle No: {vehicleNo}</Text>
//         <StepIndicator currentPosition={item.statusId} labels={labels} stepCount={4} />

//         {isPending && (
//           <TouchableOpacity
//             style={[styles.button, item.statusId < 3 && styles.disabledButton]}
//             onPress={() => {
//               setSelectedItem(item);
//               setModalVisible(true);
//             }}
//             disabled={item.statusId < 3}
//           >
//             <Text style={styles.buttonText}>Delivered</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {loading ? <ActivityIndicator size="large" color="#F6984C" /> : null}

//       <FlatList
//         data={[...pendingDeliveries, ...completedDeliveries]}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => renderDeliveryItem({ item }, item.statusId < 4)}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       />

//       {/* Confirmation Modal */}
//       <Modal transparent={true} animationType="slide" visible={modalVisible}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text>Mark this delivery as received?</Text>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => { markAsReceived(selectedItem); setModalVisible(false); }}>
//                 <Text>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10 },
//   deliveryItem: { marginBottom: 15, padding: 10, backgroundColor: "#FFF", borderRadius: 10 },
//   deliveryNumber: { fontSize: 16, fontWeight: "bold" },
//   button: { backgroundColor: "#F6984C", padding: 10, borderRadius: 5, alignItems: "center" },
//   disabledButton: { backgroundColor: "#ccc" },
//   buttonText: { color: "#FFF" },
//   modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
//   modalContent: { backgroundColor: "#FFF", padding: 20, borderRadius: 10 },
//   modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
// });


