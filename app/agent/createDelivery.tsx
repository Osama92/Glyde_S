// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   FlatList,
//   KeyboardAvoidingView,
//   Image,
//   ScrollView,
// } from "react-native";
// import SearchableDropdown from "react-native-searchable-dropdown";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   setDoc,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router, useLocalSearchParams } from "expo-router";

// // Firestore initialization
// const db = getFirestore(app);

// type Customer = {
//   id: string;
//   name: string;
//   location?: { latitude: number; longitude: number; address: string };
// };

// type Material = {
//   id: string;
//   name: string;
// };

// type Shipment = {
//   id: string;
//   name: string;
//   location?: { latitude: number; longitude: number; address: string };
// };

// type DeliveryMaterial = {
//   name: string;
//   quantity: number;
// };

// export default function CreateDelivery() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [materials, setMaterials] = useState<Material[]>([]);
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//   const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
//   const [deliveryMaterials, setDeliveryMaterials] = useState<DeliveryMaterial[]>([]);
//   const [originPoint, setOriginPoint] = useState<string | null>(null);
//   const [statusID, setStatusID] = useState<number>(1);
//   const [address, setAddress] = useState<string | null>(null);

//   const  {shippingPoint}  = useLocalSearchParams();

//   // Ensure shippingPoint is treated as a string
//   const resolvedShippingPoint = Array.isArray(shippingPoint) ? shippingPoint[0] : shippingPoint;

//   useEffect(() => {
//     // const fetchCustomers = async () => {
//     //   const customerData: Customer[] = [];
//     //   const snapshot = await getDocs(collection(db, "customer"));
//     //   snapshot.forEach((doc) => {
//     //     customerData.push({ id: doc.id, name: doc.data().name, location:doc.data().location });
        
//     //   });
      
//     //   setCustomers(customerData);
      
//     //   setOriginPoint(shippingPoint as string)
//     // };
//     const fetchCustomers = async () => {
//       const customerData: Customer[] = [];
//       const snapshot = await getDocs(collection(db, "customer"));
//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         customerData.push({
//           id: doc.id,
//           name: data.name,
//           location: data.location ? {
//             latitude: data.location.latitude,
//             longitude: data.location.longitude,
//             address: data.location.address
//           } : undefined
//         });
//       });
//       setCustomers(customerData);
//       setOriginPoint(shippingPoint as string);
//     };

//     const fetchShipments = async () => {
//       const shipmentData: Shipment[] = [];
//       const snapshot = await getDocs(collection(db, "Shipment"));
//       snapshot.forEach((doc) => {
//         shipmentData.push({ id: doc.id, name: doc.id });
//       });
//       setShipments(shipmentData);
//     };

//     fetchCustomers();
//     fetchShipments();
//   }, []);

//   useEffect(() => {
//     if (resolvedShippingPoint) {
//       fetchMaterials(resolvedShippingPoint);
//     }
//   }, [resolvedShippingPoint]);

//   const fetchMaterials = async (origin: string) => {
//     const materialData: Material[] = [];
//     const snapshot = await getDocs(
//       collection(db, `originPoint/${resolvedShippingPoint}/materials`)
//     );
//     snapshot.forEach((doc) => {
//       materialData.push({ id: doc.id, name: doc.data().name });
//     });
//     setMaterials(materialData);
//   };

//   const handleAddMaterial = (materialName: string) => {
//     if (!materialName) {
//       Alert.alert("Error", "Please select material.");
//       return;
//     }

//     // Check if the material is already added
//     const isMaterialAlreadyAdded = deliveryMaterials.some(
//       (mat) => mat.name === materialName
//     );

//     if (isMaterialAlreadyAdded) {
//       Alert.alert("Error", "This material is already added.");
//       return;
//     }

//     setDeliveryMaterials((prev) => [
//       ...prev,
//       { name: materialName, quantity: 0 },
//     ]);

    
//   };

//   const handleSaveDelivery = async () => {
//     if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
//       Alert.alert("Error", "Please fill all fields.");
//       return;
//     }

//     const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;

//     const deliveryData = {
//       customer: selectedCustomer.name,
//       shipment: selectedShipment.name,
//       materials: deliveryMaterials,
//       deliveryNumber,
//       address: selectedCustomer.location?.address,
//       latitude: selectedCustomer.location?.latitude,
//       longitude: selectedCustomer.location?.longitude,
//       createdAt: new Date().toISOString(),
//       statusId: 1,
//     };

