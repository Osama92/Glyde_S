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
//   Modal,
// } from "react-native";
// import SearchableDropdown from "react-native-searchable-dropdown";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   setDoc,
//   updateDoc,
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
//   weight: number; 
// };

// type Shipment = {
//   id: string;
//   name: string;
//   tons: number;
//   location?: { latitude: number; longitude: number; address: string };
// };

// type DeliveryMaterial = {
//   name: string;
//   quantity: number;
//   totalWeight: number;
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
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [remainingCapacity, setRemainingCapacity] = useState<number>(0);
//   const [utilization, setUtilization] = useState<number>(0);

//   const { shippingPoint } = useLocalSearchParams();
//   const resolvedShippingPoint = Array.isArray(shippingPoint) ? shippingPoint[0] : shippingPoint;

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       setIsLoading(true);
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
//       setIsLoading(false);
//     };

//     const fetchShipments = async () => {
//       setIsLoading(true);
//       const shipmentData: Shipment[] = [];
//       const snapshot = await getDocs(collection(db, "Shipment"));
//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         shipmentData.push({ 
//           id: doc.id, 
//           name: doc.id, 
//           tons: data.tons || 0
//         });
//       });
//       setShipments(shipmentData);
//       setIsLoading(false);
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
//     setIsLoading(true);
//     const materialData: Material[] = [];
//     const snapshot = await getDocs(
//       collection(db, `originPoint/${resolvedShippingPoint}/materials`)
//     );
//     snapshot.forEach((doc) => {
//       materialData.push({ id: doc.id, name: doc.data().name, weight: doc.data().weight});
//     });
//     setMaterials(materialData);
//     setIsLoading(false);
//   };

//   const handleAddMaterial = (materialName: string) => {
//     if (!materialName) {
//       Alert.alert("Error", "Please select material.");
//       return;
//     }
  
//     const isMaterialAlreadyAdded = deliveryMaterials.some(
//       (mat) => mat.name === materialName
//     );
  
//     if (isMaterialAlreadyAdded) {
//       Alert.alert("Error", "This material is already added.");
//       return;
//     }
  
//     const selectedMaterial = materials.find((mat) => mat.name === materialName);
//     if (selectedMaterial) {
//       setDeliveryMaterials((prev) => [
//         ...prev,
//         { 
//           name: materialName, 
//           quantity: 0, 
//           totalWeight: 0,
//         },
//       ]);
//     }
//   };

//   const handleSaveDelivery = async () => {
//     if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
//       Alert.alert("Error", "Please fill all fields.");
//       return;
//     }
  
//     const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);
  
//     if (totalWeight > selectedShipment.tons) {
//       Alert.alert("Error", `Total weight (${totalWeight} kg) exceeds the shipment's remaining capacity (${remainingCapacity} tons).`);
//       return;
//     }
  
//     setIsLoading(true);
  
//     const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;
  
//     const deliveryData = {
//       customer: selectedCustomer.name,
//       shipment: selectedShipment.name,
//       materials: deliveryMaterials.map((mat) => ({
//         name: mat.name,
//         quantity: mat.quantity,
//         totalWeight: mat.totalWeight,
//       })),
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
  
//       const updatedTons = selectedShipment.tons - totalWeight;
//       await updateDoc(doc(db, "Shipment", selectedShipment.name), {
//         tons: updatedTons,
//       });
  
//       Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
//       router.push('/agent/dashboard');
//     } catch (error) {
//       console.error("Error saving delivery:", error);
//       Alert.alert("Error", "Failed to save delivery. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => {
//     const selectedMaterial = materials.find((mat) => mat.name === item.name);
  
//     return (
//       <View style={styles.materialRow}>
//         <Text style={styles.materialName}>{item.name}</Text>
//         <TextInput
//           style={styles.quantityInput}
//           placeholder="Qty"
//           keyboardType="numeric"
//           value={item.quantity.toString()}
//           onChangeText={(value) => {
//             const quantity = parseInt(value) || 0;
//             const totalWeight = selectedMaterial ? quantity * selectedMaterial.weight : 0;
  
//             setDeliveryMaterials((prev) =>
//               prev.map((mat, idx) =>
//                 idx === index ? { ...mat, quantity, totalWeight } : mat
//               )
//             );
//           }}
//         />
//         <TouchableOpacity
//           onPress={() =>
//             setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
//           }
//         >
//           <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={styles.deleteIcon}/>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
//   const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);

