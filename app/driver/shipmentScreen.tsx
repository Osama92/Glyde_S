import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const ShipmentScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingShipments, setPendingShipments] = useState<any[]>([]);
  const [inTransitShipments, setInTransitShipments] = useState<any[]>([]);
  const [completedShipments, setCompletedShipments] = useState<any[]>([]);

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

  // Render a single shipment item
  const renderShipmentItem = ({ item }: { item: any }) => (
    <View style={styles.shipmentItem}>
      <Text style={styles.shipmentText}>Shipment ID: {item.id}</Text>
      <Text style={styles.shipmentText}>Transporter: {item.transporter || "No description"}</Text>
    </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop:30,
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
});

export default ShipmentScreen;
