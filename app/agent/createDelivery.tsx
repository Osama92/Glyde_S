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
//   ActivityIndicator,
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
//   weight: number; 
// };

// type Shipment = {
//   id: string;
//   name: string;
//   location?: { latitude: number; longitude: number; address: string };
// };

// type DeliveryMaterial = {
//   name: string;
//   quantity: number;
//   weight: number; // Add weight field
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

//   const { shippingPoint } = useLocalSearchParams();

//   // Ensure shippingPoint is treated as a string
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
//         shipmentData.push({ id: doc.id, name: doc.id });
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
//       materialData.push({ id: doc.id, name: doc.data().name, weight: doc.data().weight });
//     });
//     setMaterials(materialData);
//     setIsLoading(false);
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

//     const selectedMaterial = materials.find((mat) => mat.name === materialName);
//     if (selectedMaterial) {
//       setDeliveryMaterials((prev) => [
//         ...prev,
//         { name: materialName, quantity: 0, weight: selectedMaterial.weight },
//       ]);
//     }
//   };

//   const handleSaveDelivery = async () => {
//     if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
//       Alert.alert("Error", "Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);

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
//     } finally {
//       setIsLoading(false);
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
//         {/* <Text style={styles.removeButton}>Remove</Text> */}
//         <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={{width:30, height:30}}/>
//       </TouchableOpacity>
//     </View>
//   );

//   // Calculate total quantity and weight
//   const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
//   const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity * mat.weight, 0);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
//       behavior="padding"
//       enabled
//     >
//       <View style={styles.container}>
//         {/* Loading Modal */}
//         <Modal visible={isLoading} transparent>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <ActivityIndicator size="large" color="orange" />
//               <Text style={styles.modalText}>Loading...</Text>
//             </View>
//           </View>
//         </Modal>

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
//           <View style={styles.section}>
//             <Text style={styles.label}>Current Shipping Point</Text>
//             <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Deliver to?</Text>
//             <SearchableDropdown
//               items={customers.map((c) => ({ id: c.id, name: c.name }))}
//               onItemSelect={(item: { id: string, name: string }) => {
//                 const selected = customers.find(c => c.id === item.id);
//                 setSelectedCustomer(selected || null);
//               }}
//               placeholder="Select Customer"
//               itemStyle={styles.dropdownItem}
//               itemsContainerStyle={{ maxHeight: 140 }}
//               itemTextStyle={styles.dropdownItemText}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//             <View style={styles.customerDetails}>
//               <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
//               <Text style={styles.customerId}>{selectedCustomer?.id}</Text>
//             </View>
//           </View>

//           {/* Materials Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
//             <SearchableDropdown
//               items={materials.map((m) => ({ id: m.id, name: m.name }))}
//               onItemSelect={(item: Material) => handleAddMaterial(item.name)}
//               placeholder="Add a Material"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />

//             {/* FlatList for Materials */}
//             <FlatList
//               data={deliveryMaterials}
//               renderItem={renderMaterialItem}
//               keyExtractor={(item, index) => index.toString()}
//               contentContainerStyle={{ paddingBottom: 20, marginTop:20 }}
//             />

//             {/* Total Quantity and Weight */}
//             <View style={styles.summaryContainer}>
//               <Text style={styles.summaryText}>Total Quantity: {totalQuantity}</Text>
//               <Text style={styles.summaryText}>Total Weight: {totalWeight.toFixed(2)} kg</Text>
//             </View>
//           </View>

//           {/* Shipment Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Assign to Shipment</Text>
//             <SearchableDropdown
//               items={shipments.map((s) => ({ id: s.id, name: s.name }))}
//               onItemSelect={(item: Shipment) => setSelectedShipment(item)}
//               placeholder="Select a Shipment"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               itemsContainerStyle={{ maxHeight: 140 }}
//               textInputProps={{
//                 placeholder: "Search Shipment Number",
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//           </View>

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
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   modalText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 28,
//     fontWeight: "500",
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 16,
//     color: "#666",
//   },
//   shippingPointText: {
//     fontSize: 16,
//     color: "orange",
//     fontWeight: "bold",
//   },
//   dropdownInput: {
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
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
//   customerDetails: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   customerName: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   customerId: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   materialRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
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
//   summaryContainer: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 5,
//   },
//   summaryText: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   saveButton: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   saveButtonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 18,
//   },
// });


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
//   ActivityIndicator,
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
//   tons: number; // Add tons field
//   location?: { latitude: number; longitude: number; address: string };
// };

