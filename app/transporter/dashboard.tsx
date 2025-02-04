import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const TransporterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [transporterName, setTransporterName] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          console.error("No phone number found");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
      } catch (error) {
        console.error("Error fetching phone number:", error);
      }
    };

    fetchPhoneNumber();
  }, []);

  // Fetch Transporter Data
  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransporterData = async () => {
      try {
        const transporterRef = collection(db, "Transporter");
        const transporterSnapshot = await getDocs(transporterRef);
        let foundTransporter: any = null;

        transporterSnapshot.forEach((doc) => {
          if (doc.id.startsWith(`${phoneNumber}_`)) {
            foundTransporter = doc.id;
          }
        });

        if (!foundTransporter) {
          console.error("Transporter not found");
          setLoading(false);
          return;
        }

        setTransporterName(foundTransporter);

        // Fetch Vehicles inside transporter
        const vehicleRef = collection(db, "Transporter", foundTransporter, "VehicleNo");
        const vehicleSnapshot = await getDocs(vehicleRef);
        const vehicleList = vehicleSnapshot.docs.map((doc) => doc.id);

        setVehicles(vehicleList);
      } catch (error) {
        console.error("Error fetching transporter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransporterData();
  }, [phoneNumber]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transporter Details</Text>
      {transporterName ? <Text>🚛 {transporterName}</Text> : <Text>No transporter found</Text>}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Vehicles Count: {vehicles.length}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={styles.vehicleItem}>🔹 {item}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  vehicleItem: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default TransporterScreen;
