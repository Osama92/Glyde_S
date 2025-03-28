// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   Image,
//   TextInput,
// } from "react-native";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   setDoc,
// } from "firebase/firestore";
// import { router } from "expo-router";

// const db = getFirestore();

// type Shipment = {
//   id: string;
//   deliveries?: Delivery[];
//   statusId?: number;
//   [key: string]: any;
//   vehicleNo: string;
// };

// type Delivery = {
//   id: string;
//   [key: string]: any;
// };

// type StatusOption = {
//   id: number;
//   status: string;
// };

// export default function ShipmentsScreen() {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
//   const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [searchText, setSearchText] = useState<string>("");

//   const statusOptions: StatusOption[] = [
//     { id: 1, status: "Loaded" },
//     { id: 2, status: "Dispatched" },
//   ];

//   useEffect(() => {
//     fetchShipments();
//   }, []);

//   useEffect(() => {
//     if (searchText) {
//       const filtered = shipments.filter((shipment) =>
//         shipment.id.toLowerCase().includes(searchText.toLowerCase())
//       );
//       setFilteredShipments(filtered);
//     } else {
//       setFilteredShipments(shipments);
//     }
//   }, [searchText, shipments]);

//   const fetchShipments = async () => {
//     setLoading(true);
//     try {
//       const shipmentsRef = collection(db, "Shipment");
//       const querySnapshot = await getDocs(shipmentsRef);

//       const shipmentsWithDeliveries = await Promise.all(
//         querySnapshot.docs.map(async (doc) => {
//           const deliveriesRef = collection(db, "Shipment", doc.id, "deliveries");
//           const deliveriesSnapshot = await getDocs(deliveriesRef);

//           const deliveries = deliveriesSnapshot.docs.map((deliveryDoc) => ({
//             id: deliveryDoc.id,
//             ...deliveryDoc.data(),
//           }));

//           return {
//             id: doc.id,
//             ...doc.data(),
//             deliveries,
//             vehicleNo: doc.data().vehicleNo,
//           };
//         })
//       );

//       setShipments(shipmentsWithDeliveries);
//       setFilteredShipments(shipmentsWithDeliveries);
//     } catch (error) {
//       console.error("Error fetching shipments:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateShipmentStatus = async (shipmentId: string, newStatusId?: number) => {
//     if (!newStatusId) return;

//     try {
//       setLoading(true);

//       const shipmentDoc = doc(db, "Shipment", shipmentId);
//       const shipmentData = shipments.find((shipment) => shipment.id === shipmentId);

//       if (!shipmentData) {
//         console.error("Shipment data not found.");
//         return;
//       }

//       // Update the shipment's statusId in the Shipment collection
//       await updateDoc(shipmentDoc, { statusId: newStatusId });

//       // If the status is "Dispatched" (statusId: 2), copy the shipment to the Dispatched collection
//       if (newStatusId === 2) {
//         const dispatchedDoc = doc(db, "Dispatched", shipmentId);
//         await setDoc(dispatchedDoc, shipmentData);
//       }

//       // Update the statusId for all deliveries within the shipment
//       const deliveriesRef = collection(db, "Shipment", shipmentId, "deliveries");
//       const deliveriesSnapshot = await getDocs(deliveriesRef);

//       const updatePromises = deliveriesSnapshot.docs.map((deliveryDoc) =>
//         updateDoc(doc(db, "Shipment", shipmentId, "deliveries", deliveryDoc.id), {
//           statusId: newStatusId,
//         })
//       );

//       await Promise.all(updatePromises);

//       // Refresh the shipments data
//       await fetchShipments();
//       setModalVisible(false);
//     } catch (error) {
//       console.error("Error updating status for deliveries:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openStatusModal = (shipmentId: string) => {
//     const selectedShipment = shipments.find((shipment) => shipment.id === shipmentId);
//     setSelectedShipment({
//       id: shipmentId,
//       statusId: selectedShipment?.statusId || 0,
//       vehicleNo: selectedShipment?.vehicleNo || "",
//     });
//     setModalVisible(true);
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchShipments().finally(() => setRefreshing(false));
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={styles.topSection}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={{ fontSize: 20, fontWeight: "bold" }}>Shipment Status</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </TouchableOpacity>
//       </View>

