import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const db = getFirestore(app);

const ShipmentTrackingScreen = () => {
  interface Shipment {
    id: string;
    vehicleNo?: string;
    driverName?: string;
    route?: string;
    statusId?: number;
    tonnage?: string;
    createdAt?: { toDate: () => Date };
    freightCost?: string;
  }

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [transporterName, setTransporterName] = useState("");

  const statusOptions = [
    { id: "all", label: "All" },
    { id: 1, label: "Loaded", color: "#FFA500" },
    { id: 2, label: "Dispatched", color: "#4CAF50" },
    { id: 3, label: "Intransit", color: "#2196F3" },
    { id: 4, label: "Delivered", color: "#9C27B0" },
    { id: 5, label: "Cancelled", color: "#F44336" },
  ];

  const fetchTransporterData = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (!phoneNumber) return;

      const transporterRef = collection(db, "transporter");
      const q = query(transporterRef, where("phoneNumber", "==", phoneNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const transporterData = querySnapshot.docs[0].data();
        setTransporterName(transporterData.name || "");
        return transporterData.name;
      }
    } catch (error) {
      console.error("Error fetching transporter:", error);
    }
    return "";
  };

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const transporter = await fetchTransporterData();
      if (!transporter) return;

      const shipmentRef = collection(db, "Shipment");
      const q = query(shipmentRef, where("transporter", "==", transporter));
      const querySnapshot = await getDocs(q);

      const shipmentData: any = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setShipments(shipmentData);
      setFilteredShipments(shipmentData);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    if (searchQuery || selectedStatus !== "all") {
      const filtered = shipments.filter(shipment => {
        const matchesSearch = shipment.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.route?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus === "all" || shipment.statusId?.toString() === selectedStatus.toString();

        return matchesSearch && matchesStatus;
      });
      setFilteredShipments(filtered);
    } else {
      setFilteredShipments(shipments);
    }
  }, [searchQuery, selectedStatus, shipments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShipments().finally(() => setRefreshing(false));
  }, [fetchShipments]);

  const getStatusColor = (statusId) => {
    const status = statusOptions.find(opt => opt.id === statusId);
    return status ? status.color : "#777";
  };

  const getStatusLabel = (statusId) => {
    const status = statusOptions.find(opt => opt.id === statusId);
    return status ? status.label : "Unknown";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${parseInt(amount).toLocaleString()}`;
  };

  const renderShipmentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.shipmentCard}
      onPress={() => router.push(`/transporter/shipment-details/${item.id}`)}
    >
      <View style={styles.shipmentHeader}>
        <Text style={styles.vehicleNumber}>{item.vehicleNo || "N/A"}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusId) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.statusId)}</Text>
        </View>
      </View>

      <View style={styles.shipmentBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#555" />
          <Text style={styles.infoText}>{item.driverName || "No driver assigned"}</Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome name="road" size={16} color="#555" />
          <Text style={styles.infoText}>{item.route || "No route specified"}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="local-shipping" size={16} color="#555" />
          <Text style={styles.infoText}>{item.tonnage || "No tonnage specified"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <Text style={styles.dateText}>
            {item.createdAt?.toDate?.().toLocaleDateString() || "No date"}
          </Text>
          <Text style={styles.priceText}>{formatCurrency(item.freightCost)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking my shipments</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vehicle, driver or route..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#777" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
      >
        {statusOptions.map((status: any) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.statusFilterButton,
              selectedStatus === status.id && styles.statusFilterButtonActive,
              selectedStatus === status.id && { backgroundColor: status.color || "#4e9af1" }
            ]}
            onPress={() => setSelectedStatus(status.id)}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === status.id && styles.statusFilterTextActive
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredShipments}
        renderItem={renderShipmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4e9af1"]}
            tintColor="#4e9af1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/images/empty.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No shipments found</Text>
            {searchQuery || selectedStatus !== "all" ? (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
              >
                <Text style={styles.resetButtonText}>Reset filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  statusFilterContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    height: 10,
  },
  statusFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusFilterButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusFilterText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  statusFilterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  shipmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  shipmentBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#777",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#4e9af1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default ShipmentTrackingScreen;