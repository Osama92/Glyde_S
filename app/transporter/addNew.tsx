// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   Alert,
//   Modal,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Image,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   setDoc,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { useFonts } from "expo-font";
// import { router } from "expo-router";

// const db = getFirestore(app);

// export default function Details() {
//   const [transporterName, setTransporterName] = useState(null);
//   const [vehicleInput, setVehicleInput] = useState("");
//   const [tonnageInput, setTonnageInput] = useState("");
//   const [vehicles, setVehicles] = useState<{ vehicleNo: string; tonnage: string }[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [fontsLoaded] = useFonts({
//     Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//   });

//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       const storedPhoneNumber: any = await AsyncStorage.getItem("phoneNumber");
//       if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
//     };
//     fetchPhoneNumber();
//   }, []);

//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchTransporterData = async () => {
//       const transporterRef = collection(db, "transporter");
//       const transporterSnapshot = await getDocs(transporterRef);
//       let foundTransporter: any = null;

//       transporterSnapshot.forEach((doc) => {
//         if (doc.id.startsWith(`${phoneNumber}_`)) {
//           foundTransporter = doc.id;
//         }
//       });

//       if (!foundTransporter) return;
//       setTransporterName(foundTransporter);

//       const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
//       const vehicleSnapshot = await getDocs(vehicleRef);
//       setVehicles(vehicleSnapshot.docs.map((doc) => ({ vehicleNo: doc.id, tonnage: doc.data().tonnage || "N/A" })));
//       setLoading(false);
//     };
//     fetchTransporterData();
//   }, [phoneNumber]);

//   const addVehicle = async () => {
//     if (!transporterName || !vehicleInput.trim() || !tonnageInput.trim()) {
//       Alert.alert("Error", "Please enter both vehicle number and tonnage.");
//       return;
//     }

//     try {
//       const vehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", vehicleInput);
//       await setDoc(vehicleDocRef, { tonnage: tonnageInput, createdAt: new Date() });
//       setVehicles((prev) => [...prev, { vehicleNo: vehicleInput, tonnage: tonnageInput }]);
//       setVehicleInput("");
//       setTonnageInput("");
//       setModalVisible(false);
//     } catch (error) {
//       Alert.alert("Error", "Failed to add vehicle.");
//     }
//   };

//   const filteredVehicles = vehicles.filter((vehicle) => vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()));

//   if (!fontsLoaded) return null;

//   return (
//     <KeyboardAvoidingView behavior="padding" style={styles.container}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={styles.container}>
//           <View style={styles.topSection}>
//             <TouchableOpacity onPress={() => router.back()}>
//               <Text style={{ fontSize: 20 }}>Dashboard</Text>
//             </TouchableOpacity>
//             <Image source={require("../../assets/images/Back.png")} style={{ width: 30, resizeMode: "contain", marginRight: 10 }} />
//           </View>

//           <Text style={styles.title}>Vehicle List</Text>

//           <TextInput
//             style={styles.searchInput}
//             placeholderTextColor="#000"
//             placeholder="Search Vehicle..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />

//           <FlatList
//             data={filteredVehicles}
//             keyExtractor={(item) => item.vehicleNo}
//             ListHeaderComponent={
//                 <View style={styles.tableHeader}>
//                   <Text style={styles.headerText}>Vehicle No</Text>
//                   <Text style={styles.headerText}>Tonnage</Text>
//                 </View>
//               }
//             ListEmptyComponent={<Text style={styles.noResults}>No vehicles found.</Text>}
//             renderItem={({ item }) => (
//               <View style={styles.row}>
//                 <Text style={styles.cell}>{item.vehicleNo}</Text>
//                 <Text style={styles.cell}>{item.tonnage}</Text>
//               </View>
//             )}
//           />

//           <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
//             <Text style={styles.buttonText}>Add Vehicle</Text>
//           </TouchableOpacity>