//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search by Shipment ID"
//         placeholderTextColor={'#000'}
//         value={searchText}
//         onChangeText={(text) => setSearchText(text)}
//       />

//       {loading ? (
//         <ActivityIndicator size="large" color="orange" />
//       ) : (
//         <FlatList
//           data={filteredShipments}
//           keyExtractor={(item) => item.id}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           renderItem={({ item }) => (
//             <View style={styles.shipmentCard}>
//               <Text style={styles.shipmentTitle}>Shipment ID: {item.id}</Text>
//               <Text style={styles.shipmentDetails}>Vehicle No: {item.vehicleNo}</Text>
//               <Text>Status: {item.statusId ? statusOptions.find((s) => s.id === item.statusId)?.status : "Pending"}</Text>
//               {item.deliveries && item.deliveries.length > 0 ? (
//                 <FlatList
//                   data={item.deliveries}
//                   keyExtractor={(delivery) => delivery.id}
//                   renderItem={({ item: delivery }) => (
//                     <Text style={styles.shipmentDetails}>Delivery: {delivery.id}</Text>
//                   )}
//                 />
//               ) : (
//                 <Text style={styles.shipmentDetails}>No deliveries found.</Text>
//               )}
//               <TouchableOpacity style={styles.btn} onPress={() => openStatusModal(item.id)}>
//                 <Text style={{ color: 'white' }}>Change Status</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       )}

