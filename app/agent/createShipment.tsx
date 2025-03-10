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
  ScrollView,
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { collection, getDocs, getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { useRouter, useLocalSearchParams } from "expo-router";

const db = getFirestore(app);

interface DropdownItem {
  id: string;
  name: string;
  freight?: number; // Add freightCost to the route data
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
  const [tonnage, setTonnage] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState<DropdownItem[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DropdownItem | null>(null); // State for selected route
  const [freightCost, setFreightCost] = useState<number | null>(null); // State for freight cost
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null); // State for selected vehicle details

  const [fontsLoaded] = useFonts({
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const { shippingPoint } = useLocalSearchParams();

  useEffect(() => {
    const fetchTransportersAndVehicles = async () => {
      setLoading(true);
      try {
        const transporterSet = new Set<string>();
        const vehicleNoData: { transporter: string; vehicleNo: string }[] = [];
        const snapshot = await getDocs(collection(db, "DriverOnBoarding"));

        snapshot.forEach((doc) => {
          const data = doc.data();
          const { LoadingPoint } = data;
          const [transporter, vehicleNo] = doc.id.split("-");

          if (transporter && vehicleNo && LoadingPoint === shippingPoint) {
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
  }, [shippingPoint]);

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

  const fetchVehicleDetails = async (vehicleNo: string) => {
    try {
      const vehicleDoc = await getDocs(collection(db, "DriverOnBoarding"));
      vehicleDoc.forEach((doc) => {
        if (doc.id.includes(vehicleNo)) {
          setSelectedVehicleDetails(doc.data());
          setTonnage(doc.data().tonnage); // Set tonnage for route filtering
          filterRoutesByTonnage(doc.data().tons); // Use tons for filtering routes
        }
      });
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      Alert.alert("Error", "Failed to fetch vehicle details. Please try again.");
    }
  };

  const filterRoutesByTonnage = async (tonnageValue: number) => {
    if (!tonnageValue) {
      setFilteredRoutes([]);
      return;
    }

    try {
      const routesSnapshot = await getDocs(collection(db, "routes")); 
      const filtered = routesSnapshot.docs
        .filter((doc) => doc.data().tonnage === tonnageValue) // Assuming "tonnage" is a field in the document
        .map((doc) => ({
          id: doc.id,
          name: doc.data().desc,
          freight: doc.data().freight, // Include freightCost from the document
        }));

      setFilteredRoutes(filtered);
    } catch (error) {
      console.error("Error filtering routes:", error);
      Alert.alert("Error", "Failed to filter routes. Please try again.");
    }
  };

  const handleSaveShipment = async () => {
    // Validate all fields
    if (!selectedT || !selectedItem || !mobileNumber || !driverName || !selectedRoute || !freightCost) {
      Alert.alert("Error", "Please fill all fields, including selecting a route and ensuring freight cost is available.");
      return;
    }

    const shipmentId = generateShipmentId();
    const shipmentData = {
      transporter: selectedT,
      vehicleNo: selectedItem,
      tonnage: selectedVehicleDetails?.tonnage,
      tons: selectedVehicleDetails.tons,
      mobileNumber,
      driverName,
      route: selectedRoute.name, // Save the selected route
      freightCost: freightCost, // Save the freight cost
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

  const generateShipmentId = () => {
    const randomPart = `${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    return `45-${randomPart}`;
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
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={require("../../assets/images/Back.png")}
                style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollView}>
            <Text style={styles.title}>Assign Transporter</Text>
            <SearchableDropdown
              items={transporters}
              onItemSelect={(item: DropdownItem) => {
                setSelectedTransporter(item);
                setSelectedT(item.name);
              }}
              placeholder="Select a Transporter"
              placeholderTextColor={"#000"}
              containerStyle={styles.dropdownContainer}
              textInputStyle={styles.input}
              itemStyle={styles.item}
              itemTextStyle={styles.itemText}
              textInputProps={{
                underlineColorAndroid: "transparent",
                style: {
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                },
                onTextChange: (text) => null,
              }}
            />

            <View style={{ width: '100%', flexDirection: 'row', height: 30, marginBottom: 10, alignItems: 'center' }}>
              <Image source={require('../../assets/images/cooperation.png')} resizeMode="contain" style={{ width: 30, height: 30 }} />
              <Text style={styles.selectedText}>
                {selectedT}
              </Text>
            </View>

            {selectedTransporter && (
              <>
                <Text style={styles.title}>Assign Vehicle</Text>
                <SearchableDropdown
                  items={filteredVehicleNumbers}
                  onItemSelect={(item: DropdownItem) => {
                    setSelectedItem(item.name);
                    fetchVehicleDetails(item.name); // Fetch vehicle details when a vehicle is selected
                  }}
                  placeholder="Select a Vehicle No"
                  placeholderTextColor={"#000"}
                  containerStyle={styles.dropdownContainer}
                  textInputStyle={styles.input}
                  itemStyle={styles.item}
                  itemTextStyle={styles.itemText}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 5,
                    },
                    onTextChange: (text) => null,
                  }}
                />
                <View style={{ width: '100%', flexDirection: 'row', height: 30, marginBottom: 10, alignItems: 'center' }}>
                  <Image source={require('../../assets/images/truck.png')} resizeMode="contain" style={{ width: 30, height: 30 }} />
                  <Text style={styles.selectedText}>
                    {selectedItem}
                  </Text>
                </View>
              </>
            )}

            {selectedVehicleDetails && (
              <>
                <Text style={styles.title}>Vehicle Details</Text>
                
                <Text>A {selectedVehicleDetails?.tonnage} is a commercial vehicle designed for the efficient transportation of goods, typically handling payloads of up to {selectedVehicleDetails.tons},000 kg</Text>
                
              </>
            )}

            <Text style={styles.title}>Driver Details</Text>
            <Text style={{marginBottom:15}}>Contact Number</Text>
            <TextInput
              placeholder=" Enter Reachable Mobile Number"
              placeholderTextColor={"#000"}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <Text style={{marginBottom:15}}>Driver Name</Text>
            <TextInput
              placeholder="Enter Driver Name"
              placeholderTextColor={"#000"}
              value={driverName}
              onChangeText={setDriverName}
              keyboardType="default"
              style={styles.input}
            />

            {/* Display Filtered Routes */}
            {filteredRoutes.length > 0 ? (
              <>
                <Text style={styles.title}>Select Route</Text>
                <SearchableDropdown
                  items={filteredRoutes}
                  onItemSelect={(item: DropdownItem) => {
                    setSelectedRoute(item);
                    setFreightCost(item.freight || null); // Set freight cost when a route is selected
                  }}
                  placeholder="Select a Route"
                  placeholderTextColor={"#000"}
                  containerStyle={styles.dropdownContainer}
                  textInputStyle={styles.input}
                  itemStyle={styles.item}
                  itemTextStyle={styles.itemText}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 5,
                    },
                    onTextChange: (text) => null,
                  }}
                />
                {selectedRoute && (
                  <Text style={styles.freightCostText}>
                    Freight Cost: ₦{selectedRoute.freight}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.noRoutesText}>No routes created for this tonnage. <Text style={{fontWeight:'bold', color:'black'}}>{selectedVehicleDetails?.tonnage}</Text></Text>
            )}
          </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 10,
    fontWeight:'bold'
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
    marginBottom: 20,
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
    marginLeft: 10,
  },
  freightCostText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "green",
  },
  noRoutesText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    alignSelf:'center'
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