//           <Modal visible={modalVisible} transparent animationType="slide">
//             <View style={styles.modalContainer}>
//               <View style={styles.modalContent}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter Vehicle No."
//                   value={vehicleInput}
//                   onChangeText={setVehicleInput}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter Tonnage"
//                   value={tonnageInput}
//                   onChangeText={setTonnageInput}
//                   keyboardType="numeric"
//                 />
//                 <TouchableOpacity style={styles.addButton} onPress={addVehicle}>
//                   <Text style={styles.buttonText}>Submit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                   <Text style={styles.closeButton}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontFamily: "Poppins",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   input: {
//     height: 50,
//     backgroundColor: "#f3f3f3",
//     borderRadius: 10,
//     fontSize: 18,
//     paddingHorizontal: 10,
//     fontFamily: "Nunito",
//     color: "#000",
//     marginVertical: 8,
//   },
//   searchInput: {
//     height: 50,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 10,
//     fontSize: 18,
//     paddingHorizontal: 10,
//     fontFamily: "Nunito",
//     color: "#000",
//     marginVertical: 10,
//   },
//   addButton: {
//     backgroundColor: "green",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#000",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   headerText: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     paddingVertical: 10,
//   },
//   cell: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 16,
//   },
//   topSection: {
//     width: '100%',
//     height: 60,
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
//   modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
//   closeButton: { textAlign: "center", marginTop: 10, color: "red" },
//   noResults: { textAlign: "center", marginTop: 10, fontSize: 16, color: "gray" },
// });


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
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker"; // Use Expo's DateTimePicker
import SearchableDropdown from "react-native-searchable-dropdown";

const db = getFirestore(app);
const { width } = Dimensions.get("window");

// Define types for the vehicle data
type Vehicle = {
  vehicleNo: string;
  tonnage: string;
  tons: number;
  brand: string;
  color: string;
  insuranceExpiry: string;
  roadWorthinessExpiry: string;
  hackneyPermitExpiry: string;
};