//   useEffect(() => {
//     if (selectedShipment) {
//       const newRemainingCapacity = selectedShipment.tons - totalWeight;
//       setRemainingCapacity(newRemainingCapacity >= 0 ? newRemainingCapacity : 0);
//     }
//   }, [selectedShipment, totalWeight]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior="padding"
//       enabled
//     >
//       <View style={styles.container}>
//         {/* Loading Modal with Logo */}
//         <Modal visible={isLoading} transparent animationType="fade">
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Image 
//                 source={require('../../assets/images/Glyde.png')} 
//                 style={styles.loadingLogo}
//                 resizeMode="contain"
//               />
//               <Text style={styles.modalText}>Processing Delivery...</Text>
//             </View>
//           </View>
//         </Modal>

//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//             <Image
//               source={require("../../assets/images/Back.png")}
//               resizeMode="contain"
//               style={styles.backIcon}
//             />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Create Delivery</Text>
//         </View>

//         <ScrollView 
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Shipping Point Section */}
//           <View style={styles.card}>
//             <Text style={styles.label}>Current Shipping Point</Text>
//             <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
//           </View>

//           {/* Customer Section */}
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Deliver to?</Text>
//             <SearchableDropdown
//               items={customers.map((c) => ({ id: c.id, name: c.name }))}
//               onItemSelect={(item: { id: string, name: string }) => {
//                 const selected = customers.find(c => c.id === item.id);
//                 setSelectedCustomer(selected || null);
//               }}
//               placeholder="Select Customer"
//               itemStyle={styles.dropdownItem}
//               itemsContainerStyle={styles.dropdownItemsContainer}
//               itemTextStyle={styles.dropdownItemText}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//             {selectedCustomer && (
//               <View style={styles.customerDetails}>
//                 <Text style={styles.customerName}>{selectedCustomer.name}</Text>
//                 <Text style={styles.customerAddress}>{selectedCustomer.location?.address}</Text>
//               </View>
//             )}
//           </View>

//           {/* Shipment Section */}
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Assign to Shipment</Text>
//             <SearchableDropdown
//               items={shipments.map((s) => ({ id: s.id, name: s.name, tons: s.tons }))}
//               onItemSelect={(item: Shipment) => {
//                 setSelectedShipment(item);
//                 setRemainingCapacity(item.tons || 0);
//               }}
//               placeholder="Select a Shipment"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               itemsContainerStyle={styles.dropdownItemsContainer}
//               textInputProps={{
//                 placeholder: "Search Shipment Number",
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//             {selectedShipment && (
//               <View style={styles.capacityContainer}>
//                 <Text style={styles.capacityText}>Shipment Capacity: {selectedShipment.tons || 0} tons</Text>
//                 <Text style={[styles.capacityText, {color: remainingCapacity < 0 ? 'red' : 'green'}]}>
//                   Remaining: {remainingCapacity.toFixed(2)} tons
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Materials Section */}
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
//             <SearchableDropdown
//               items={materials.map((m) => ({ id: m.id, name: m.name }))}
//               onItemSelect={(item: Material) => handleAddMaterial(item.name)}
//               placeholder="Add a Material"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               itemsContainerStyle={styles.dropdownItemsContainer}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />

//             <FlatList
//               data={deliveryMaterials}
//               renderItem={renderMaterialItem}
//               keyExtractor={(item, index) => index.toString()}
//               contentContainerStyle={styles.materialsList}
//               scrollEnabled={false}
//             />

//             {/* Summary Section */}
//             {deliveryMaterials.length > 0 && (
//               <View style={styles.summaryContainer}>
//                 <View style={styles.summaryRow}>
//                   <Text style={styles.summaryLabel}>Total Quantity:</Text>
//                   <Text style={styles.summaryValue}>{totalQuantity}</Text>
//                 </View>
//                 <View style={styles.summaryRow}>
//                   <Text style={styles.summaryLabel}>Total Weight:</Text>
//                   <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kg</Text>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Save Button */}
//           <TouchableOpacity
//             style={[styles.saveButton, (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) && styles.disabledButton]}
//             onPress={handleSaveDelivery}
//             disabled={!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0}
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
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   backIcon: {
//     width: 24,
//     height: 24,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   scrollContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 30,
//     borderRadius: 15,
//     alignItems: "center",
//     width: '80%',
//   },
//   loadingLogo: {
//     width: 100,
//     height: 100,
//     marginBottom: 20,
//   },
//   modalText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#555',
//     fontWeight: '500',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 15,
//     color: '#333',
//   },
//   label: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 5,
//   },
//   shippingPointText: {
//     fontSize: 16,
//     color: "orange",
//     fontWeight: "bold",
//   },
//   dropdownInput: {
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     backgroundColor: '#f9f9f9',
//     fontSize: 15,
//   },
//   dropdownItem: {
//     padding: 12,
//     backgroundColor: "#f9f9f9",
//     borderBottomColor: "#eee",
//     borderBottomWidth: 1,
//   },
//   dropdownItemsContainer: {
//     maxHeight: 200,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginTop: 5,
//   },
//   dropdownItemText: {
//     fontSize: 15,
//     color: '#333',
//   },
//   customerDetails: {
//     marginTop: 15,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: '#333',
//     marginBottom: 5,
//   },
//   customerAddress: {
//     fontSize: 14,
//     color: '#666',
//   },
//   materialRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   materialName: {
//     flex: 2,
//     fontSize: 15,
//     color: '#444',
//   },
//   quantityInput: {
//     width: 70,
//     height: 40,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 10,
//     marginHorizontal: 10,
//     textAlign: 'center',
//     backgroundColor: '#f9f9f9',
//   },
//   deleteIcon: {
//     width: 24,
//     height: 24,
//     tintColor: '#ff4444',
//   },
//   materialsList: {
//     marginTop: 15,
//   },
//   capacityContainer: {
//     marginTop: 15,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   capacityText: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   summaryContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 15,
//     color: '#555',
//     fontWeight: '500',
//   },
//   summaryValue: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//   },
//   saveButton: {
//     backgroundColor: "#FFA500",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   disabledButton: {
//     backgroundColor: "#ccc",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

import React, { useState, useEffect, useRef } from "react";
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
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
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
  weight: number; 
};

