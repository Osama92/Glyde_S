import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.topSection}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
          Back
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 20, marginTop: 20 }}
        >
          <Image
            source={require("../../assets/images/Back.png")}
            style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Origin Points</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="orange" />
        ) : (
          originPoints.map((origin) => (
            <TouchableOpacity
              key={origin.id}
              style={styles.originItem}
              onPress={() => fetchMaterials(origin.id)}
            >
              <Text style={styles.originText}>{origin.id}</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Create Origin Point</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Materials */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <Text style={styles.modalHeader}>Materials for {selectedOrigin?.id}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {materials.map((material) => (
              <View key={material.id} style={styles.materialItem}>
                <Text style={styles.materialText}>{material.name}</Text>
                <Text style={styles.materialText}>Weight: {material.weight} kg</Text>
                <Text style={styles.materialText}>UoM: {material.uom}</Text>
                <Text style={styles.materialText}>Sensitivity: {material.productSensitivity}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal for Create Material */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <Text style={styles.modalHeader}>Create Material</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.promptText}>Create for an existing origin point?</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsNewOrigin(!isNewOrigin)}
            >
              <Text style={styles.toggleButtonText}>
                {isNewOrigin ? "Use Existing Origin" : "Create New Origin"}
              </Text>
            </TouchableOpacity>

            {isNewOrigin ? (
              <TextInput
                style={styles.input}
                placeholder="Enter New Origin Name"
                placeholderTextColor={"#666"}
                value={newOriginName}
                onChangeText={(text) => setNewOriginName(text)}
              />
            ) : (
              <SearchableDropdown
                onTextChange={(text) => null} // Optional
                onItemSelect={(item) => setSelectedOrigin(item)}
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                items={originPoints}
                defaultIndex={0}
                placeholder="Select Origin"
                resetValue={false}
                underlineColorAndroid="transparent"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Enter Material Name"
              placeholderTextColor={"#666"}
              value={materialName}
              onChangeText={(text) => setMaterialName(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter Material Weight (kg)"
              placeholderTextColor={"#666"}
              value={weight}
              onChangeText={(text) => setWeight(text)}
              keyboardType="numeric"
            />

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
              resetValue={false}
              underlineColorAndroid="transparent"
            />

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
              placeholder="Select Product Sensitivity"
              resetValue={false}
              underlineColorAndroid="transparent"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveMaterial}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Material</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCreateModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  originItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  originText: {
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  materialItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  materialText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  promptText: {
    fontSize: 16,
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  dropdownItem: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItemText: {
    color: "#333",
  },
  saveButton: {
    backgroundColor: "black",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});