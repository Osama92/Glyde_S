import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface Delivery {
  id: string;
  deliveryNumber: string;
  deliveredAt: string;
  statusId: number;
  customer: string;
  shipmentId: string;
  shipmentData: {
    driverName?: string;
    vehicleNo?: string;
    [key: string]: any;
  };
}

interface Shipment {
  id: string;
  driverName?: string;
  vehicleNo?: string;
  [key: string]: any;
}

const db = getFirestore(app);
const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];

export default function Completed() {
  const [displayName, setDisplayName] = useState<string>("");
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const fetchUserAndDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      
      if (!phoneNumber) {
        Alert.alert("Error", "No phone number found");
        return;
      }

      // Find user in collections
      let userFound = false;
      for (const colName of collections) {
        const userQuery = query(
          collection(db, colName), 
          where("phoneNumber", "==", phoneNumber)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          const userName = userDoc.name || "";
          setDisplayName(userName);
          userFound = true;
          
          // Fetch completed deliveries for this user
          const shipmentQuery = query(collection(db, "Shipment"));
          const shipmentSnapshot = await getDocs(shipmentQuery);
          const completed: Delivery[] = [];

          for (const shipmentDoc of shipmentSnapshot.docs) {
            const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
            const deliveriesQuery = query(
              deliveriesRef,
              where("customer", "==", userName),
              where("statusId", "==", 4)
            );

            const deliveriesSnapshot = await getDocs(deliveriesQuery);
            deliveriesSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
              completed.push({
                id: doc.id,
                ...doc.data() as Omit<Delivery, 'id' | 'shipmentId' | 'shipmentData'>,
                shipmentId: shipmentDoc.id,
                shipmentData: shipmentDoc.data() as Shipment
              });
            });
          }

          // Sort by deliveredAt (newest first)
          completed.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
          setCompletedDeliveries(completed);
          break;
        }
      }

      if (!userFound) {
        Alert.alert("Error", "User not found");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndDeliveries();
  }, [fetchUserAndDeliveries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserAndDeliveries();
  }, [fetchUserAndDeliveries]);

  const renderItem = ({ item }: { item: Delivery }) => (
    <TouchableOpacity 
      style={styles.deliveryCard}
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={16} color="white" />
          <Text style={styles.successText}>Delivered</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.deliveredAt).toLocaleDateString()}
          </Text>
        </View>
        
        {item.shipmentData?.driverName && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>{item.shipmentData.driverName}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Deliveries</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4A90E2"
          />
        }
      >
        {completedDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No completed deliveries found</Text>
          </View>
        ) : (
          <FlatList
            data={completedDeliveries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>

      {/* Delivery Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>Delivery Details</Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Delivery Number:</Text>
                  <Text style={styles.modalValue}>{selectedItem.deliveryNumber}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Delivered On:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedItem.deliveredAt).toLocaleString()}
                  </Text>
                </View>
                
                {selectedItem.shipmentData?.driverName && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Driver:</Text>
                    <Text style={styles.modalValue}>{selectedItem.shipmentData.driverName}</Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  deliveryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  successText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  cardBody: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});