//     try {
//       await setDoc(
//         doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
//         deliveryData
//       );
//       Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
//       router.push('/agent/dashboard');
//     } catch (error) {
//       console.error("Error saving delivery:", error);
//       Alert.alert("Error", "Failed to save delivery. Please try again.");
//     }
//   };

//   const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => (
//     <View style={styles.materialRow}>
//       <Text style={styles.materialName}>{item.name}</Text>
//       <TextInput
//         style={styles.quantityInput}
//         placeholder="Qty"
//         keyboardType="numeric"
//         value={item.quantity.toString()}
//         onChangeText={(value) =>
//           setDeliveryMaterials((prev) =>
//             prev.map((mat, idx) =>
//               idx === index ? { ...mat, quantity: parseInt(value) || 0 } : mat
//             )
//           )
//         }
//       />
//       <TouchableOpacity
//         onPress={() =>
//           setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
//         }
//       >
//         <Text style={styles.removeButton}>Remove</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
//       behavior="padding"
//       enabled
//     >
//       <View style={styles.container}>
//         <View style={styles.topSection}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//               Create Delivery
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Image
//               source={require("../../assets/images/Back.png")}
//               style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//             />
//           </TouchableOpacity>
//         </View>

//         <ScrollView keyboardShouldPersistTaps="handled">
//           {/* Customer Section */}
//           <View
//             style={{
//               flexDirection: "row",
//               width: "100%",
//               height: 30,
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text style={styles.label}>Current Shipping Point</Text>
//             <Text style={{ color: "orange" , fontWeight:'bold'}}>{resolvedShippingPoint}</Text>
//           </View>

//           <View
//             style={{
//               flexDirection: "row",
//               width: "100%",
//               height: 30,
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginTop: 10,
//               marginBottom: 10,
//             }}
//           >
//             <Text style={{ fontSize: 28 }}>Deliver to?</Text>
//           </View>
//           <SearchableDropdown
//             items={customers.map((c) => ({ id: c.id, name: c.name }))}
//             // onItemSelect={(item: Customer) => setSelectedCustomer(item)}
//             onItemSelect={(item: { id: string, name: string }) => {
//               const selected = customers.find(c => c.id === item.id);
//               setSelectedCustomer(selected || null);
//             }}
//             placeholder="Select Customer"
//             itemStyle={styles.dropdownItem}
//             itemsContainerStyle={{ maxHeight: 140 }}
//             itemTextStyle={styles.dropdownItemText}
//             textInputProps={{
//               underlineColorAndroid: "transparent",
//               style: {
//                 padding: 12,
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 5,
//               },
//               onTextChange: (text) => null,
//             }}
//           />
//           <View
//             style={{
//               flexDirection: "row",
//               width: "100%",
//               height: 40,
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text style={styles.label1}>{selectedCustomer?.name}</Text>
//             <Text style={styles.label1}>{selectedCustomer?.id}</Text>
//           </View>

//           {/* Materials Section */}
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ fontSize: 28, marginBottom: 10, fontWeight: '500' }}>
//               Item(s) to deliver
//             </Text>
//           </View>
//           <SearchableDropdown
//             items={materials.map((m) => ({ id: m.id, name: m.name }))}
//             onItemSelect={(item: Material) => handleAddMaterial(item.name)}
//             placeholder="Select a Material"
//             itemStyle={styles.dropdownItem}
//             itemTextStyle={styles.dropdownItemText}
//             textInputProps={{
//               underlineColorAndroid: "transparent",
//               style: {
//                 padding: 12,
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 5,
//               },
//               onTextChange: (text) => null,
//             }}
//           />

//           {/* FlatList for Materials */}
//           <FlatList
//             data={deliveryMaterials}
//             renderItem={renderMaterialItem}
//             keyExtractor={(item, index) => index.toString()}
//             contentContainerStyle={{ paddingBottom: 20 }}
//           />