type Shipment = {
  id: string;
  name: string;
  tons: number;
  location?: { latitude: number; longitude: number; address: string };
};

type DeliveryMaterial = {
  name: string;
  quantity: number;
  totalWeight: number;
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
  const [remainingCapacity, setRemainingCapacity] = useState<number>(0);
  const [utilization, setUtilization] = useState<number>(0);
  const [dropdownVisible, setDropdownVisible] = useState({
    customer: false,
    shipment: false,
    material: false
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const customerDropdownRef = useRef<any>(null);
  const shipmentDropdownRef = useRef<any>(null);
  const materialDropdownRef = useRef<any>(null);

  const { shippingPoint } = useLocalSearchParams();
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
        const data = doc.data();
        shipmentData.push({ 
          id: doc.id, 
          name: doc.id, 
          tons: data.tons || 0
        });
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
      materialData.push({ id: doc.id, name: doc.data().name, weight: doc.data().weight});
    });
    setMaterials(materialData);
    setIsLoading(false);
  };

  const handleAddMaterial = (materialName: string) => {
    if (!materialName) {
      Alert.alert("Error", "Please select material.");
      return;
    }
  
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
        { 
          name: materialName, 
          quantity: 0, 
          totalWeight: 0,
        },
      ]);
      setDropdownVisible({...dropdownVisible, material: false});
    }
  };

  const handleSaveDelivery = async () => {
    if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
  
    const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);
  
    if (totalWeight > selectedShipment.tons) {
      Alert.alert("Error", `Total weight (${totalWeight} kg) exceeds the shipment's remaining capacity (${remainingCapacity} tons).`);
      return;
    }
  
    setIsLoading(true);
  
    const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;
  
    const deliveryData = {
      customer: selectedCustomer.name,
      shipment: selectedShipment.name,
      materials: deliveryMaterials.map((mat) => ({
        name: mat.name,
        quantity: mat.quantity,
        totalWeight: mat.totalWeight,
      })),
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
  
      const updatedTons = selectedShipment.tons - totalWeight;
      await updateDoc(doc(db, "Shipment", selectedShipment.name), {
        tons: updatedTons,
      });
  
      Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
      router.push('/agent/dashboard');
    } catch (error) {
      console.error("Error saving delivery:", error);
      Alert.alert("Error", "Failed to save delivery. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => {
    const selectedMaterial = materials.find((mat) => mat.name === item.name);
  
    return (
      <View style={styles.materialRow}>
        <Text style={styles.materialName}>{item.name}</Text>
        <TextInput
          style={styles.quantityInput}
          placeholder="Qty"
          keyboardType="numeric"
          value={item.quantity.toString()}
          onChangeText={(value) => {
            const quantity = parseInt(value) || 0;
            const totalWeight = selectedMaterial ? quantity * selectedMaterial.weight : 0;
  
            setDeliveryMaterials((prev) =>
              prev.map((mat, idx) =>
                idx === index ? { ...mat, quantity, totalWeight } : mat
              )
            );
          }}
          onFocus={() => {
            if (scrollViewRef.current && Platform.OS === 'ios') {
              scrollViewRef.current.scrollTo({ y: 200 * index, animated: true });
            }
          }}
        />
        <TouchableOpacity
          onPress={() =>
            setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
          }
        >
          <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={styles.deleteIcon}/>
        </TouchableOpacity>
      </View>
    );
  };

  const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
  const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);

  useEffect(() => {
    if (selectedShipment) {
      const newRemainingCapacity = selectedShipment.tons - totalWeight;
      setRemainingCapacity(newRemainingCapacity >= 0 ? newRemainingCapacity : 0);
    }
  }, [selectedShipment, totalWeight]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.container}>
          {/* Loading Modal with Logo */}
          <Modal visible={isLoading} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Image 
                  source={require('../../assets/images/Glyde.png')} 
                  style={styles.loadingLogo}
                  resizeMode="contain"
                />
                <Text style={styles.modalText}>Processing Delivery...</Text>
              </View>
            </View>
          </Modal>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image
                source={require("../../assets/images/Back.png")}
                resizeMode="contain"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Delivery</Text>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Shipping Point Section */}
            <View style={styles.card}>
              <Text style={styles.label}>Current Shipping Point</Text>
              <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
            </View>

            {/* Customer Section */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Deliver to?</Text>
              <SearchableDropdown
                ref={customerDropdownRef}
                items={customers.map((c) => ({ id: c.id, name: c.name }))}
                onItemSelect={(item: { id: string, name: string }) => {
                  const selected = customers.find(c => c.id === item.id);
                  setSelectedCustomer(selected || null);
                  setDropdownVisible({...dropdownVisible, customer: false});
                }}
                onTextChange={() => {}}
                defaultIndex={0}
                placeholder="Select Customer"
                resetValue={false}
                underlineColorAndroid="transparent"
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                itemsContainerStyle={styles.dropdownItemsContainer}
                onBlur={() => setDropdownVisible({...dropdownVisible, customer: false})}
                onFocus={() => setDropdownVisible({...dropdownVisible, customer: true})}
              />
              {selectedCustomer && (
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                  <Text style={styles.customerAddress}>{selectedCustomer.location?.address}</Text>
                </View>
              )}
            </View>

            {/* Shipment Section */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Assign to Shipment</Text>
              <SearchableDropdown
                ref={shipmentDropdownRef}
                items={shipments.map((s) => ({ id: s.id, name: s.name, tons: s.tons }))}
                onItemSelect={(item: Shipment) => {
                  setSelectedShipment(item);
                  setRemainingCapacity(item.tons || 0);
                  setDropdownVisible({...dropdownVisible, shipment: false});
                }}
                onTextChange={() => {}}
                defaultIndex={0}
                placeholder="Select a Shipment"
                resetValue={false}
                underlineColorAndroid="transparent"
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                itemsContainerStyle={styles.dropdownItemsContainer}
                onBlur={() => setDropdownVisible({...dropdownVisible, shipment: false})}
                onFocus={() => setDropdownVisible({...dropdownVisible, shipment: true})}
              />
              {selectedShipment && (
                <View style={styles.capacityContainer}>
                  <Text style={styles.capacityText}>Shipment Capacity: {selectedShipment.tons || 0} tons</Text>
                  <Text style={[styles.capacityText, {color: remainingCapacity < 0 ? 'red' : 'green'}]}>
                    Remaining: {remainingCapacity.toFixed(2)} tons
                  </Text>
                </View>
              )}
            </View>

            {/* Materials Section */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
              <SearchableDropdown
                ref={materialDropdownRef}
                items={materials.map((m) => ({ id: m.id, name: m.name }))}
                onItemSelect={(item: Material) => handleAddMaterial(item.name)}
                onTextChange={() => {}}
                defaultIndex={0}
                placeholder="Add a Material"
                resetValue={false}
                underlineColorAndroid="transparent"
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                itemStyle={styles.dropdownItem}
                itemTextStyle={styles.dropdownItemText}
                itemsContainerStyle={styles.dropdownItemsContainer}
                onBlur={() => setDropdownVisible({...dropdownVisible, material: false})}
                onFocus={() => setDropdownVisible({...dropdownVisible, material: true})}
              />

              <FlatList
                data={deliveryMaterials}
                renderItem={renderMaterialItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.materialsList}
                scrollEnabled={false}
              />

              {/* Summary Section */}
              {deliveryMaterials.length > 0 && (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Quantity:</Text>
                    <Text style={styles.summaryValue}>{totalQuantity}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Weight:</Text>
                    <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kg</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) && styles.disabledButton]}
              onPress={handleSaveDelivery}
              disabled={!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0}
            >
              <Text style={styles.saveButtonText}>Save Delivery</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    width: '80%',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  shippingPointText: {
    fontSize: 16,
    color: "orange",
    fontWeight: "bold",
  },
  dropdownContainer: {
    padding: 0,
    marginBottom: 0,
  },
  dropdownInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  dropdownItem: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  customerDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: '#333',
    marginBottom: 5,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  materialName: {
    flex: 2,
    fontSize: 15,
    color: '#444',
  },
  quantityInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#ff4444',
  },
  materialsList: {
    marginTop: 15,
  },
  capacityContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  capacityText: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: "#FFA500",
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});