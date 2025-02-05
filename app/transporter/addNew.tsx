import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  Alert,
  FlatList
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useFonts } from 'expo-font';

const db = getFirestore(app);
const auth = getAuth(app);

export default function Details() {

const [transporterName, setTransporterName] = useState<string | null>(null);
 const [vehicleInput, setVehicleInput] = useState("");
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);



    const [fontsLoaded] = useFonts({
      Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
      Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
    });

    // Add a new vehicle
      const addVehicle = async () => {
        if (!transporterName || !vehicleInput.trim()) {
          Alert.alert("Error", "Please enter a valid vehicle number.");
          return;
        }
    
        setAdding(true);
    
        try {
          const vehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", vehicleInput);
          await setDoc(vehicleDocRef, { createdAt: new Date() });
    
          setVehicles((prev) => [...prev, vehicleInput]);
          setVehicleInput(""); // Clear input field
          Alert.alert("Success", "Vehicle added successfully!");
        } catch (error) {
          console.error("Error adding vehicle:", error);
          Alert.alert("Error", "Failed to add vehicle.");
        } finally {
          setAdding(false);
        }
      };
    
  
    if (!fontsLoaded) return null;

    
  return (
      <View style={styles.container}>
    <TextInput
        style={styles.input}
        placeholder="Enter Vehicle No."
        value={vehicleInput}
        onChangeText={setVehicleInput}
      />
      <TouchableOpacity style={styles.addButton} onPress={addVehicle} disabled={adding}>
        <Text style={styles.buttonText}>{adding ? "Adding..." : "Add Vehicle"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Vehicles Count: {vehicles.length}</Text>
      </TouchableOpacity>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={styles.vehicleItem}>🔹 {item}</Text>}
      />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'yellow'
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  topSection: {
    width: '100%',
    height: '15%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 30,
    
  },
  title: {
    fontSize: 40,
    fontFamily: "Poppins",
    textAlign: "left",
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
    color: '#000',
    marginTop:15
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  passwordInput: {
    height: 50,
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
    color: '#000',
    marginTop:15,
    flex: 1,
    
  },
  toggleButton: {
    marginLeft: 10,
  },
  toggleText: {
    color: "#000"
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
