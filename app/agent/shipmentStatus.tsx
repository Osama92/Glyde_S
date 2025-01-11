// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   Button
// } from "react-native";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   getDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";


// // Firestore initialization
// const db = getFirestore();

// type Shipment = {
//   id: string;
//   deliveries?: string[];
//   [key: string]: any;
// };

// type StatusOption = {
//   id: number;
//   status: string;
// };

// export default function ShipmentsScreen() {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
//     null
//   );
//   const [modalVisible, setModalVisible] = useState<boolean>(false);

//   const statusOptions: StatusOption[] = [
//     { id: 1, status: "Loaded" },
//     { id: 2, status: "Dispatched" },
//   ];

//   useEffect(() => {
//     fetchShipments();
//   }, []);

//   // Fetch shipments with deliveries
//   const fetchShipments = async () => {
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
//           };
//         })
//       );
  
//       setShipments(shipmentsWithDeliveries);
  
//       if (shipmentsWithDeliveries.length === 0) {
//         console.warn("No shipments with deliveries found.");
//       }
//     } catch (error) {
//       console.error("Error fetching shipments:", error);
//     }
//   };
  
  

// const updateShipmentStatus = async (shipmentId: string, newStatusId?: number) => {
//     try {
//       const shipmentDoc = doc(db, "Shipment", shipmentId);
//       await updateDoc(shipmentDoc, { statusId: newStatusId || "Pending" });
//       setModalVisible(false);
//       fetchShipments(); // Refresh the data after updating
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };
  


//   const openStatusModal = (shipmentId: string) => {
//     const selectedShipment = shipments.find((shipment) => shipment.id === shipmentId);
//     setSelectedShipment({
//       id: shipmentId,
//       status: selectedShipment?.status || "Pending",
//     });
//     setModalVisible(true);
//   };
  

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Shipments</Text>
      

// {shipments.length > 0 ? (
//       <FlatList
//         data={shipments}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={{ marginBottom: 10, padding: 10, backgroundColor: "#f1f1f1" }}>
//             <Text style={{ fontSize: 16, fontWeight: "bold" }}>Shipment ID: {item.id}</Text>
//             <Text>Status: {item.statusId || "Pending"}</Text>
//             {item.deliveries.length > 0 ? (
//               <FlatList
//                 data={item.deliveries}
//                 keyExtractor={(delivery) => delivery.id}
//                 renderItem={({ item: delivery }) => (
//                   <Text style={{ marginLeft: 0 }}>Delivery: {JSON.stringify(delivery.id)}</Text>
//                 )}
//               />
//             ) : (
//               <Text>No deliveries found.</Text>
//             )}
//             <Button
//               title="Change Status"
//               onPress={() => openStatusModal(item.id)}
//             />
//           </View>
//         )}
//       />
//     ) : (
//       <Text>No shipments found</Text>
//     )}

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
//   button: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     textAlign: "center",
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
//   stepIndicatorContainer: {
//     marginTop: 20,
//   },
//   stepIndicatorTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
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
  Button,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

// Firestore initialization
const db = getFirestore();

type Shipment = {
  id: string;
  deliveries?: Delivery[];
  statusId?: number;
  [key: string]: any;
};

type Delivery = {
  id: string;
  [key: string]: any;
};

type StatusOption = {
  id: number;
  status: string;
};

export default function ShipmentsScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const statusOptions: StatusOption[] = [
    { id: 1, status: "Loaded" },
    { id: 2, status: "Dispatched" },
  ];

  useEffect(() => {
    fetchShipments();
  }, []);

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
          };
        })
      );

      setShipments(shipmentsWithDeliveries);
      if (shipmentsWithDeliveries.length === 0) {
        console.warn("No shipments with deliveries found.");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatusId?: number) => {
    try {
      const shipmentDoc = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentDoc, { statusId: newStatusId || "Pending" });
      setModalVisible(false);
      fetchShipments(); // Refresh the data after updating
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openStatusModal = (shipmentId: string) => {
    const selectedShipment = shipments.find((shipment) => shipment.id === shipmentId);
    setSelectedShipment({
      id: shipmentId,
      statusId: selectedShipment?.statusId || 0,
    });
    setModalVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShipments().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shipments</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={shipments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.shipmentCard}>
              <Text style={styles.shipmentTitle}>Shipment ID: {item.id}</Text>
              <Text>Status: {item.statusId ? statusOptions.find((s) => s.id === item.statusId)?.status : "Pending"}</Text>
              {item.deliveries && item.deliveries.length > 0 ? (
                <FlatList
                  data={item.deliveries}
                  keyExtractor={(delivery) => delivery.id}
                  renderItem={({ item: delivery }) => (
                    <Text style={styles.shipmentDetails}>Delivery: {delivery.id}</Text>
                  )}
                />
              ) : (
                <Text style={styles.shipmentDetails}>No deliveries found.</Text>
              )}
              <Button title="Change Status" onPress={() => openStatusModal(item.id)} />
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Update Status</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={styles.statusButton}
                onPress={() =>
                  selectedShipment &&
                  updateShipmentStatus(selectedShipment.id, status.id)
                }
              >
                <Text style={styles.statusText}>{status.status}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  shipmentCard: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  shipmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  shipmentDetails: {
    fontSize: 14,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
    width: "80%",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statusButton: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  statusText: {
    textAlign: "center",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ff0000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  activityIndicator: {
    marginTop: 20,
  },
});
