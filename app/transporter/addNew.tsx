import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
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
import DateTimePicker from "@react-native-community/datetimepicker"; 
import SearchableDropdown from "react-native-searchable-dropdown";
import { Ionicons } from "@expo/vector-icons";

const db = getFirestore(app);

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

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
    { id: 1, name: "Bus 1 ton", tonnage: 800 },
    { id: 3, name: "Bus 3 ton", tonnage: 2000 },
    { id: 5, name: "Truck 5 ton", tonnage: 4000 },
    { id: 10, name: "Truck 10 ton", tonnage: 9000 },
    { id: 15, name: "Truck 15 ton", tonnage: 14000 },
    { id: 20, name: "Truck 20 ton", tonnage: 19000 },
    { id: 30, name: "Truck 30 ton", tonnage: 29000 },
  ]);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

 
  const isExpiringSoon = (expiryDate: string) => {
    if (expiryDate === "N/A") return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    return expiry <= twoWeeksFromNow && expiry >= today;
  };

  const isExpired = (expiryDate: string) => {
    if (expiryDate === "N/A") return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  // Notification function
  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
    console.log(`Notification sent: ${title} - ${body}`);
  };

  // Check for expiring documents
  const checkExpiryDates = () => {
    vehicles.forEach(vehicle => {
      if (isExpiringSoon(vehicle.insuranceExpiry)) {
        sendNotification(
          `Insurance for ${vehicle.vehicleNo} expires soon!`,
          `Expires on ${vehicle.insuranceExpiry}`
        );
      }
      if (isExpiringSoon(vehicle.roadWorthinessExpiry)) {
        sendNotification(
          `Road Worthiness for ${vehicle.vehicleNo} expires soon!`,
          `Expires on ${vehicle.roadWorthinessExpiry}`
        );
      }
      if (isExpiringSoon(vehicle.hackneyPermitExpiry)) {
        sendNotification(
          `Hackney Permit for ${vehicle.vehicleNo} expires soon!`,
          `Expires on ${vehicle.hackneyPermitExpiry}`
        );
      }
    });
  };


  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    };
    fetchPhoneNumber();
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notifications permission not granted');
      }
    })();
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
      const vehiclesData = vehicleSnapshot.docs.map((doc) => ({
        vehicleNo: doc.id,
        tonnage: doc.data().tonnage || "N/A",
        tons: doc.data().tons || 0,
        brand: doc.data().brand || "N/A",
        color: doc.data().color || "N/A",
        insuranceExpiry: doc.data().insuranceExpiry?.toDate().toDateString() || "N/A",
        roadWorthinessExpiry: doc.data().roadWorthinessExpiry?.toDate().toDateString() || "N/A",
        hackneyPermitExpiry: doc.data().hackneyPermitExpiry?.toDate().toDateString() || "N/A",
      }));
      setVehicles(vehiclesData);
      setLoading(false);

      // Check for expiring documents after loading vehicles
      checkExpiryDates();
    };
    fetchTransporterData();

    // Set up daily check for expiring documents
    const interval = setInterval(checkExpiryDates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
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

  const renderVehicleCard = (item: Vehicle) => (
    <TouchableOpacity 
      key={item.vehicleNo} 
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.vehicleNumber}>{item.vehicleNo}</Text>
        <Text style={styles.tonnageBadge}>{item.tonnage}</Text>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="car-sport" size={16} color="#666" />
          <Text style={styles.detailText}>{item.brand}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="color-palette" size={16} color="#666" />
          <Text style={styles.detailText}>{item.color}</Text>
        </View>
      </View>
      
      <View style={styles.expiryContainer}>
        <View style={styles.expiryItem}>
          <View style={styles.expiryLabelContainer}>
            <Text style={styles.expiryLabel}>Insurance</Text>
            {(isExpiringSoon(item.insuranceExpiry) || isExpired(item.insuranceExpiry)) && (
              <Ionicons name="warning" size={16} color="#FF5252" style={styles.warningIcon} />
            )}
          </View>
          <Text style={[
            styles.expiryDate,
            isExpired(item.insuranceExpiry) && styles.expiredDate,
            isExpiringSoon(item.insuranceExpiry) && styles.expiringSoonDate
          ]}>
            {item.insuranceExpiry}
          </Text>
        </View>
        
        <View style={styles.expiryItem}>
          <View style={styles.expiryLabelContainer}>
            <Text style={styles.expiryLabel}>Roadworthy</Text>
            {(isExpiringSoon(item.roadWorthinessExpiry) || isExpired(item.roadWorthinessExpiry)) && (
              <Ionicons name="warning" size={16} color="#FF5252" style={styles.warningIcon} />
            )}
          </View>
          <Text style={[
            styles.expiryDate,
            isExpired(item.roadWorthinessExpiry) && styles.expiredDate,
            isExpiringSoon(item.roadWorthinessExpiry) && styles.expiringSoonDate
          ]}>
            {item.roadWorthinessExpiry}
          </Text>
        </View>
        
        {/* <View style={styles.expiryItem}>
          <View style={styles.expiryLabelContainer}>
            <Text style={styles.expiryLabel}>Hackney Permit</Text>
            {(isExpiringSoon(item.hackneyPermitExpiry) || isExpired(item.hackneyPermitExpiry)) && (
              <Ionicons name="warning" size={16} color="#FF5252" style={styles.warningIcon} />
            )}
          </View>
          <Text style={[
            styles.expiryDate,
            isExpired(item.hackneyPermitExpiry) && styles.expiredDate,
            isExpiringSoon(item.hackneyPermitExpiry) && styles.expiringSoonDate
          ]}>
            {item.hackneyPermitExpiry}
          </Text>
        </View> */}
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Vehicle Management</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Search and Add Button */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search vehicles..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Vehicle List */}
            {loading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            ) : vehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={60} color="#DDD" />
                <Text style={styles.emptyStateText}>No vehicles found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add your first vehicle to get started
                </Text>
              </View>
            ) : (
              <View style={styles.cardContainer}>
                {vehicles
                  .filter(vehicle => 
                    vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(renderVehicleCard)}
              </View>
            )}

            {/* Add Vehicle Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add New Vehicle</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Vehicle Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. ABC123"
                        placeholderTextColor="#999"
                        value={vehicleInput}
                        onChangeText={(text) => {
                          const formattedText = text
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""); // Allow only A-Z and 0-9
                          setVehicleInput(formattedText);
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Brand</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Toyota"
                        placeholderTextColor="#999"
                        value={vehicleBrand}
                        onChangeText={setVehicleBrand}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Color</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Red"
                        placeholderTextColor="#999"
                        value={vehicleColor}
                        onChangeText={setVehicleColor}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Tonnage</Text>
                      <SearchableDropdown
                        onItemSelect={(item) => {
                          setTonnageInput(item.name), setTons(item.tonnage);
                        }}
                        containerStyle={styles.dropdownContainer}
                        textInputStyle={styles.dropdownInput}
                        itemStyle={styles.dropdownItem}
                        itemTextStyle={styles.dropdownItemText}
                        items={tonnageItems}
                        placeholder={tonnageInput ? tonnageItems?.find((c) => c.name === tonnageInput)?.name : 'Select Tonnage'}
                        placeholderTextColor="#999"
                        resetValue={false}
                        underlineColorAndroid="transparent"
                      />
                    </View>

                    <View style={styles.dateInputGroup}>
                      <Text style={styles.inputLabel}>Insurance Expiry</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => showDatePicker("insurance")}
                      >
                        <Text style={styles.dateInputText}>
                          {insuranceExpiry.toDateString()}
                        </Text>
                        <Ionicons name="calendar" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dateInputGroup}>
                      <Text style={styles.inputLabel}>
                        Road Worthiness Expiry
                      </Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => showDatePicker("roadWorthiness")}
                      >
                        <Text style={styles.dateInputText}>
                          {roadWorthinessExpiry.toDateString()}
                        </Text>
                        <Ionicons name="calendar" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dateInputGroup}>
                      <Text style={styles.inputLabel}>
                        Hackney Permit Expiry
                      </Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => showDatePicker("hackneyPermit")}
                      >
                        <Text style={styles.dateInputText}>
                          {hackneyPermitExpiry.toDateString()}
                        </Text>
                        <Ionicons name="calendar" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {_showDatePicker && (
                      <DateTimePicker
                        value={
                          currentDateType === "insurance"
                            ? insuranceExpiry
                            : currentDateType === "roadWorthiness"
                            ? roadWorthinessExpiry
                            : hackneyPermitExpiry
                        }
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                      />
                    )}

                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.submitButton]}
                        onPress={addVehicle}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.buttonText}>Add Vehicle</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={[styles.buttonText, { color: "#666" }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Vehicle Details Modal */}
            <Modal
              visible={detailsModalVisible}
              transparent
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Vehicle Details</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setDetailsModalVisible(false);
                        setIsEditing(false);
                      }}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalContent}>
                    {isEditing ? (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Vehicle Number</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. ABC123"
                            placeholderTextColor="#999"
                            value={vehicleInput}
                            onChangeText={setVehicleInput}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Brand</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. Toyota"
                            placeholderTextColor="#999"
                            value={vehicleBrand}
                            onChangeText={setVehicleBrand}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Color</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. Red"
                            placeholderTextColor="#999"
                            value={vehicleColor}
                            onChangeText={setVehicleColor}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Tonnage</Text>
                          <SearchableDropdown
                            onItemSelect={(item) => {
                              setTonnageInput(item.name), setTons(item.tonnage);
                            }}
                            containerStyle={styles.dropdownContainer}
                            textInputStyle={styles.dropdownInput}
                            itemStyle={styles.dropdownItem}
                            itemTextStyle={styles.dropdownItemText}
                            items={tonnageItems}
                            placeholder="Select tonnage..."
                            placeholderTextColor="#999"
                            resetValue={false}
                            underlineColorAndroid="transparent"
                          />
                        </View>

                        <View style={styles.dateInputGroup}>
                          <Text style={styles.inputLabel}>
                            Insurance Expiry
                          </Text>
                          <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => showDatePicker("insurance")}
                          >
                            <Text style={styles.dateInputText}>
                              {insuranceExpiry.toDateString()}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.dateInputGroup}>
                          <Text style={styles.inputLabel}>
                            Road Worthiness Expiry
                          </Text>
                          <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => showDatePicker("roadWorthiness")}
                          >
                            <Text style={styles.dateInputText}>
                              {roadWorthinessExpiry.toDateString()}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.dateInputGroup}>
                          <Text style={styles.inputLabel}>
                            Hackney Permit Expiry
                          </Text>
                          <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => showDatePicker("hackneyPermit")}
                          >
                            <Text style={styles.dateInputText}>
                              {hackneyPermitExpiry.toDateString()}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                          </TouchableOpacity>
                        </View>

                        {_showDatePicker && (
                          <DateTimePicker
                            value={
                              currentDateType === "insurance"
                                ? insuranceExpiry
                                : currentDateType === "roadWorthiness"
                                ? roadWorthinessExpiry
                                : hackneyPermitExpiry
                            }
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={handleDateChange}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Vehicle Number</Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.vehicleNo}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Brand</Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.brand}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Color</Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.color}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Tonnage</Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.tonnage}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>
                            Insurance Expiry
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.insuranceExpiry}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>
                            Road Worthiness Expiry
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.roadWorthinessExpiry}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>
                            Hackney Permit Expiry
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedVehicle?.hackneyPermitExpiry}
                          </Text>
                        </View>
                      </>
                    )}

                    <View style={styles.modalButtonContainer}>
                      {isEditing ? (
                        <TouchableOpacity
                          style={[styles.modalButton, styles.submitButton]}
                          onPress={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                          ) : (
                            <Text style={styles.buttonText}>Save Changes</Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.modalButton, styles.editButton]}
                          onPress={handleEdit}
                        >
                          <Text style={styles.buttonText}>Edit Details</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => {
                          setDetailsModalVisible(false);
                          setIsEditing(false);
                        }}
                      >
                        <Text style={[styles.buttonText, { color: "#666" }]}>
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
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
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333",
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  cardContainer: {
    marginBottom: 16,
  },
  vehicleCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  tonnageBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  expiryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryItem: {
    flex: 1,
  },
  expiryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expiryLabel: {
    fontSize: 12,
    color: "#999",
  },
  warningIcon: {
    marginLeft: 4,
  },
  expiryDate: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  expiredDate: {
    color: '#FF5252',
    fontWeight: '600',
  },
  expiringSoonDate: {
    color: '#FFA000',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownContainer: {
    padding: 0,
  },
  dropdownInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemText: {
    color: "#333",
  },
  dateInputGroup: {
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateInputText: {
    fontSize: 16,
    color: "#333",
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});