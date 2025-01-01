import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore();

export default function CreateShipment({ navigation }: { navigation: any }) {
  const auth = getAuth();
  const [transporter, setTransporter] = useState<string | undefined>();
  const [vehicle, setVehicle] = useState<string | undefined>();
  const [contactNumber, setContactNumber] = useState("");
  const [driverName, setDriverName] = useState("");

  const handleSaveShipment = async () => {
    if (!transporter || !vehicle || !contactNumber || !driverName) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      const docRef = await addDoc(collection(db, "shipments"), {
        transporter,
        vehicle,
        contactNumber,
        driverName,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Shipment created successfully!");
      navigation.navigate("ShipmentCreated", { shipmentId: docRef.id });
    } catch (error) {
      Alert.alert("Error", "Failed to save shipment. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Shipment</Text>

      <Text style={styles.sectionTitle}>Assign Transporter</Text>
      <TextInput style={styles.input} placeholder="Search" />
      <Picker
        selectedValue={transporter}
        onValueChange={(itemValue) => setTransporter(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Transporter" value={undefined} />
        <Picker.Item label="CapsLock" value="CapsLock" />
        <Picker.Item label="Spacebar" value="Spacebar" />
      </Picker>

      <Text style={styles.sectionTitle}>Assign Vehicle</Text>
      <TextInput style={styles.input} placeholder="Search" />
      <Picker
        selectedValue={vehicle}
        onValueChange={(itemValue) => setVehicle(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Vehicle" value={undefined} />
        <Picker.Item label="KTU 677 XB" value="KTU 677 XB" />
        <Picker.Item label="KJA 679 XN" value="KJA 679 XN" />
      </Picker>

      <Text style={styles.sectionTitle}>Driver Detail / Others</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Contact Number Here"
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Driver's Name Here"
        value={driverName}
        onChangeText={setDriverName}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveShipment}>
        <Text style={styles.saveButtonText}>Save Shipment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 },
  picker: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 15 },
  saveButton: { backgroundColor: "black", padding: 15, borderRadius: 8, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