//           {/* Shipment Section */}
//           <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: '400' }}>Assign to Shipment</Text>
//           <SearchableDropdown
//             items={shipments.map((s) => ({ id: s.id, name: s.name }))}
//             onItemSelect={(item: Shipment) => setSelectedShipment(item)}
//             placeholder="Select a Shipment"
//             itemStyle={styles.dropdownItem}
//             itemTextStyle={styles.dropdownItemText}
//             itemsContainerStyle={{ maxHeight: 140 }}
//             textInputProps={{
//               placeholder: "Search Shipment Number",
//               underlineColorAndroid: "transparent",
//               style: {
//                 padding: 12,
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 5,
//               },
//               onTextChange: (text) => null,
//             }}
//           />

//           {/* Save Button */}
//           <TouchableOpacity
//             style={styles.saveButton}
//             onPress={handleSaveDelivery}
//           >
//             <Text style={styles.saveButtonText}>Save Delivery</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     height: "100%",
//     width: "100%",
//     padding: 15,
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     marginTop: 20,
//   },
//   label: {
//     fontSize: 16,
//   },
//   label1: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 20,
//   },
//   dropdownInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//   },
//   dropdownItem: {
//     padding: 10,
//     marginTop: 2,
//     backgroundColor: "#ddd",
//     borderColor: "#bbb",
//     borderWidth: 1,
//     borderRadius: 5,
//   },
//   dropdownItemText: {
//     fontSize: 16,
//   },
//   addButton: {
//     backgroundColor: "orange",
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   addButtonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 16,
//   },
//   materialRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   materialName: {
//     flex: 1,
//     fontSize: 16,
//   },
//   quantityInput: {
//     width: 60,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 5,
//     marginHorizontal: 10,
//   },
//   removeButton: {
//     color: "red",
//   },
//   saveButton: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 10
//   },
//   saveButtonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 18,
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
//   },
// });

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
  Modal,
  ActivityIndicator,
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
import { router, useLocalSearchParams } from "expo-router";

// Firestore initialization
const db = getFirestore(app);

type Customer = {
  id: string;
  name: string;
  location?: { latitude: number; longitude: number; address: string };
};

type Material = {
  id: string;
  name: string;
  weight: number; // Add weight field
};

type Shipment = {
  id: string;
  name: string;
  location?: { latitude: number; longitude: number; address: string };
};

type DeliveryMaterial = {
  name: string;
  quantity: number;
  weight: number; // Add weight field
};

