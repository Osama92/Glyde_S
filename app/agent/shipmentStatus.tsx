import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  collectionGroup,
} from "firebase/firestore";
import StepIndicator from "react-native-step-indicator";

// Firestore initialization
const db = getFirestore();

type Shipment = {
  id: string;
  deliveries?: string[];
  [key: string]: any;
};

type StatusOption = {
  id: number;
  status: string;
};

export default function ShipmentsScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<number>(0);

  const statusOptions: StatusOption[] = [
    { id: 1, status: "Loaded" },
    { id: 2, status: "Dispatched" },
  ];

  useEffect(() => {
    fetchShipments();
  }, []);

  // Fetch shipments with deliveries
  const fetchShipments = async () => {
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
    }
  };
  
  

  // Update shipment status
  const updateShipmentStatus = async (shipmentId: string, statusId: number) => {
    try {
      const shipmentDoc = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentDoc, { statusId });

      Alert.alert("Success", "Status updated successfully!");
      setModalVisible(false);
      fetchShipments(); // Refresh data
    } catch (error) {
      console.error("Error updating shipment status:", error);
      Alert.alert("Error", "Failed to update status.");
    }
  };

  // Fetch the current status ID for the step indicator
  const fetchStatusId = async (shipmentId: string) => {
    try {
      const shipmentDoc = doc(db, "Shipment", shipmentId);
      const snapshot = await getDoc(shipmentDoc);

      if (snapshot.exists()) {
        setCurrentPosition(snapshot.data()?.statusId || 0);
      } else {
        console.warn("No such shipment exists!");
      }
    } catch (error) {
      console.error("Error fetching status ID:", error);
    }
  };

  // Fetch delivery numbers by customer name
  const fetchDeliveryNumberByCustomer = async (
    customerName: string
  ): Promise<string[]> => {
    try {
      const deliveriesQuery = query(
        collectionGroup(db, "deliveries"),
        where("customer", "==", customerName)
      );

      const deliverySnapshot = await getDocs(deliveriesQuery);
      const deliveryNumbers: string[] = [];

      deliverySnapshot.forEach((doc) => {
        deliveryNumbers.push(doc.id); // Assuming delivery ID is the delivery number
      });

      return deliveryNumbers;
    } catch (error) {
      console.error("Error fetching delivery numbers:", error);
      return [];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shipments</Text>
      <FlatList
        data={shipments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.shipmentCard}>
            <Text style={styles.shipmentTitle}>{item.id}</Text>
            <Text style={styles.shipmentDetails}>
              Deliveries: {item.deliveries?.length || 0}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setSelectedShipment(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        )}
      />

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

      {selectedShipment && (
        <View style={styles.stepIndicatorContainer}>
          <Text style={styles.stepIndicatorTitle}>Status Tracker</Text>
          <StepIndicator
            customStyles={stepIndicatorStyles}
            currentPosition={currentPosition}
            labels={["Loaded", "Dispatched"]}
          />
        </View>
      )}
    </View>
  );
}

// Step indicator styles
const stepIndicatorStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#fe7013",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "#fe7013",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#fe7013",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#fe7013",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#fe7013",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 13,
  currentStepLabelColor: "#fe7013",
};

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
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
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
  stepIndicatorContainer: {
    marginTop: 20,
  },
  stepIndicatorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
