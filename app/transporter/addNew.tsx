import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { router } from "expo-router";

const db = getFirestore(app);

export default function Details() {
  const [transporterName, setTransporterName] = useState(null);
  const [vehicleInput, setVehicleInput] = useState("");
  const [tonnageInput, setTonnageInput] = useState("");
  const [vehicles, setVehicles] = useState<{ vehicleNo: string; tonnage: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber: any = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransporterData = async () => {
      const transporterRef = collection(db, "transporter");
      const transporterSnapshot = await getDocs(transporterRef);
      let foundTransporter: any = null;

      transporterSnapshot.forEach((doc) => {
        if (doc.id.startsWith(`${phoneNumber}_`)) {
          foundTransporter = doc.id;
        }
      });

      if (!foundTransporter) return;
      setTransporterName(foundTransporter);

      const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
      const vehicleSnapshot = await getDocs(vehicleRef);
      setVehicles(vehicleSnapshot.docs.map((doc) => ({ vehicleNo: doc.id, tonnage: doc.data().tonnage || "N/A" })));
      setLoading(false);
    };
    fetchTransporterData();
  }, [phoneNumber]);

  const addVehicle = async () => {
    if (!transporterName || !vehicleInput.trim() || !tonnageInput.trim()) {
      Alert.alert("Error", "Please enter both vehicle number and tonnage.");
      return;
    }

    try {
      const vehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", vehicleInput);
      await setDoc(vehicleDocRef, { tonnage: tonnageInput, createdAt: new Date() });
      setVehicles((prev) => [...prev, { vehicleNo: vehicleInput, tonnage: tonnageInput }]);
      setVehicleInput("");
      setTonnageInput("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add vehicle.");
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20 }}>Dashboard</Text>
            </TouchableOpacity>
            <Image source={require("../../assets/images/Back.png")} style={{ width: 30, resizeMode: "contain", marginRight: 10 }} />
          </View>

          <Text style={styles.title}>Vehicle List</Text>

          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#000"
            placeholder="Search Vehicle..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={filteredVehicles}
            keyExtractor={(item) => item.vehicleNo}
            ListHeaderComponent={
                <View style={styles.tableHeader}>
                  <Text style={styles.headerText}>Vehicle No</Text>
                  <Text style={styles.headerText}>Tonnage</Text>
                </View>
              }
            ListEmptyComponent={<Text style={styles.noResults}>No vehicles found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.vehicleNo}</Text>
                <Text style={styles.cell}>{item.tonnage}</Text>
              </View>
            )}
          />

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Vehicle</Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Vehicle No."
                  value={vehicleInput}
                  onChangeText={setVehicleInput}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Tonnage"
                  value={tonnageInput}
                  onChangeText={setTonnageInput}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.addButton} onPress={addVehicle}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 8,
  },
  searchInput: {
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  headerText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  topSection: {
    width: '100%',
    height: 60,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  closeButton: { textAlign: "center", marginTop: 10, color: "red" },
  noResults: { textAlign: "center", marginTop: 10, fontSize: 16, color: "gray" },
});
