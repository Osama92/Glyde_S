// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
// import { app } from "../firebase";

// const db = getFirestore(app);

// const ShipmentScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [pendingShipments, setPendingShipments] = useState<any[]>([]);
//   const [inTransitShipments, setInTransitShipments] = useState<any[]>([]);
//   const [completedShipments, setCompletedShipments] = useState<any[]>([]);

//   // Fetch phone number from AsyncStorage
//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       try {
//         const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//         if (!storedPhoneNumber) {
//           console.log("No phone number found in AsyncStorage");
//           return;
//         }
//         setPhoneNumber(storedPhoneNumber);
//       } catch (error) {
//         console.error("Failed to fetch phone number from AsyncStorage:", error);
//       }
//     };

//     fetchPhoneNumber();
//   }, []);

//   // Fetch shipments from Firestore
//   const fetchShipments = useCallback(() => {
//     if (!phoneNumber) {
//       return;
//     }

//     setLoading(true);
//     const shipmentsQuery = query(collection(db, "Shipment"), where("mobileNumber", "==", phoneNumber));

//     const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
//       const pending: any[] = [];
//       const inTransit: any[] = [];
//       const completed: any[] = [];

//       querySnapshot.forEach((doc) => {
//         const shipment:any = { id: doc.id, ...doc.data() };
//         if (shipment.statusId === 2) {
//           pending.push(shipment);
//         } else if (shipment.statusId === 3) {
//           inTransit.push(shipment);
//         } else if (shipment.statusId === 4) {
//           completed.push(shipment);
//         }
//       });

//       setPendingShipments(pending);
//       setInTransitShipments(inTransit);
//       setCompletedShipments(completed);
//       setLoading(false);
//       setRefreshing(false);
//     });

//     return () => unsubscribe();
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (phoneNumber) {
//       fetchShipments();
//     }
//   }, [phoneNumber, fetchShipments]);

//   // Pull-to-refresh handler
//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchShipments();
//   };

//   // Render a single shipment item
//   const renderShipmentItem = ({ item }: { item: any }) => (
//     <View style={styles.shipmentItem}>
//       <Text style={styles.shipmentText}>Shipment ID: {item.id}</Text>
//       <Text style={styles.shipmentText}>Transporter: {item.transporter || "No description"}</Text>
//     </View>
//   );

//   // Render section
//   const renderSection = (title: string, data: any[]) => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {data.length > 0 ? (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id}
//           renderItem={renderShipmentItem}
//         />
//       ) : (
//         <Text style={styles.emptyText}>No {title.toLowerCase()} shipments.</Text>
//       )}
//     </View>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="orange" />
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={[]} // Empty data since we're rendering sections manually
//         renderItem={null}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         ListHeaderComponent={
//           <View>
//             {renderSection("Pending", pendingShipments)}
//             {renderSection("In-Transit", inTransitShipments)}
//             {renderSection("Completed", completedShipments)}
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     marginTop:30,
//     backgroundColor: "#f5f5f5",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   shipmentItem: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   shipmentText: {
//     fontSize: 14,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: "#888",
//   },
// });

// export default ShipmentScreen;


import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const ShipmentScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingShipments, setPendingShipments] = useState<any[]>([]);
  const [inTransitShipments, setInTransitShipments] = useState<any[]>([]);
  const [completedShipments, setCompletedShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          console.log("No phone number found in AsyncStorage");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
      } catch (error) {
        console.error("Failed to fetch phone number from AsyncStorage:", error);
      }
    };

    fetchPhoneNumber();
  }, []);

  // Fetch shipments from Firestore
  const fetchShipments = useCallback(() => {
    if (!phoneNumber) {
      return;
    }

    setLoading(true);
    const shipmentsQuery = query(collection(db, "Shipment"), where("mobileNumber", "==", phoneNumber));

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      const pending: any[] = [];
      const inTransit: any[] = [];
      const completed: any[] = [];

      querySnapshot.forEach((doc) => {
        const shipment:any = { id: doc.id, ...doc.data() };
        if (shipment.statusId === 2) {
          pending.push(shipment);
        } else if (shipment.statusId === 3) {
          inTransit.push(shipment);
        } else if (shipment.statusId === 4) {
          completed.push(shipment);
        }
      });

      setPendingShipments(pending);
      setInTransitShipments(inTransit);
      setCompletedShipments(completed);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber) {
      fetchShipments();
    }
  }, [phoneNumber, fetchShipments]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  // Fetch deliveries subcollection for a selected shipment
  const fetchDeliveries = async (shipmentId: string) => {
    setLoading(true);
    const deliveriesRef = collection(db, "Shipment", shipmentId, "deliveries");
    const querySnapshot = await getDocs(deliveriesRef);
    const fetchedDeliveries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setDeliveries(fetchedDeliveries);
    setLoading(false);
    setIsModalVisible(true);
  };

  // Render a single shipment item
  const renderShipmentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.shipmentItem}
      onPress={() => fetchDeliveries(item.id)} // Fetch deliveries when clicked
    >
      <Text style={styles.shipmentText}>Shipment ID: {item.id}</Text>
      <Text style={styles.shipmentText}>Description: {item.description || "No description"}</Text>
    </TouchableOpacity>
  );

  // Render section
  const renderSection = (title: string, data: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderShipmentItem}
        />
      ) : (
        <Text style={styles.emptyText}>No {title.toLowerCase()} shipments.</Text>
      )}
    </View>
  );

  // Render a single delivery item
//   const renderDeliveryItem = ({ item }: { item: any }) => (
//     <View style={styles.tableRow}>
//       <Text style={styles.tableCell}>{item.createdAt || "N/A"}</Text>
//       <Text style={styles.tableCell}>{item.deliveryNumber || "N/A"}</Text>
//       <Text style={styles.tableCell}>{item.material || "N/A"}</Text>
//       <Text style={styles.tableCell}>{item.quantity || "N/A"}</Text>
//     </View>
//   );
const renderDeliveryItem = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.createdAt || "N/A"}</Text>
      <Text style={styles.tableCell}>{item.deliveryNumber || "N/A"}</Text>
      {/* Map through the materials array and display name and quantity */}
      <View style={styles.tableCell}>
        {item.materials && Array.isArray(item.materials) ? (
          item.materials.map((mat: any, index: number) => (
            <Text key={index}>{`${mat.name} (${mat.quantity})`}</Text>
          ))
        ) : (
          <Text>N/A</Text>
        )}
      </View>
      <Text style={styles.tableCell}>
        {item.materials && Array.isArray(item.materials)
          ? item.materials.reduce((total: number, mat: any) => total + (mat.quantity || 0), 0)
          : "N/A"}
      </Text>
    </View>
  );
  

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[]} // Empty data since we're rendering sections manually
        renderItem={null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            {renderSection("Pending", pendingShipments)}
            {renderSection("In-Transit", inTransitShipments)}
            {renderSection("Completed", completedShipments)}
          </View>
        }
      />

      {/* Modal for deliveries */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Deliveries</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Created Date</Text>
            <Text style={styles.tableHeaderCell}>Delivery Number</Text>
            <Text style={styles.tableHeaderCell}>Material</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
          </View>
          <FlatList
            data={deliveries}
            keyExtractor={(item) => item.id}
            renderItem={renderDeliveryItem}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  shipmentItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  shipmentText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: "auto",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  closeButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ShipmentScreen;