export default function Details() {
  const [transporterName, setTransporterName] = useState<string | null>(null);
  const [vehicleInput, setVehicleInput] = useState<string>("");
  const [tonnageInput, setTonnageInput] = useState<string>("");
  const [tons, setTons] = useState<number | null>(null);
  const [vehicleBrand, setVehicleBrand] = useState<string>("");
  const [vehicleColor, setVehicleColor] = useState<string>("");
  const [insuranceExpiry, setInsuranceExpiry] = useState<Date>(new Date());
  const [roadWorthinessExpiry, setRoadWorthinessExpiry] = useState<Date>(new Date());
  const [hackneyPermitExpiry, setHackneyPermitExpiry] = useState<Date>(new Date());
  const [_showDatePicker, setShowDatePicker] = useState<boolean>(false); // Control date picker visibility
  const [currentDateType, setCurrentDateType] = useState<string | null>(null); // Track which date is being picked
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Tonnage dropdown items
  const [tonnageItems, setTonnageItems] = useState([
    { id: 1, name: "Bus 1 ton" },
    { id: 3, name: "Bus 3 ton" },
    { id: 4, name: "Truck 4 ton" },
    { id: 5, name: "Truck 5 ton" },
    { id: 10, name: "Truck 10 ton" },
    { id: 15, name: "Truck 15 ton" },
    { id: 20, name: "Truck 20 ton" },
    { id: 30, name: "Truck 30 ton" },
  ]);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransporterData = async () => {
      const transporterRef = collection(db, "transporter");
      const transporterSnapshot = await getDocs(transporterRef);
      let foundTransporter: string | null = null;

      transporterSnapshot.forEach((doc) => {
        if (doc.id.startsWith(`${phoneNumber}_`)) {
          foundTransporter = doc.id;
        }
      });

      if (!foundTransporter) return;
      setTransporterName(foundTransporter);

      const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
      const vehicleSnapshot = await getDocs(vehicleRef);
      setVehicles(
        vehicleSnapshot.docs.map((doc) => ({
          vehicleNo: doc.id,
          tonnage: doc.data().tonnage || "N/A",
          tons: doc.data().tons || "N/A",
          brand: doc.data().brand || "N/A",
          color: doc.data().color || "N/A",
          insuranceExpiry: doc.data().insuranceExpiry?.toDate().toDateString() || "N/A",
          roadWorthinessExpiry: doc.data().roadWorthinessExpiry?.toDate().toDateString() || "N/A",
          hackneyPermitExpiry: doc.data().hackneyPermitExpiry?.toDate().toDateString() || "N/A",
        }))
      );
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
      setIsSaving(true);
      const vehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", vehicleInput);
      await setDoc(vehicleDocRef, {
        tonnage: tonnageInput,
        tons: tons,
        brand: vehicleBrand,
        color: vehicleColor,
        insuranceExpiry,
        roadWorthinessExpiry,
        hackneyPermitExpiry,
        createdAt: new Date(),
      });
      setVehicles((prev) => [
        ...prev,
        {
          vehicleNo: vehicleInput,
          tonnage: tonnageInput,
          tons: tons as number,
          brand: vehicleBrand,
          color: vehicleColor,
          insuranceExpiry: insuranceExpiry.toDateString(),
          roadWorthinessExpiry: roadWorthinessExpiry.toDateString(),
          hackneyPermitExpiry: hackneyPermitExpiry.toDateString(),
        },
      ]);
      setVehicleInput("");
      setTonnageInput("");
      setTons(null);
      setVehicleBrand("");
      setVehicleColor("");
      setInsuranceExpiry(new Date());
      setRoadWorthinessExpiry(new Date());
      setHackneyPermitExpiry(new Date());
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  const showDatePicker = (type: string) => {
    setCurrentDateType(type);
    setShowDatePicker(true); // Show the date picker
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      if (currentDateType === 'insurance') {
        setInsuranceExpiry(date);
      } else if (currentDateType === 'roadWorthiness') {
        setRoadWorthinessExpiry(date);
      } else if (currentDateType === 'hackneyPermit') {
        setHackneyPermitExpiry(date);
      }
    }
    
    if (Platform.OS === 'ios') {
      return; // Don't hide the picker yet
    }
    setShowDatePicker(false); // Hide the picker on Android
  };

  

  const handleVehiclePress = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalVisible(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setVehicleInput(selectedVehicle?.vehicleNo || "");
    setTonnageInput(selectedVehicle?.tonnage || "");
    setTons(selectedVehicle?.tons || 0);
    setVehicleBrand(selectedVehicle?.brand || "");
    setVehicleColor(selectedVehicle?.color || "");
    setInsuranceExpiry(new Date(selectedVehicle?.insuranceExpiry || new Date()));
    setRoadWorthinessExpiry(new Date(selectedVehicle?.roadWorthinessExpiry || new Date()));
    setHackneyPermitExpiry(new Date(selectedVehicle?.hackneyPermitExpiry || new Date()));
  };

  const handleSave = async () => {
    Alert.alert(
      "Confirm Save",
      "Are you sure you want to save changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            try {
              setIsSaving(true);
              if (!selectedVehicle || !transporterName) return;

              // If the vehicle number is changed, delete the old document and create a new one
              if (vehicleInput !== selectedVehicle.vehicleNo) {
                const oldVehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", selectedVehicle.vehicleNo);
                await deleteDoc(oldVehicleDocRef);

                const newVehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", vehicleInput);
                await setDoc(newVehicleDocRef, {
                  tonnage: tonnageInput,
                  tons: tons as number,
                  brand: vehicleBrand,
                  color: vehicleColor,
                  insuranceExpiry,
                  roadWorthinessExpiry,
                  hackneyPermitExpiry,
                  createdAt: new Date(),
                });
              } else {
                // Update the existing document
                const vehicleDocRef = doc(db, "transporter", transporterName, "VehicleNo", selectedVehicle.vehicleNo);
                await updateDoc(vehicleDocRef, {
                  tonnage: tonnageInput,
                  tons: tons as number,
                  brand: vehicleBrand,
                  color: vehicleColor,
                  insuranceExpiry,
                  roadWorthinessExpiry,
                  hackneyPermitExpiry,
                });
              }

              // Update the local state
              setVehicles((prev) =>
                prev.map((v) =>
                  v.vehicleNo === selectedVehicle.vehicleNo
                    ? {
                        vehicleNo: vehicleInput, // Update the vehicle number if changed
                        tonnage: tonnageInput,
                        tons: tons as number,
                        brand: vehicleBrand,
                        color: vehicleColor,
                        insuranceExpiry: insuranceExpiry.toDateString(),
                        roadWorthinessExpiry: roadWorthinessExpiry.toDateString(),
                        hackneyPermitExpiry: hackneyPermitExpiry.toDateString(),
                      }
                    : v
                )
              );
              setIsEditing(false);
              setDetailsModalVisible(false);
            } catch (error) {
              Alert.alert("Error", "Failed to update vehicle.");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.topSection}>
              
                <Text style={{ fontSize: 20 }}>Dashboard</Text>
              
              <TouchableOpacity onPress={() => router.back()}>
              <Image source={require("../../assets/images/Back.png")} style={{ width: 30, resizeMode: "contain", marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Vehicle List</Text>

            <TextInput
              style={styles.searchInput}
              placeholderTextColor="#000"
              placeholder="Search Vehicle..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView horizontal>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, { width: 100 }]}>Vehicle No</Text>
                  <Text style={[styles.headerText, { width: 100 }]}>Tonnage</Text>
                  <Text style={[styles.headerText, { width: 100 }]}>Brand</Text>
                  <Text style={[styles.headerText, { width: 100 }]}>Color</Text>
                  <Text style={[styles.headerText, { width: 150 }]}>Insurance Expiry</Text>
                  <Text style={[styles.headerText, { width: 150 }]}>Road Worthiness Expiry</Text>
                  <Text style={[styles.headerText, { width: 150 }]}>Hackney Permit Expiry</Text>
                </View>
                <FlatList
                  data={filteredVehicles}
                  keyExtractor={(item) => item.vehicleNo}
                  ListEmptyComponent={<View style={{width:'100%', height:50, justifyContent:'center'}}><Text style={{marginLeft:10, fontSize:17, color:'grey', fontFamily: 'Roboto'}}>No vehicles found.</Text>
                  </View>}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleVehiclePress(item)}>
                      <View style={styles.row}>
                        <Text style={[styles.cell, { width: 100 }]}>{item.vehicleNo}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{item.tonnage}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{item.brand}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{item.color}</Text>
                        <Text style={[styles.cell, { width: 150 }]}>{item.insuranceExpiry}</Text>
                        <Text style={[styles.cell, { width: 150 }]}>{item.roadWorthinessExpiry}</Text>
                        <Text style={[styles.cell, { width: 150 }]}>{item.hackneyPermitExpiry}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Add Vehicle</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                  <View style={styles.modalContent}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Vehicle No."
                      placeholderTextColor={"#000"}
                      value={vehicleInput}
                      onChangeText={setVehicleInput}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Vehicle Brand"
                      placeholderTextColor={"#000"}
                      value={vehicleBrand}
                      onChangeText={setVehicleBrand}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Vehicle Color"
                      placeholderTextColor={"#000"}
                      value={vehicleColor}
                      onChangeText={setVehicleColor}
                    />
                    <SearchableDropdown
                      onItemSelect={(item) => {setTonnageInput(item.name), setTons(item.id)}}
                      containerStyle={styles.dropdownContainer}
                      textInputStyle={styles.dropdownInput}
                      itemStyle={styles.dropdownItem}
                      itemTextStyle={styles.dropdownItemText}
                      itemsContainerStyle={styles.dropdownItemsContainer}
                      items={tonnageItems}
                      placeholder={tonnageInput ? tonnageItems.find((c) => c.name === tonnageInput)?.name : 'Select Tonnage..'}
                      placeholderTextColor={"#000"}
                      resetValue={false}
                      underlineColorAndroid="transparent"
                      defaultIndex={tonnageItems.findIndex((item) => item.name === tonnageInput)}
                    />
                    <TouchableOpacity onPress={() => showDatePicker('insurance')}>
                      <Text style={styles.input}>Insurance Expiry: {insuranceExpiry.toDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showDatePicker('roadWorthiness')}>
                      <Text style={styles.input}>Road Worthiness Expiry: {roadWorthinessExpiry.toDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showDatePicker('hackneyPermit')}>
                      <Text style={styles.input}>Hackney Permit Expiry: {hackneyPermitExpiry.toDateString()}</Text>
                    </TouchableOpacity>
                    {_showDatePicker && (
                      <View>
                        <DateTimePicker
                          value={
                            currentDateType === 'insurance'
                              ? insuranceExpiry
                              : currentDateType === 'roadWorthiness'
                              ? roadWorthinessExpiry
                              : hackneyPermitExpiry
                          }
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                        />
                       
                      </View>
                    )}

                    <TouchableOpacity style={styles.addButton} onPress={addVehicle}>
                      {isSaving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Submit</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButton}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>

            <Modal visible={detailsModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Vehicle Details</Text>
                    <Text style={styles.detailText}>Vehicle No: {selectedVehicle?.vehicleNo}</Text>
                    <Text style={styles.detailText}>Tonnage: {selectedVehicle?.tonnage}</Text>
                    <Text style={styles.detailText}>Brand: {selectedVehicle?.brand}</Text>
                    <Text style={styles.detailText}>Color: {selectedVehicle?.color}</Text>
                    <Text style={styles.detailText}>Insurance Expiry: {selectedVehicle?.insuranceExpiry}</Text>
                    <Text style={styles.detailText}>Road Worthiness Expiry: {selectedVehicle?.roadWorthinessExpiry}</Text>
                    <Text style={styles.detailText}>Hackney Permit Expiry: {selectedVehicle?.hackneyPermitExpiry}</Text>
                    {isEditing ? (
                      <>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Vehicle No."
                          placeholderTextColor={"#000"}
                          value={vehicleInput}
                          onChangeText={setVehicleInput}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Vehicle Brand"
                          placeholderTextColor={"#000"}
                          value={vehicleBrand}
                          onChangeText={setVehicleBrand}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Vehicle Color"
                          placeholderTextColor={"#000"}
                          value={vehicleColor}
                          onChangeText={setVehicleColor}
                        />
                        <SearchableDropdown
                          onItemSelect={(item) => {setTonnageInput(item.name), setTons(item.id)}}
                          containerStyle={styles.dropdownContainer}
                          textInputStyle={styles.dropdownInput}
                          itemStyle={styles.dropdownItem}
                          itemTextStyle={styles.dropdownItemText}
                          itemsContainerStyle={styles.dropdownItemsContainer}
                          items={tonnageItems}
                          placeholder={tonnageInput ? tonnageItems.find((c) => c.name === tonnageInput)?.name : 'Select Tonnage..'}
                          placeholderTextColor={"#000"}
                          resetValue={false}
                          underlineColorAndroid="transparent"
                          defaultIndex={tonnageItems.findIndex((item) => item.name === tonnageInput)}
                        />
                        <TouchableOpacity onPress={() => showDatePicker('insurance')}>
                          <Text style={styles.input}>Insurance Expiry: {insuranceExpiry.toDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showDatePicker('roadWorthiness')}>
                          <Text style={styles.input}>Road Worthiness Expiry: {roadWorthinessExpiry.toDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showDatePicker('hackneyPermit')}>
                          <Text style={styles.input}>Hackney Permit Expiry: {hackneyPermitExpiry.toDateString()}</Text>
                        </TouchableOpacity>
                        {_showDatePicker && (
                          <DateTimePicker
                            value={
                              currentDateType === 'insurance'
                                ? insuranceExpiry
                                : currentDateType === 'roadWorthiness'
                                ? roadWorthinessExpiry
                                : hackneyPermitExpiry
                            }
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                          />
                        )}
                        <TouchableOpacity style={styles.addButton} onPress={handleSave}>
                          {isSaving ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.buttonText}>Save Changes</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity style={styles.addButton} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                      <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
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
    fontSize: 16,
    textAlign: "center",
  },
  topSection: {
    width: '100%',
    height: 60,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", width:'100%' },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "95%" },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
  },
  closeButton: { textAlign: "center", marginTop: 10, color: "red" },
  noResults: { textAlign: "center", marginTop: 10, fontSize: 16, color: "gray",  alignSelf: 'center' },
  dropdownContainer: {
    marginVertical: 8,
  },
  dropdownInput: {
    height: 50,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 8,
  },
  dropdownItem: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#f3f3f3",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  dropdownItemText: {
    color: "#000",
  },
  dropdownItemsContainer: {
    maxHeight: 400,
  },
  dismissButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  dismissButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});