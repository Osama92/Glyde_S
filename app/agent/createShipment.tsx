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
  Animated,
  Easing
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { collection, getDocs, getFirestore, doc, setDoc, serverTimestamp, where, query } from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { useRouter, useLocalSearchParams } from "expo-router";
import { sendPushNotification, getDeliveryDriverPushToken } from '../utilities/notification';

const db = getFirestore(app);

interface DropdownItem {
  id: string;
  name: string;
  freight?: number;
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
  const [selectedRoute, setSelectedRoute] = useState<DropdownItem | null>(null);
  const [freightCost, setFreightCost] = useState<number | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [isVehicleAvailable, setIsVehicleAvailable] = useState<boolean>(true);
  const [spinAnim] = useState(new Animated.Value(0));

  const [fontsLoaded] = useFonts({
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const { shippingPoint } = useLocalSearchParams();

  // Animation setup
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const CustomLoader = () => (
    <View style={styles.loaderContainer}>
      <Animated.Image
        source={require('../../assets/images/Glyde.png')} // Replace with your custom image
        style={[styles.loaderImage, { transform: [{ rotate: spin }] }]}
      />
    </View>
  );

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
        Alert.alert("Error", "Failed to fetch data. Please try again.");
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


  const checkVehicleAvailability = async (vehicleNo: string) => {
    try {
      console.log(`Checking availability for vehicle: ${vehicleNo}`);
      
      const q = query(
        collection(db, "Shipment"),
        where("vehicleNo", "==", vehicleNo),
        where("statusId", "!=", 4) // 4 = Delivered status
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} active shipments for this vehicle`);
      
      const isAvailable = querySnapshot.empty;
      setIsVehicleAvailable(isAvailable);
      
      if (!isAvailable) {
        const activeShipments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          status: doc.data().statusId,
          createdAt: doc.data().createdAt?.toDate?.() || 'Unknown'
        }));
        
        console.log('Active shipments:', activeShipments);
        
        Alert.alert(
          "Vehicle Not Available",
          `This vehicle has ${querySnapshot.size} active shipment(s) that haven't been delivered yet.`
        );
      }
    } catch (error) {
      console.error("Error checking vehicle availability:", error);
      
      // More specific error handling
      let errorMessage = "Failed to check vehicle availability. Please try again.";
      if (error instanceof Error) {
        errorMessage += `\n\nTechnical details: ${error.message}`;
      }
      
      Alert.alert("Error", errorMessage);
      setIsVehicleAvailable(true); // Assume available if error occurs
    }
  };



  const fetchVehicleDetails = async (vehicleNo: string) => {
    try {
      const vehicleDoc = await getDocs(collection(db, "DriverOnBoarding"));
      vehicleDoc.forEach((doc) => {
        if (doc.id.includes(vehicleNo)) {
          setSelectedVehicleDetails(doc.data());
          setTonnage(doc.data().tonnage);
          filterRoutesByTonnage(doc.data().tons);
          checkVehicleAvailability(vehicleNo); // Check availability when vehicle is selected
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
        .filter((doc) => doc.data().tonnage === tonnageValue)
        .map((doc) => ({
          id: doc.id,
          name: doc.data().desc,
          freight: doc.data().freight,
        }));

      setFilteredRoutes(filtered);
    } catch (error) {
      console.error("Error filtering routes:", error);
      Alert.alert("Error", "Failed to filter routes. Please try again.");
    }
  };

  const handleSaveShipment = async () => {
    if (!isVehicleAvailable) {
      Alert.alert(
        "Vehicle Not Available",
        "This vehicle has an active shipment that hasn't been delivered yet."
      );
      return;
    }

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
      route: selectedRoute.name,
      freightCost: freightCost,
      statusId: 0, // 0 = Pending status
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "Shipment", shipmentId), shipmentData);
      await sendShipmentNotification(mobileNumber, shipmentId);
      Alert.alert("Success", `Shipment created with ID: ${shipmentId}`);
      router.push({ pathname: "/agent/shipment-detail", params: { shipmentId } });
    } catch (error) {
      console.error("Error saving shipment:", error);
      Alert.alert("Error", "Failed to save shipment. Please try again.");
    }
  };

