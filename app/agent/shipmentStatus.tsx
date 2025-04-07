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
  Alert,
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

// Define the complete status flow
const statusFlow: Record<number, number[]> = {
  0: [1],       // Pending → Loaded
  1: [2],       // Loaded → Dispatched
  2: [3, 4],    // Dispatched → In Transit or Delivered
  3: [4],       // In Transit → Delivered
  4: []         // Delivered (final)
};

const statusOptions: StatusOption[] = [
  { id: 0, status: "Pending", color: "#9E9E9E" },
  { id: 1, status: "Loaded", color: "#FFA500" },
  { id: 2, status: "Dispatched", color: "#4CAF50" },
  // { id: 3, status: "In Transit", color: "#2196F3" },
  // { id: 4, status: "Delivered", color: "#9C27B0" }
];

export default function ShipmentsScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  // Helper function to get status name
  const getStatusName = (statusId: number): string => {
    return statusOptions.find(s => s.id === statusId)?.status || `Status ${statusId}`;
  };

  // Validate status transitions
  const isValidStatusTransition = (currentStatus: number, newStatus: number): boolean => {
    if (currentStatus === undefined || currentStatus === null) {
      return newStatus === 0 || newStatus === 1;
    }
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

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
      Alert.alert("Error", "Failed to fetch shipments. Please try again.");
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

      // Validate status transition
      const currentStatus = shipmentData.statusId || 0;
      if (!isValidStatusTransition(currentStatus, newStatusId)) {
        Alert.alert(
          "Invalid Status Change",
          `Cannot change status from ${getStatusName(currentStatus)} to ${getStatusName(newStatusId)}`
        );
        return;
      }

      // Proceed with update if validation passes
      await updateDoc(shipmentDoc, { statusId: newStatusId });

      // Additional logic for specific status changes
      if (newStatusId === 2) {
        const dispatchedDoc = doc(db, "Dispatched", shipmentId);
        await setDoc(dispatchedDoc, shipmentData);
      }

      // Update all deliveries
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
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
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

  const StatusUpdateModal = () => {
    if (!selectedShipment) return null;

    const availableStatuses = statusOptions.filter(option => 
      isValidStatusTransition(selectedShipment.statusId || 0, option.id)
    );

    return (
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Shipment Status</Text>
            <Text style={styles.modalSubtitle}>{selectedShipment.id}</Text>
            <Text style={styles.currentStatus}>
              Current: {getStatusName(selectedShipment.statusId || 0)}
            </Text>

            <View style={styles.statusOptionsContainer}>
              {availableStatuses.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    { backgroundColor: status.color }
                  ]}
                  onPress={() => updateShipmentStatus(selectedShipment.id, status.id)}
                >
                  <Text style={styles.statusOptionText}>{status.status}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {availableStatuses.length === 0 && (
              <Text style={styles.noUpdatesText}>
                No further status updates available
              </Text>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
                    {getStatusName(item.statusId || 0)}
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
                disabled={item.statusId === 4} // Disable if delivered
              >
                <Text style={styles.actionButtonText}>
                  {item.statusId === 4 ? "Completed" : "Update Status"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <StatusUpdateModal />
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
  actionButtonDisabled: {
    backgroundColor: "#CCCCCC",
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
    marginBottom: 8,
  },
  currentStatus: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500'
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
  noUpdatesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic'
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