// type DeliveryMaterial = {
//   name: string;
//   quantity: number;
//   weight: number; // Add weight field
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
//   const [remainingCapacity, setRemainingCapacity] = useState<number>(0); // Initialize with 0

//   const { shippingPoint } = useLocalSearchParams();

//   // Ensure shippingPoint is treated as a string
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
//         console.log("Shipment Data:", data); // Debugging: Log shipment data
//         shipmentData.push({ 
//           id: doc.id, 
//           name: doc.id, 
//           tons: data.tons || 0 // Fallback for undefined tons
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
//       materialData.push({ id: doc.id, name: doc.data().name, weight: doc.data().weight });
//     });
//     setMaterials(materialData);
//     setIsLoading(false);
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

//     const selectedMaterial = materials.find((mat) => mat.name === materialName);
//     if (selectedMaterial) {
//       setDeliveryMaterials((prev) => [
//         ...prev,
//         { name: materialName, quantity: 0, weight: selectedMaterial.weight },
//       ]);
//     }
//   };

//   const handleSaveDelivery = async () => {
//     if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
//       Alert.alert("Error", "Please fill all fields.");
//       return;
//     }

//     // Calculate total weight
//     const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity * mat.weight, 0);

//     // Check if total weight exceeds the shipment's remaining capacity
//     if (totalWeight > selectedShipment.tons) {
//       Alert.alert("Error", `Total weight (${totalWeight} kg) exceeds the shipment's remaining capacity (${remainingCapacity} tons).`);
//       return;
//     }

//     setIsLoading(true);

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
//       // Save the delivery
//       await setDoc(
//         doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
//         deliveryData
//       );

//       // Update the shipment's remaining capacity
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
//         <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={{width:30, height:30}}/>
//       </TouchableOpacity>
//     </View>
//   );

//   // Calculate total quantity and weight
//   const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
//   const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity * mat.weight, 0);

//   // Update remaining capacity when shipment is selected or items change
//   useEffect(() => {
//     if (selectedShipment) {
//       console.log("Selected Shipment:", selectedShipment.tons); // Debugging: Log selected shipment
//       const newRemainingCapacity = selectedShipment.tons - totalWeight;
//       setRemainingCapacity(newRemainingCapacity >= 0 ? newRemainingCapacity : 0);
//     }
//   }, [selectedShipment, deliveryMaterials]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
//       behavior="padding"
//       enabled
//     >
//       <View style={styles.container}>
//         {/* Loading Modal */}
//         <Modal visible={isLoading} transparent>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <ActivityIndicator size="large" color="orange" />
//               <Text style={styles.modalText}>Loading...</Text>
//             </View>
//           </View>
//         </Modal>

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
//           <View style={styles.section}>
//             <Text style={styles.label}>Current Shipping Point</Text>
//             <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Deliver to?</Text>
//             <SearchableDropdown
//               items={customers.map((c) => ({ id: c.id, name: c.name }))}
//               onItemSelect={(item: { id: string, name: string }) => {
//                 const selected = customers.find(c => c.id === item.id);
//                 setSelectedCustomer(selected || null);
//               }}
//               placeholder="Select Customer"
//               itemStyle={styles.dropdownItem}
//               itemsContainerStyle={{ maxHeight: 140 }}
//               itemTextStyle={styles.dropdownItemText}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//             <View style={styles.customerDetails}>
//               <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
//               <Text style={styles.customerId}>{selectedCustomer?.id}</Text>
//             </View>
//           </View>

//           {/* Shipment Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Assign to Shipment</Text>
//             <SearchableDropdown
//               items={shipments.map((s) => ({ id: s.id, name: s.name, tons: s.tons }))}
//               onItemSelect={(item: Shipment) => {
//                 setSelectedShipment(item);
//                 setRemainingCapacity(selectedShipment?.tons || 0);
//                  console.log(selectedShipment)
//               }}
//               placeholder="Select a Shipment"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               itemsContainerStyle={{ maxHeight: 140 }}
//               textInputProps={{
//                 placeholder: "Search Shipment Number",
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />
//             {selectedShipment && (
//               <Text style={styles.summaryText}>Shipment Capacity: {selectedShipment.tons || 0} tons</Text>
//             )}
//           </View>