//       <Modal visible={modalVisible} transparent={true} animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalHeader}>Update Status</Text>
//             {statusOptions.map((status) => (
//               <TouchableOpacity
//                 key={status.id}
//                 style={styles.statusButton}
//                 onPress={() =>
//                   selectedShipment &&
//                   updateShipmentStatus(selectedShipment.id, status.id)
//                 }
//               >
//                 <Text style={styles.statusText}>{status.status}</Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 10,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   shipmentCard: {
//     padding: 10,
//     backgroundColor: "#f9f9f9",
//     marginVertical: 5,
//     borderRadius: 5,
//     elevation: 2,
//   },
//   shipmentTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   shipmentDetails: {
//     fontSize: 14,
//     color: "#555",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 5,
//     width: "80%",
//   },
//   modalHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   statusButton: {
//     backgroundColor: "#f1f1f1",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   statusText: {
//     textAlign: "center",
//     fontSize: 16,
//   },
//   closeButton: {
//     backgroundColor: "#ff0000",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: "#fff",
//     textAlign: "center",
//   },
//   activityIndicator: {
//     marginTop: 20,
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   btn: {
//     backgroundColor: "black",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   searchInput: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//   },
// });

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { router } from "expo-router";

const db = getFirestore();

type Shipment = {
  id: string;
  deliveries?: Delivery[];
  statusId?: number;
  [key: string]: any;
  vehicleNo: string;
};

type Delivery = {
  id: string;
  [key: string]: any;
};

type StatusOption = {
  id: number;
  status: string;
  color: string;
};

export default function ShipmentsScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  const statusOptions: StatusOption[] = [
    { id: 1, status: "Loaded", color: "#FFA500" },
    { id: 2, status: "Dispatched", color: "#4CAF50" },
  ];

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = shipments.filter((shipment) =>
        shipment.id.toLowerCase().includes(searchText.toLowerCase()) ||
        shipment.vehicleNo.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredShipments(filtered);
    } else {
      setFilteredShipments(shipments);
    }
  }, [searchText, shipments]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const shipmentsRef = collection(db, "Shipment");
      const querySnapshot = await getDocs(shipmentsRef);

      const shipmentsWithDeliveries = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const deliveriesRef = collection(db, "Shipment", doc.id, "deliveries");
          const deliveriesSnapshot = await getDocs(deliveriesRef);

          const deliveries = deliveriesSnapshot.docs.map((deliveryDoc) => ({
            id: deliveryDoc.id,
            ...deliveryDoc.data(),
          }));

          return {
            id: doc.id,
            ...doc.data(),
            deliveries,
            vehicleNo: doc.data().vehicleNo,
          };
        })
      );

      setShipments(shipmentsWithDeliveries);
      setFilteredShipments(shipmentsWithDeliveries);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatusId?: number) => {
    if (!newStatusId) return;

    try {
      setLoading(true);

      const shipmentDoc = doc(db, "Shipment", shipmentId);
      const shipmentData = shipments.find((shipment) => shipment.id === shipmentId);

      if (!shipmentData) {
        console.error("Shipment data not found.");
        return;
      }

      await updateDoc(shipmentDoc, { statusId: newStatusId });

      if (newStatusId === 2) {
        const dispatchedDoc = doc(db, "Dispatched", shipmentId);
        await setDoc(dispatchedDoc, shipmentData);
      }

      const deliveriesRef = collection(db, "Shipment", shipmentId, "deliveries");
      const deliveriesSnapshot = await getDocs(deliveriesRef);

      const updatePromises = deliveriesSnapshot.docs.map((deliveryDoc) =>
        updateDoc(doc(db, "Shipment", shipmentId, "deliveries", deliveryDoc.id), {
          statusId: newStatusId,
        })
      );

      await Promise.all(updatePromises);

      await fetchShipments();
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating status for deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (shipmentId: string) => {
    const selectedShipment = shipments.find((shipment) => shipment.id === shipmentId);
    setSelectedShipment({
      id: shipmentId,
      statusId: selectedShipment?.statusId || 0,
      vehicleNo: selectedShipment?.vehicleNo || "",
    });
    setModalVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShipments().finally(() => setRefreshing(false));
  }, []);

  const getStatusColor = (statusId: number) => {
    const status = statusOptions.find(s => s.id === statusId);
    return status ? status.color : "#9E9E9E";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={require("../../assets/images/Back.png")}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment Management</Text>
        <View style={{ width: 30 }} /> 
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require("../../assets/images/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Shipment ID or Vehicle No"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      ) : (
        <FlatList
          data={filteredShipments}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFA500"]}
              tintColor="#FFA500"
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../../assets/images/empty.png")}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No shipments found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.shipmentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.shipmentId}>{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusId || 0) }]}>
                  <Text style={styles.statusText}>
                    {item.statusId ? statusOptions.find((s) => s.id === item.statusId)?.status : "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Image
                  source={require("../../assets/images/transport.png")}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{item.vehicleNo}</Text>
              </View>

              {item.deliveries && item.deliveries.length > 0 ? (
                <View style={styles.deliveriesContainer}>
                  <Text style={styles.deliveriesTitle}>Deliveries:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.deliveries.map((delivery) => (
                      <View key={delivery.id} style={styles.deliveryBadge}>
                        <Text style={styles.deliveryText}>{delivery.id}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noDeliveries}>
                  <Text style={styles.noDeliveriesText}>No deliveries assigned</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openStatusModal(item.id)}
              >
                <Text style={styles.actionButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Shipment Status</Text>
            <Text style={styles.modalSubtitle}>{selectedShipment?.id}</Text>

            <View style={styles.statusOptionsContainer}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    { backgroundColor: status.color }
                  ]}
                  onPress={() =>
                    selectedShipment &&
                    updateShipmentStatus(selectedShipment.id, status.id)
                  }
                >
                  <Text style={styles.statusOptionText}>{status.status}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    margin: 16,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#888",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: "#CCC",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  shipmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  shipmentId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    //#FFA500
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    textTransform: "uppercase",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    width: 20,
    height: 20,
    tintColor: "#666",
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  deliveriesContainer: {
    marginTop: 12,
  },
  deliveriesTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  deliveryBadge: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: "#333",
  },
  noDeliveries: {
    paddingVertical: 8,
  },
  noDeliveriesText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: "#FFA500",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  statusOptionsContainer: {
    marginBottom: 16,
  },
  statusOption: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  modalCloseButton: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});