import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";

// Firestore initialization
const db = getFirestore(app);

type Customer = {
  id: string;
  name: string;
};

type Material = {
  id: string;
  name: string;
};

type Shipment = {
  id: string;
  name: string;
};

type DeliveryMaterial = {
  name: string;
  quantity: number;
};

export default function CreateDelivery() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [deliveryMaterials, setDeliveryMaterials] = useState<
    DeliveryMaterial[]
  >([]);
  const [originPoint, setOriginPoint] = useState<string>("");
  const [materialInput, setMaterialInput] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const customerData: Customer[] = [];
      const snapshot = await getDocs(collection(db, "customer"));
      snapshot.forEach((doc) => {
        customerData.push({ id: doc.id, name: doc.data().name });
      });
      setCustomers(customerData);
    };

    const fetchShipments = async () => {
      const shipmentData: Shipment[] = [];
      const snapshot = await getDocs(collection(db, "Shipment"));
      snapshot.forEach((doc) => {
        shipmentData.push({ id: doc.id, name: doc.id });
      });
      setShipments(shipmentData);
    };

    fetchCustomers();
    fetchShipments();
  }, []);

  const fetchMaterials = async (origin: string) => {
    const materialData: Material[] = [];
    const snapshot = await getDocs(
      collection(db, `originPoint/${origin}/materials`)
    );
    //const snapshot = await getDocs(collection(db, `originPoint/${origin}`));
    snapshot.forEach((doc) => {
      materialData.push({ id: doc.id, name: doc.data().name });
    });
    setMaterials(materialData);
  };

  const handleAddMaterial = () => {
    if (!materialInput) {
      Alert.alert("Error", "Please select a material.");
      return;
    }

    setDeliveryMaterials((prev) => [
      ...prev,
      { name: materialInput, quantity: 0 },
    ]);
    setMaterialInput("");
  };

  const handleSaveDelivery = async () => {
    if (
      !selectedCustomer ||
      !selectedShipment ||
      deliveryMaterials.length === 0
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;

    const deliveryData = {
      customer: selectedCustomer.name,
      shipment: selectedShipment.name,
      materials: deliveryMaterials,
      deliveryNumber,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(
        doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
        deliveryData
      );
      Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
    } catch (error) {
      console.error("Error saving delivery:", error);
      Alert.alert("Error", "Failed to save delivery. Please try again.");
    }
  };

  const renderMaterialItem = ({
    item,
    index,
  }: {
    item: DeliveryMaterial;
    index: number;
  }) => (
    <View style={styles.materialRow}>
      <Text style={styles.materialName}>{item.name}</Text>
      <TextInput
        style={styles.quantityInput}
        placeholder="Qty"
        keyboardType="numeric"
        value={item.quantity.toString()}
        onChangeText={(value) =>
          setDeliveryMaterials((prev) =>
            prev.map((mat, idx) =>
              idx === index ? { ...mat, quantity: parseInt(value) || 0 } : mat
            )
          )
        }
      />
      <TouchableOpacity
        onPress={() =>
          setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
        }
      >
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
      behavior="padding"
      enabled
    >
      
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Create Delivery
              </Text>
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/Back.png")}
              style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
            />
          </View>

          <ScrollView  keyboardShouldPersistTaps="handled">
          {/* Customer Section */}
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 30,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.label}>Current Shipping Point</Text>
            <Text style={{ color: "orange" }}>Agbara - Unilever NG</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 30,
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 28 }}>Deliver to?</Text>
          </View>
          <SearchableDropdown
            items={customers.map((c) => ({ id: c.id, name: c.name }))}
            onItemSelect={(item: Customer) => setSelectedCustomer(item)}
            placeholder="Select a Customer"
            itemStyle={styles.dropdownItem}
            itemsContainerStyle={{ maxHeight: 140 }}
            itemTextStyle={styles.dropdownItemText}
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
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 40,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.label1}>{selectedCustomer?.name}</Text>
            <Text style={styles.label1}>{selectedCustomer?.id}</Text>
          </View>

          {/* Origin Point Section */}
          <Text style={styles.label}>Shipping Point</Text>
          <TextInput
            placeholder="Enter Origin Point"
            value={originPoint}
            onChangeText={(value) => {
              setOriginPoint(value);
              fetchMaterials(value);
            }}
            style={styles.input}
          />

          {/* Materials Section */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 10 }}>
              Item(s) to deliver
            </Text>
            <TouchableOpacity onPress={handleAddMaterial}>
              <Text
                style={{ fontSize: 15, color: "orange", fontWeight: "500" }}
              >
                + Add item
              </Text>
            </TouchableOpacity>
          </View>
          <SearchableDropdown
            items={materials.map((m) => ({ id: m.id, name: m.name }))}
            onItemSelect={(item: Material) => setMaterialInput(item.name)}
            placeholder="Select a Item"
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
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

          {/* FlatList for Materials */}
          <FlatList
            data={deliveryMaterials}
            renderItem={renderMaterialItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Shipment Section */}
          <Text style={styles.label}>Assign to Shipment</Text>
          <SearchableDropdown
            items={shipments.map((s) => ({ id: s.id, name: s.name }))}
            onItemSelect={(item: Shipment) => setSelectedShipment(item)}
            placeholder="Select a Shipment"
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={{ maxHeight: 140 }}
            textInputProps={{
              placeholder: "Search Shipping Point",
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

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveDelivery}
          >
            <Text style={styles.saveButtonText}>Save Delivery</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    //flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
  },
  label1: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#ddd",
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  materialName: {
    flex: 1,
    fontSize: 16,
  },
  quantityInput: {
    width: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 10,
  },
  removeButton: {
    color: "red",
  },
  saveButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