//           {/* Materials Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
//             <SearchableDropdown
//               items={materials.map((m) => ({ id: m.id, name: m.name }))}
//               onItemSelect={(item: Material) => handleAddMaterial(item.name)}
//               placeholder="Add a Material"
//               itemStyle={styles.dropdownItem}
//               itemTextStyle={styles.dropdownItemText}
//               textInputProps={{
//                 underlineColorAndroid: "transparent",
//                 style: styles.dropdownInput,
//               }}
//             />

//             {/* FlatList for Materials */}
//             <FlatList
//               data={deliveryMaterials}
//               renderItem={renderMaterialItem}
//               keyExtractor={(item, index) => index.toString()}
//               contentContainerStyle={{ paddingBottom: 20, marginTop:20 }}
//             />

//             {/* Total Quantity and Weight */}
//             <View style={styles.summaryContainer}>
//               <Text style={styles.summaryText}>Total Quantity: {totalQuantity}</Text>
//               <Text style={styles.summaryText}>Total Weight: {totalWeight.toFixed(2)} kg</Text>
//               {selectedShipment && (
//                 <Text style={styles.summaryText}>Remaining Capacity: {(remainingCapacity || 0).toFixed(2)} Kg</Text>
//               )}
//             </View>
//           </View>

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
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   modalText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 28,
//     fontWeight: "500",
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 16,
//     color: "#666",
//   },
//   shippingPointText: {
//     fontSize: 16,
//     color: "orange",
//     fontWeight: "bold",
//   },
//   dropdownInput: {
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
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
//   customerDetails: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   customerName: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   customerId: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   materialRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
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
//   summaryContainer: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: "#f5f5f5",
//     borderRadius: 5,
//   },
//   summaryText: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   saveButton: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   saveButtonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 18,
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
  tons: number; // Add tons field
  location?: { latitude: number; longitude: number; address: string };
};

