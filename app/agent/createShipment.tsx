import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { collection, getDocs, getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

const db = getFirestore(app);

interface DropdownItem {
  id: string;
  name: string;
}

export default function CreateShipment() {
  const router = useRouter();
  const [transporters, setTransporters] = useState<DropdownItem[]>([]);
  const [vehicleNumbers, setVehicleNumbers] = useState<{ transporter: string; vehicleNo: string }[]>([]);
  const [filteredVehicleNumbers, setFilteredVehicleNumbers] = useState<DropdownItem[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<DropdownItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedT, setSelectedT] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [driverName, setDriverName] = useState("");

  const [fontsLoaded] = useFonts({
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    const fetchTransportersAndVehicles = async () => {
      setLoading(true);
      try {
        const transporterSet = new Set<string>();
        const vehicleNoData: { transporter: string; vehicleNo: string }[] = [];
        const snapshot = await getDocs(collection(db, "DriverOnBoarding"));

        snapshot.forEach((doc) => {
          const [transporter, vehicleNo] = doc.id.split("-");
          if (transporter && vehicleNo) {
            transporterSet.add(transporter);
            vehicleNoData.push({ transporter, vehicleNo });
          }
        });

        setTransporters(
          Array.from(transporterSet).map((item) => ({ id: item, name: item }))
        );
        setVehicleNumbers(vehicleNoData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransportersAndVehicles();
  }, []);

  useEffect(() => {
    if (selectedTransporter) {
      const filtered = vehicleNumbers.filter(
        (item) => item.transporter === selectedTransporter.name
      );
      setFilteredVehicleNumbers(
        filtered.map((item) => ({ id: item.vehicleNo, name: item.vehicleNo }))
      );
    } else {
      setFilteredVehicleNumbers([]);
    }
  }, [selectedTransporter, vehicleNumbers]);

  const generateShipmentId = () => {
    const randomPart = `${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    return `45-${randomPart}`;
  };

  const handleSaveShipment = async () => {
    if (!selectedT || !selectedItem || !mobileNumber || !driverName) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const shipmentId = generateShipmentId();
    const shipmentData = {
      transporter: selectedT,
      vehicleNo: selectedItem,
      mobileNumber,
      driverName,
      statusId: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "Shipment", shipmentId), shipmentData);
      Alert.alert("Success", `Shipment created with ID: ${shipmentId}`);
      router.push({ pathname: "/agent/shipment-detail", params: { shipmentId } });
    } catch (error) {
      console.error("Error saving shipment:", error);
      Alert.alert("Error", "Failed to save shipment. Please try again.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="orange" style={styles.loading} />;
  }

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="orange" style={styles.loading} />;
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Create Shipment</Text>
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/Back.png")}
              style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
            />
          </View>

          <Text style={styles.title}>Assign Transporter</Text>
          <SearchableDropdown
            items={transporters}
            onItemSelect={(item: DropdownItem) => {
              setSelectedTransporter(item);
              setSelectedT(item.name);
            }}
            placeholder="⌕ Select a Transporter"
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.input}
            itemStyle={styles.item}
            itemTextStyle={styles.itemText}
          />

          <View style={{width:'100%', flexDirection:'row', height:30,marginBottom: 10, alignItems:'center'}}>
            <Image source={require('../../assets/images/cooperation.png')} resizeMode="contain" style={{width: 30, height:30}}/>
          <Text style={styles.selectedText}>
            {selectedT}
          </Text>
          </View>

          {selectedTransporter && (
            <>
              <Text style={styles.title}>Assign Vehicle</Text>
              <SearchableDropdown
                items={filteredVehicleNumbers}
                onItemSelect={(item: DropdownItem) => setSelectedItem(item.name)}
                placeholder="Select a Vehicle No"
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.input}
                itemStyle={styles.item}
                itemTextStyle={styles.itemText}
              />
              <View style={{width:'100%', flexDirection:'row', height:30,marginBottom: 10, alignItems:'center'}}>
            <Image source={require('../../assets/images/truck.png')} resizeMode="contain" style={{width: 30, height:30}}/>
          <Text style={styles.selectedText}>
            {selectedItem}
          </Text>
          </View>
            </>
          )}

          <Text style={styles.title}>Driver Details</Text>
          <Text>Contact Number</Text>
          <TextInput
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Text>Driver Name</Text>
          <TextInput
            placeholder="Driver Name"
            value={driverName}
            onChangeText={setDriverName}
            keyboardType="default"
            style={styles.input}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveShipment}>
            <Text style={styles.saveButtonText}>Save Shipment</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  item: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
    marginLeft:10
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
    itemText: {
    fontSize: 16,
  },
});
