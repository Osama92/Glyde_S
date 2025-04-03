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

const db = getFirestore(app);

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

  const handleSaveMaterial = async () => {
    if ((!isNewOrigin && !selectedOrigin) || !materialName.trim() || !weight.trim()) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const originId = isNewOrigin ? newOriginName : selectedOrigin.id;

      // If it's a new origin, add it to the "originPoint" collection
      if (isNewOrigin) {
        const originRef = doc(db, "originPoint", originId);
        await setDoc(originRef, { name: originId });
      }

      // Add material to the subcollection
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
      setMaterialName("");
      setWeight("");
      setUom("Cartons");
      setProductSensitivity("Fragile");
      setNewOriginName("");
      setIsNewOrigin(false);

      // Refresh the origin points list
      fetchOriginPoints();
    } catch (error) {
      console.error("Error saving material:", error);
      Alert.alert("Error", "Failed to save material. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                  <View>
                    <Text style={styles.originName}>{origin.id}</Text>
                    <Text style={styles.originDetails}>
                      Tap to view materials
                    </Text>
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
              <Ionicons name="arrow-back" size={24} color="#FFF" />
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
                  placeholder="Select an origin point"
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
                items={[
                  { id: 1, name: "Cartons", value: "Cartons" },
                  { id: 2, name: "Bags", value: "Bags" },
                  { id: 3, name: "Pieces", value: "Pieces" },
                  { id: 4, name: "Gallons", value: "Gallons" },
                ]}
                defaultIndex={0}
                placeholder="Select UoM"
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
                items={[
                  { id: 1, name: "Fragile", value: "Fragile" },
                  { id: 2, name: "Flammable", value: "Flammable" },
                  { id: 3, name: "Non-Fragile", value: "Non-Fragile" },
                ]}
                defaultIndex={0}
                placeholder="Select Sensitivity"
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
  },
  originIcon: {
    backgroundColor: "#E8F5E9",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
    backgroundColor: "#A5D6A7",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});