type DeliveryMaterial = {
  name: string;
  quantity: number;
  totalWeight: number; // Add weight field
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
  const [remainingCapacity, setRemainingCapacity] = useState<number>(0); // Initialize with 0
  const [utilization, setUtilization] = useState<number>(0); // New state for utilization

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
        const data = doc.data();
        console.log("Shipment Data:", data); // Debugging: Log shipment data
        shipmentData.push({ 
          id: doc.id, 
          name: doc.id, 
          tons: data.tons || 0 // Fallback for undefined tons
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

  // const handleAddMaterial = (materialName: string) => {
  //   if (!materialName) {
  //     Alert.alert("Error", "Please select material.");
  //     return;
  //   }

  //   // Check if the material is already added
  //   const isMaterialAlreadyAdded = deliveryMaterials.some(
  //     (mat) => mat.name === materialName
  //   );

  //   if (isMaterialAlreadyAdded) {
  //     Alert.alert("Error", "This material is already added.");
  //     return;
  //   }

  //   const selectedMaterial = materials.find((mat) => mat.name === materialName);
  //   if (selectedMaterial) {
  //     setDeliveryMaterials((prev) => [
  //       ...prev,
  //       { name: materialName, quantity: 0, weight: selectedMaterial.weight },
  //     ]);
  //   }
  // };

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
        { 
          name: materialName, 
          quantity: 0, 
          totalWeight: 0, // Initialize totalWeight to 0
        },
      ]);
    }
  };

  // const handleSaveDelivery = async () => {
  //   if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
  //     Alert.alert("Error", "Please fill all fields.");
  //     return;
  //   }

  //   // Calculate total weight
  //   const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity * mat.weight, 0);

  //   // Check if total weight exceeds the shipment's remaining capacity
  //   if (totalWeight > selectedShipment.tons) {
  //     Alert.alert("Error", `Total weight (${totalWeight} kg) exceeds the shipment's remaining capacity (${remainingCapacity} tons).`);
  //     return;
  //   }

  //   setIsLoading(true);

  //   const deliveryNumber = `W-R${Math.floor(1000 + Math.random() * 9000)}`;

  //   const deliveryData = {
  //     customer: selectedCustomer.name,
  //     shipment: selectedShipment.name,
  //     materials: deliveryMaterials,
  //     deliveryNumber,
  //     address: selectedCustomer.location?.address,
  //     latitude: selectedCustomer.location?.latitude,
  //     longitude: selectedCustomer.location?.longitude,
  //     createdAt: new Date().toISOString(),
  //     statusId: 1,
  //   };

  //   try {
  //     // Save the delivery
  //     await setDoc(
  //       doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
  //       deliveryData
  //     );

  //     // Update the shipment's remaining capacity
  //     const updatedTons = selectedShipment.tons - totalWeight;
  //     await updateDoc(doc(db, "Shipment", selectedShipment.name), {
  //       tons: updatedTons,
  //     });

  //     Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
  //     router.push('/agent/dashboard');
  //   } catch (error) {
  //     console.error("Error saving delivery:", error);
  //     Alert.alert("Error", "Failed to save delivery. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSaveDelivery = async () => {
    if (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
  
    // Calculate total weight of all materials
    const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);
  
    // Check if total weight exceeds the shipment's remaining capacity
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
        totalWeight: mat.totalWeight, // Store totalWeight instead of weight
      })),
      deliveryNumber,
      address: selectedCustomer.location?.address,
      latitude: selectedCustomer.location?.latitude,
      longitude: selectedCustomer.location?.longitude,
      createdAt: new Date().toISOString(),
      statusId: 1,
    };
  
    try {
      // Save the delivery
      await setDoc(
        doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
        deliveryData
      );
  
      // Update the shipment's remaining capacity
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

  // const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => (
  //   <View style={styles.materialRow}>
  //     <Text style={styles.materialName}>{item.name}</Text>
  //     <TextInput
  //       style={styles.quantityInput}
  //       placeholder="Qty"
  //       keyboardType="numeric"
  //       value={item.quantity.toString()}
  //       onChangeText={(value) =>
  //         setDeliveryMaterials((prev) =>
  //           prev.map((mat, idx) =>
  //             idx === index ? { ...mat, quantity: parseInt(value) || 0 } : mat
  //           )
  //         )
  //       }
  //     />
  //     <TouchableOpacity
  //       onPress={() =>
  //         setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
  //       }
  //     >
  //       <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={{width:30, height:30}}/>
  //     </TouchableOpacity>
  //   </View>
  // );

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
        />
        {/* <Text style={styles.summaryText}>Total Weight: {item.totalWeight.toFixed(2)} kg</Text> */}
        <TouchableOpacity
          onPress={() =>
            setDeliveryMaterials((prev) => prev.filter((_, idx) => idx !== index))
          }
        >
          <Image source={require('../../assets/images/delete.png')} resizeMode='contain' style={{width:30, height:30}}/>
        </TouchableOpacity>
      </View>
    );
  };

  // Calculate total quantity and weight
const totalQuantity = deliveryMaterials.reduce((sum, mat) => sum + mat.quantity, 0);
const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);

  
  useEffect(() => {
    if (selectedShipment) {
      const newRemainingCapacity = selectedShipment.tons - totalWeight;
      setRemainingCapacity(newRemainingCapacity >= 0 ? newRemainingCapacity : 0);
    }
  }, [selectedShipment, totalWeight]); // Only run when selectedShipment or totalWeight changes

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

          {/* Shipment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assign to Shipment</Text>
            <SearchableDropdown
              items={shipments.map((s) => ({ id: s.id, name: s.name, tons: s.tons }))}
              onItemSelect={(item: Shipment) => {
                setSelectedShipment(item);
                setRemainingCapacity(item.tons || 0);
              }}
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
            {selectedShipment && (
              <Text style={styles.summaryText}>Shipment Capacity: {selectedShipment.tons || 0} tons</Text>
            )}

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
              {selectedShipment && (
                <Text style={styles.summaryText}>Remaining Capacity: {(remainingCapacity || 0).toFixed(2)} Kg</Text>
              )}
            </View>
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
    width: 80,
    height: 40,
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
    backgroundColor: "#f5f5f5",
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