  // Add this new function to handle notification sending
const sendShipmentNotification = async (phoneNumber: string, shipmentId: string) => {
  try {
    // 1. Get customer's push token from Firestore
    const pushToken = await getDeliveryDriverPushToken(phoneNumber);
    
    if (!pushToken) {
      console.warn("No push token found for driver with phone:", phoneNumber);
      return;
    }
    
    // 2. Send the notification
    await sendPushNotification(
      pushToken,
      "New Shipment Created",
      `Your shipment #${shipmentId} has been created and is on its way!`,
      { shipmentId, type: "shipment_created" }
    );
    
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

  const generateShipmentId = () => {
    const randomPart = `${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    return `45-${randomPart}`;
  };

  if (loading || !fontsLoaded) {
    return <CustomLoader />;
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image
                source={require("../../assets/images/Back.png")}
                resizeMode="contain"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Shipment</Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Vehicle Availability Alert */}
            {!isVehicleAvailable && (
              <View style={styles.availabilityAlert}>
                <Image
                  source={require('../../assets/images/warning.png')}
                  resizeMode="contain"
                  style={styles.warningIcon}
                />
                <Text style={styles.availabilityText}>
                  This vehicle has an active shipment that hasn't been delivered yet.
                </Text>
              </View>
            )}

            {/* Transporter Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assign Transporter</Text>
              <SearchableDropdown
                items={transporters}
                onItemSelect={(item: DropdownItem) => {
                  setSelectedTransporter(item);
                  setSelectedT(item.name);
                }}
                placeholder="Select a Transporter"
                placeholderTextColor="#888"
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                textInputProps={{
                  underlineColorAndroid: "transparent",
                  style: styles.dropdownInput,
                }}
              />
              {selectedT && (
                <View style={styles.selectedItemContainer}>
                  <Image 
                    source={require('../../assets/images/vehicles.png')} 
                    style={styles.icon} 
                  />
                  <Text style={styles.selectedItemText}>{selectedT}</Text>
                </View>
              )}
            </View>

            {/* Vehicle Selection */}
            {selectedTransporter && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assign Vehicle</Text>
                <SearchableDropdown
                  items={filteredVehicleNumbers}
                  onItemSelect={(item: DropdownItem) => {
                    setSelectedItem(item.name);
                    fetchVehicleDetails(item.name);
                  }}
                  placeholder="Select a Vehicle No"
                  placeholderTextColor="#888"
                  containerStyle={styles.dropdownContainer}
                  textInputStyle={styles.dropdownInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: styles.dropdownInput,
                  }}
                />
                {selectedItem && (
                  <View style={styles.selectedItemContainer}>
                    <Image 
                      source={require('../../assets/images/transport.png')} 
                      style={styles.icon} 
                    />
                    <Text style={styles.selectedItemText}>{selectedItem}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Vehicle Details */}
            {selectedVehicleDetails && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Vehicle Details</Text>
                <Text style={styles.cardText}>
                  A {selectedVehicleDetails?.tonnage} is a commercial vehicle designed for the efficient transportation of goods, 
                  typically handling payloads of up to {selectedVehicleDetails.tons},000 kg
                </Text>
              </View>
            )}

            {/* Driver Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contact Number</Text>
                <TextInput
                  placeholder="Enter Reachable Mobile Number"
                  placeholderTextColor="#888"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                  style={styles.textInput}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Driver Name</Text>
                <TextInput
                  placeholder="Enter Driver Name"
                  placeholderTextColor="#888"
                  value={driverName}
                  onChangeText={setDriverName}
                  keyboardType="default"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Route Selection */}
            {filteredRoutes.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Route</Text>
                <SearchableDropdown
                  items={filteredRoutes}
                  onItemSelect={(item: DropdownItem) => {
                    setSelectedRoute(item);
                    setFreightCost(item.freight || null);
                  }}
                  placeholder="Select a Route"
                  placeholderTextColor="#888"
                  containerStyle={styles.dropdownContainer}
                  textInputStyle={styles.dropdownInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: styles.dropdownInput,
                  }}
                />
                {selectedRoute && (
                  <View style={styles.freightCostContainer}>
                    <Text style={styles.freightCostLabel}>Freight Cost:</Text>
                    <Text style={styles.freightCostValue}>₦{selectedRoute.freight}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyRoutesContainer}>
                <Text style={styles.emptyRoutesText}>
                  No routes created for this tonnage. <Text style={styles.tonnageText}>{selectedVehicleDetails?.tonnage}</Text>
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              (!isVehicleAvailable || !selectedRoute) && styles.disabledButton
            ]} 
            onPress={handleSaveShipment}
            disabled={!isVehicleAvailable || !selectedRoute}
          >
            <Text style={styles.saveButtonText}>
              {!isVehicleAvailable ? "Vehicle Not Available" : "Save Shipment"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loaderImage: {
    width: 100,
    height: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  dropdownContainer: {
    padding: 0,
    marginBottom: 12,
  },
  dropdownInput: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#2C3E50",
    fontSize: 16,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  dropdownItemText: {
    color: "#2C3E50",
    fontSize: 16,
  },
  selectedItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#2C3E50",
    fontSize: 16,
  },
  freightCostContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    marginTop: 8,
  },
  freightCostLabel: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    marginRight: 8,
  },
  freightCostValue: {
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "600",
  },
  emptyRoutesContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFEBEE",
    marginBottom: 24,
  },
  emptyRoutesText: {
    fontSize: 14,
    color: "#E53935",
    textAlign: "center",
  },
  tonnageText: {
    fontWeight: "600",
    color: "#2C3E50",
  },
  saveButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#4169E1",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#95A5A6",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  availabilityAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFB74D",
  },
  warningIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: "#FF9800",
  },
  availabilityText: {
    flex: 1,
    fontSize: 14,
    color: "#E65100",
  },
});