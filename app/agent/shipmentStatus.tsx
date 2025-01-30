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
  Image
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
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
            vehicleNo: doc.data().vehicleNo,
          };
        })
      );

      setShipments(shipmentsWithDeliveries);
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

      // Update the shipment's statusId
      const shipmentDoc = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentDoc, { statusId: newStatusId });

      // Update the statusId for all deliveries within the shipment
      const deliveriesRef = collection(db, "Shipment", shipmentId, "deliveries");
      const deliveriesSnapshot = await getDocs(deliveriesRef);

      const updatePromises = deliveriesSnapshot.docs.map((deliveryDoc) =>
        updateDoc(doc(db, "Shipment", shipmentId, "deliveries", deliveryDoc.id), {
          statusId: newStatusId,
        })
      );

      await Promise.all(updatePromises);

      // Refresh the shipments data
      fetchShipments();
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

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Shipment Status</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/Back.png")}
            style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
          />
          </TouchableOpacity>
        </View>
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : (
        <FlatList
          data={shipments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.shipmentCard}>
              <Text style={styles.shipmentTitle}>Shipment ID: {item.id}</Text>
              <Text style={styles.shipmentDetails}>Vehicle No: {item.vehicleNo}</Text>
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
              {/* <Button title="Change Status"  onPress={() => openStatusModal(item.id)} /> */}
                <TouchableOpacity style={styles.btn} onPress={() => openStatusModal(item.id)}>
                  <Text style={{color:'white'}}>Change Status</Text>
                </TouchableOpacity>
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
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop:20,
    marginBottom: 10
  },
  btn: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems:'center'
  },
});
