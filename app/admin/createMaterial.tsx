import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';

const db = getFirestore(app);

// Replace with your actual Google Maps API key
const GOOGLE_API_KEY = "AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0";

export default function CreateMaterialScreen() {
  const [originPoints, setOriginPoints] = useState<any[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [materialName, setMaterialName] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [uom, setUom] = useState<string>("Cartons");
  const [productSensitivity, setProductSensitivity] = useState<string>("Fragile");
  const [isNewOrigin, setIsNewOrigin] = useState<boolean>(false);
  const [newOriginName, setNewOriginName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [originAddress, setOriginAddress] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const UoM = [
    { id: 1, name: "Cartons", value: "Cartons" },
    { id: 2, name: "Bags", value: "Bags" },
    { id: 3, name: "Pieces", value: "Pieces" },
    { id: 4, name: "Gallons", value: "Gallons" },
  ];

  const sensitivity = [
    { id: 1, name: "Fragile", value: "Fragile" },
    { id: 2, name: "Flammable", value: "Flammable" },
    { id: 3, name: "Non-Fragile", value: "Non-Fragile" },
  ]

  useEffect(() => {
    fetchOriginPoints();
  }, []);

  const fetchOriginPoints = async () => {
    setIsLoading(true);
    try {
      const originPointsRef = collection(db, "originPoint");
      const querySnapshot = await getDocs(originPointsRef);
      const origins = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOriginPoints(origins);
    } catch (error) {
      console.error("Error fetching origin points:", error);
      Alert.alert("Error", "Failed to fetch origin points.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async (originId: string) => {
    setIsLoading(true);
    try {
      const materialsRef = collection(db, `originPoint/${originId}/materials`);
      const querySnapshot = await getDocs(materialsRef);
      const materialsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMaterials(materialsData);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching materials:", error);
      Alert.alert("Error", "Failed to fetch materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeCoordinates = async () => {
    if (!latitude || !longitude) {
      Alert.alert("Error", "Please enter both latitude and longitude");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat)) {
      Alert.alert("Error", "Invalid latitude value");
      return;
    }

    if (isNaN(lng)) {
      Alert.alert("Error", "Invalid longitude value");
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert("Error", "Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert("Error", "Longitude must be between -180 and 180");
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        setOriginAddress(data.results[0].formatted_address);
      } else {
        Alert.alert("Error", "Could not find address for these coordinates");
        setOriginAddress("");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to geocode coordinates");
    } finally {
      setIsGeocoding(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGeocoding(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      await geocodeCoordinates();
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSaveMaterial = async () => {
    if ((!isNewOrigin && !selectedOrigin) || !materialName.trim() || !weight.trim()) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (isNewOrigin && (!newOriginName.trim() || !latitude || !longitude || !originAddress)) {
      Alert.alert("Error", "Please provide all required location details for the new origin point.");
      return;
    }

    setIsLoading(true);

    try {
      const originId = isNewOrigin ? newOriginName : selectedOrigin.id;

      if (isNewOrigin) {
        const originRef = doc(db, "originPoint", originId);
        await setDoc(originRef, { 
          name: originId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: originAddress,
          createdAt: new Date().toISOString()
        });
      }

      const materialsRef = collection(db, `originPoint/${originId}/materials`);
      await addDoc(materialsRef, {
        name: materialName,
        weight: parseFloat(weight),
        uom,
        productSensitivity,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Material added successfully.");
      setIsCreateModalVisible(false);
      resetForm();
      fetchOriginPoints();
    } catch (error) {
      console.error("Error saving material:", error);
      Alert.alert("Error", "Failed to save material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMaterialName("");
    setWeight("");
    setUom("Cartons");
    setProductSensitivity("Fragile");
    setNewOriginName("");
    setIsNewOrigin(false);
    setLatitude("");
    setLongitude("");
    setOriginAddress("");
  };

  const filteredOrigins = originPoints.filter(origin =>
    origin.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSensitivityIcon = (sensitivity: string) => {
    switch (sensitivity) {
      case "Fragile":
        return <Ionicons name="warning" size={20} color="#FFA500" />;
      case "Flammable":
        return <Ionicons name="flame" size={20} color="#FF4500" />;
      default:
        return <Ionicons name="shield-checkmark" size={20} color="orange" />;
    }
  };

  const getUomIcon = (uom: string) => {
    switch (uom) {
      case "Cartons":
        return <MaterialIcons name="inventory" size={20} color="#2196F3" />;
      case "Bags":
        return <MaterialIcons name="shopping-bag" size={20} color="#795548" />;
      case "Pieces":
        return <MaterialIcons name="style" size={20} color="#9C27B0" />;
      case "Gallons":
        return <MaterialIcons name="local-drink" size={20} color="#03A9F4" />;
      default:
        return <MaterialIcons name="category" size={20} color="#607D8B" />;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material & Origin Management</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search origin points..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Origin Points</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="orange" style={styles.loader} />
        ) : filteredOrigins.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube" size={60} color="#DDD" />
            <Text style={styles.emptyStateText}>No origin points found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? "Try a different search term" : "Create a new origin point"}
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create Origin Point</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredOrigins.map((origin) => (
              <TouchableOpacity
                key={origin.id}
                style={styles.originCard}
                onPress={() => {
                  setSelectedOrigin(origin);
                  fetchMaterials(origin.id);
                }}
              >
                <View style={styles.originCardLeft}>
                  <View style={styles.originIcon}>
                    <Ionicons name="location" size={20} color="orange" />
                  </View>
                  <View style={styles.originInfo}>
                    <Text style={styles.originName}>{origin.id}</Text>
                    <Text style={styles.originDetails}>
                      Tap to view materials
                    </Text>
                    {origin.address && (
                      <Text style={styles.originAddress} numberOfLines={1}>
                        {origin.address}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Materials Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Materials at {selectedOrigin?.id}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {materials.length === 0 ? (
            <View style={styles.modalEmptyState}>
              <FontAwesome name="dropbox" size={60} color="#DDD" />
              <Text style={styles.modalEmptyStateText}>No materials found</Text>
              <Text style={styles.modalEmptyStateSubtext}>
                Add materials to this origin point
              </Text>
            </View>
          ) : (
            <FlatList
              data={materials}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalListContainer}
              renderItem={({ item }) => (
                <View style={styles.materialCard}>
                  <View style={styles.materialHeader}>
                    <Text style={styles.materialName}>{item.name}</Text>
                    <View style={styles.materialWeight}>
                      <Text style={styles.weightText}>{item.weight} kg</Text>
                    </View>
                  </View>
                  <View style={styles.materialDetails}>
                    <View style={styles.detailRow}>
                      {getUomIcon(item.uom)}
                      <Text style={styles.detailText}>{item.uom}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      {getSensitivityIcon(item.productSensitivity)}
                      <Text style={styles.detailText}>{item.productSensitivity}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.modalAddButton}
            onPress={() => {
              setIsModalVisible(false);
              setIsCreateModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.modalAddButtonText}>Add Material</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Create Material Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsCreateModalVisible(false)}
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isNewOrigin ? "Create New Origin" : "Add Material"}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <ScrollView
            style={styles.createFormContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                {isNewOrigin ? "Creating new origin" : "Using existing origin"}
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsNewOrigin(!isNewOrigin)}
              >
                <Text style={styles.toggleButtonText}>
                  {isNewOrigin ? "Use Existing" : "Create New"}
                </Text>
              </TouchableOpacity>
            </View>

            {isNewOrigin ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Origin Name</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Warehouse A"
                    placeholderTextColor="#999"
                    value={newOriginName}
                    onChangeText={setNewOriginName}
                  />
                </View>

                <View style={styles.locationContainer}>
                  <View style={styles.coordinateContainer}>
                    <Text style={styles.inputLabel}>Latitude</Text>
                    <TextInput
                      style={styles.coordinateInput}
                      placeholder="e.g. 40.7128"
                      placeholderTextColor="#999"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.coordinateContainer}>
                    <Text style={styles.inputLabel}>Longitude</Text>
                    <TextInput
                      style={styles.coordinateInput}
                      placeholder="e.g. -74.0060"
                      placeholderTextColor="#999"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.geocodeButton}
                  onPress={geocodeCoordinates}
                  disabled={isGeocoding || !latitude || !longitude}
                >
                  {isGeocoding ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="map" size={20} color="#FFF" />
                      <Text style={styles.geocodeButtonText}>Get Address from Coordinates</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={isGeocoding}
                >
                  {isGeocoding ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="locate" size={20} color="#FFF" />
                      <Text style={styles.locationButtonText}>Use Current Location</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.formInput, styles.disabledInput]}
                    placeholder="Address will appear here after geocoding"
                    placeholderTextColor="#999"
                    value={originAddress}
                    editable={false}
                    multiline
                  />
                </View>
              </>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Select Origin</Text>
                <SearchableDropdown
                  onTextChange={() => {}}
                  onItemSelect={(item) => setSelectedOrigin(item)}
                  containerStyle={styles.dropdownContainer}
                  textInputStyle={styles.dropdownInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  items={originPoints}
                  defaultIndex={0}
                  placeholder={selectedOrigin ? originPoints?.find((c) => c.id === selectedOrigin)?.id : 'Select an Origin Point'}
                  placeholderTextColor="#999"
                  resetValue={false}
                  underlineColorAndroid="transparent"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Material Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Glass Bottles"
                placeholderTextColor="#999"
                value={materialName}
                onChangeText={setMaterialName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 25.5"
                placeholderTextColor="#999"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Unit of Measure</Text>
              <SearchableDropdown
                onItemSelect={(item) => setUom(item.value)}
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                items={UoM}
                defaultIndex={0}
                placeholder={uom ? UoM?.find((c) => c.name === uom)?.name : 'Select UoM'}
                placeholderTextColor="#999"
                resetValue={false}
                underlineColorAndroid="transparent"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Product Sensitivity</Text>
              <SearchableDropdown
                onItemSelect={(item) => setProductSensitivity(item.value)}
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                items={sensitivity}
                defaultIndex={0}
                placeholder={productSensitivity ? sensitivity?.find((c) => c.name === productSensitivity)?.name : 'Select Sensitivity'}
                placeholderTextColor="#999"
                resetValue={false}
                underlineColorAndroid="transparent"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSaveMaterial}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "orange",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  loader: {
    marginVertical: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  emptyStateButton: {
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  listContainer: {
    marginBottom: 16,
  },
  originCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  originCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  originIcon: {
    backgroundColor: "#FFF8E1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  originInfo: {
    flex: 1,
  },
  originName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  originDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  originAddress: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalHeaderRight: {
    width: 40,
  },
  modalEmptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  modalEmptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  modalEmptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  modalListContainer: {
    padding: 16,
  },
  materialCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  materialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  materialWeight: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976D2",
  },
  materialDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  modalAddButton: {
    backgroundColor: "orange",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  modalAddButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  createFormContainer: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#666",
  },
  toggleButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#666",
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
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "orange",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "#FFCC80",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  coordinateContainer: {
    width: '48%',
  },
  coordinateInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  geocodeButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  geocodeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  locationButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});