export default function CreateDelivery() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [deliveryMaterials, setDeliveryMaterials] = useState<DeliveryMaterial[]>([]);
  const [originPoint, setOriginPoint] = useState<string | null>(null);
  const [statusID, setStatusID] = useState<number>(1);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { shippingPoint } = useLocalSearchParams();

  // Ensure shippingPoint is treated as a string
  const resolvedShippingPoint = Array.isArray(shippingPoint) ? shippingPoint[0] : shippingPoint;

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      const customerData: Customer[] = [];
      const snapshot = await getDocs(collection(db, "customer"));
      snapshot.forEach((doc) => {
        const data = doc.data();
        customerData.push({
          id: doc.id,
          name: data.name,
          location: data.location ? {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: data.location.address
          } : undefined
        });
      });
      setCustomers(customerData);
      setOriginPoint(shippingPoint as string);
      setIsLoading(false);
    };

    const fetchShipments = async () => {
      setIsLoading(true);
      const shipmentData: Shipment[] = [];
      const snapshot = await getDocs(collection(db, "Shipment"));
      snapshot.forEach((doc) => {
        shipmentData.push({ id: doc.id, name: doc.id });
      });
      setShipments(shipmentData);
      setIsLoading(false);
    };

    fetchCustomers();
    fetchShipments();
  }, []);

  useEffect(() => {
    if (resolvedShippingPoint) {
      fetchMaterials(resolvedShippingPoint);
    }
  }, [resolvedShippingPoint]);

  const fetchMaterials = async (origin: string) => {
    setIsLoading(true);
    const materialData: Material[] = [];
    const snapshot = await getDocs(
      collection(db, `originPoint/${resolvedShippingPoint}/materials`)
    );
    snapshot.forEach((doc) => {
      materialData.push({ id: doc.id, name: doc.data().name, weight: doc.data().weight });
    });
    setMaterials(materialData);
    setIsLoading(false);
  };

  const handleAddMaterial = (materialName: string) => {
    if (!materialName) {
      Alert.alert("Error", "Please select material.");
      return;
    }

    // Check if the material is already added
    const isMaterialAlreadyAdded = deliveryMaterials.some(
      (mat) => mat.name === materialName
    );

    if (isMaterialAlreadyAdded) {
      Alert.alert("Error", "This material is already added.");
      return;
    }

    const selectedMaterial = materials.find((mat) => mat.name === materialName);
    if (selectedMaterial) {
      setDeliveryMaterials((prev) => [
        ...prev,
        { name: materialName, quantity: 0, weight: selectedMaterial.weight },
      ]);
    }
  };

  const handleSaveDelivery = async () => {
    if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setIsLoading(true);

    const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;

    const deliveryData = {
      customer: selectedCustomer.name,
      shipment: selectedShipment.name,
      materials: deliveryMaterials,
      deliveryNumber,
      address: selectedCustomer.location?.address,
      latitude: selectedCustomer.location?.latitude,
      longitude: selectedCustomer.location?.longitude,
      createdAt: new Date().toISOString(),
      statusId: 1,
    };

    try {
      await setDoc(
        doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
        deliveryData
      );
      Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
      router.push('/agent/dashboard');
    } catch (error) {
      console.error("Error saving delivery:", error);
      Alert.alert("Error", "Failed to save delivery. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => (
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
        {/* <Text style={styles.removeButton}>Remove</Text> */}
        <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={{width:30, height:30}}/>
      </TouchableOpacity>
    </View>
  );

  // Calculate total quantity and weight
  const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
  const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity * mat.weight, 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
      behavior="padding"
      enabled
    >
      <View style={styles.container}>
        {/* Loading Modal */}
        <Modal visible={isLoading} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="orange" />
              <Text style={styles.modalText}>Loading...</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Create Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/Back.png")}
              style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Customer Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Current Shipping Point</Text>
            <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliver to?</Text>
            <SearchableDropdown
              items={customers.map((c) => ({ id: c.id, name: c.name }))}
              onItemSelect={(item: { id: string, name: string }) => {
                const selected = customers.find(c => c.id === item.id);
                setSelectedCustomer(selected || null);
              }}
              placeholder="Select Customer"
              itemStyle={styles.dropdownItem}
              itemsContainerStyle={{ maxHeight: 140 }}
              itemTextStyle={styles.dropdownItemText}
              textInputProps={{
                underlineColorAndroid: "transparent",
                style: styles.dropdownInput,
              }}
            />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
              <Text style={styles.customerId}>{selectedCustomer?.id}</Text>
            </View>
          </View>

          {/* Materials Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
            <SearchableDropdown
              items={materials.map((m) => ({ id: m.id, name: m.name }))}
              onItemSelect={(item: Material) => handleAddMaterial(item.name)}
              placeholder="Add a Material"
              itemStyle={styles.dropdownItem}
              itemTextStyle={styles.dropdownItemText}
              textInputProps={{
                underlineColorAndroid: "transparent",
                style: styles.dropdownInput,
              }}
            />

            {/* FlatList for Materials */}
            <FlatList
              data={deliveryMaterials}
              renderItem={renderMaterialItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 20, marginTop:20 }}
            />

            {/* Total Quantity and Weight */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>Total Quantity: {totalQuantity}</Text>
              <Text style={styles.summaryText}>Total Weight: {totalWeight.toFixed(2)} kg</Text>
            </View>
          </View>

          {/* Shipment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assign to Shipment</Text>
            <SearchableDropdown
              items={shipments.map((s) => ({ id: s.id, name: s.name }))}
              onItemSelect={(item: Shipment) => setSelectedShipment(item)}
              placeholder="Select a Shipment"
              itemStyle={styles.dropdownItem}
              itemTextStyle={styles.dropdownItemText}
              itemsContainerStyle={{ maxHeight: 140 }}
              textInputProps={{
                placeholder: "Search Shipment Number",
                underlineColorAndroid: "transparent",
                style: styles.dropdownInput,
              }}
            />
          </View>

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
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
  },
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  shippingPointText: {
    fontSize: 16,
    color: "orange",
    fontWeight: "bold",
  },
  dropdownInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
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
  customerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
  },
  customerId: {
    fontSize: 15,
    fontWeight: "600",
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  summaryContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
});