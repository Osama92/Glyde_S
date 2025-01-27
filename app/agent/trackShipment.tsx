import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  RefreshControl,
  Image
} from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc, query } from "firebase/firestore";
import { router} from "expo-router";
import { app } from "../firebase"; 

const db = getFirestore(app);

type Shipment = {
  id: string;
  driverName: string;
  transporter: string;
  vehicleNo: string;
  mobileNumber: string;
  statusId: number;
  createdAt: string;
};

type Material = {
  id: string;
  name: string;
  quantity: number;
};

type Delivery = {
  id: string;
  materials: Material[];
};

const TrackShipment = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch shipments from Firestore
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "Shipment"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shipment[];
      setShipments(data);
      setFilteredShipments(data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliveries for a selected shipment
  const fetchDeliveries = async (shipmentId: string) => {
    setLoading(true);
    try {
      const deliverySnapshot = await getDocs(collection(db, "Shipment", shipmentId, "deliveries"));
      const deliveryData = deliverySnapshot.docs.map(doc => ({
        id: doc.id,
        materials: doc.data().materials || [],
      })) as Delivery[];
      setDeliveries(deliveryData);
      setSelectedShipmentId(shipmentId);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Pull-to-refresh function for shipments
  const onRefreshShipments = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  // Pull-to-refresh function for deliveries
  const onRefreshDeliveries = async () => {
    setRefreshing(true);
    if (selectedShipmentId) {
      await fetchDeliveries(selectedShipmentId);
    }
    setRefreshing(false);
  };

  // Filter shipments based on search text
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredShipments(shipments);
    } else {
      const filtered = shipments.filter((shipment) =>
        shipment.id.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredShipments(filtered);
    }
  };

  // Render each shipment
  const renderShipment = ({ item }: { item: Shipment }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => fetchDeliveries(item.id)}
    >
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.driverName}</Text>
      <Text style={styles.cell}>{item.transporter}</Text>
      <Text style={styles.cell}>{item.vehicleNo}</Text>
      <Text style={styles.cell}>{item.statusId}</Text>
    </TouchableOpacity>
  );

  // Render each delivery
  const renderDelivery = ({ item }: { item: Delivery }) => (
    <View>
      <Text style={styles.subHeader}>Delivery ID: {item.id}</Text>
      {item.materials.map((material) => (
        <View style={styles.row} key={material.id}>
          <Text style={styles.cell}>{material.name}</Text>
          <Text style={styles.cell}>{material.quantity}</Text>
        </View>
      ))}
    </View>
  );

  // Main UI
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedShipmentId ? (
        // Deliveries View
        <View>
          <Text style={styles.tableHeader}>Deliveries for Shipment {selectedShipmentId}</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Material Name</Text>
            <Text style={[styles.cell, styles.headerCell]}>Quantity</Text>
          </View>
          <FlatList
            data={deliveries}
            renderItem={renderDelivery}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshDeliveries}
              />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No deliveries found.</Text>}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedShipmentId(null)}>
            <Text style={styles.backButtonText}>Back to Shipments</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Shipments View
        <View>
             <View style={styles.topSection}>
                        <TouchableOpacity onPress={() => router.back()}>
                          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Track Shipment</Text>
                        </TouchableOpacity>
                        <Image
                          source={require("../../assets/images/Back.png")}
                          style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
                        />
                      </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Shipment ID..."
            value={searchText}
            onChangeText={handleSearch}
          />
          {/* <Text style={styles.tableHeader}>Shipments</Text> */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Shipment ID</Text>
            <Text style={[styles.cell, styles.headerCell]}>Driver Name</Text>
            <Text style={[styles.cell, styles.headerCell]}>Transporter</Text>
            <Text style={[styles.cell, styles.headerCell]}>Vehicle No</Text>
            <Text style={[styles.cell, styles.headerCell]}>Status</Text>
          </View>
          <FlatList
            data={filteredShipments}
            renderItem={renderShipment}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshShipments}
              />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No shipments found.</Text>}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  headerRow: {
    backgroundColor: "#f0f0f0",
  },
  headerCell: {
    fontWeight: "bold",
    textAlign: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 5,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "black",
    borderRadius: 5,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop:30,
    marginBottom: 10
  },
});

export default TrackShipment;
