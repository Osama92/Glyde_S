// import React, { useState, useEffect, useRef } from "react";
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
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   ActivityIndicator
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
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import axios from 'axios';

// // Firestore initialization
// const db = getFirestore(app);

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

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
//   const [dropdownVisible, setDropdownVisible] = useState({
//     customer: false,
//     shipment: false,
//     material: false
//   });

//   const scrollViewRef = useRef<ScrollView>(null);
//   const customerDropdownRef = useRef<any>(null);
//   const shipmentDropdownRef = useRef<any>(null);
//   const materialDropdownRef = useRef<any>(null);

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
//       setDropdownVisible({...dropdownVisible, material: false});
//     }
//   };

//   const getCustomerPushToken = async (customerId: string) => {
//     try {
//       const customerDoc = await getDocs(collection(db, "customer"));
//       const customer = customerDoc.docs.find(doc => doc.id === customerId);
//       return customer?.data()?.expoPushToken || null;
//     } catch (error) {
//       console.error("Error getting customer push token:", error);
//       return null;
//     }
//   };
  
//   // Function to send push notification
//   const sendPushNotification = async (expoPushToken: string, title: string, body: string, data?: any) => {
//     const message = {
//       to: expoPushToken,
//       sound: 'default',
//       title,
//       body,
//       data,
//     };
  
//     try {
//       await axios.post('https://exp.host/--/api/v2/push/send', message, {
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (error) {
//       console.error('Error sending notification:', error);
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
//       // Save the delivery
//       await setDoc(
//         doc(db, `Shipment/${selectedShipment.name}/deliveries`, deliveryNumber),
//         deliveryData
//       );
  
//       // Update shipment capacity
//       const updatedTons = selectedShipment.tons - totalWeight;
//       await updateDoc(doc(db, "Shipment", selectedShipment.name), {
//         tons: updatedTons,
//       });
  
//       // Send notification to customer
//       await sendDeliveryNotification(selectedCustomer.id, deliveryNumber);
  
//       Alert.alert("Success", `Delivery created with number: ${deliveryNumber}`);
//       router.push('/agent/dashboard');
//     } catch (error) {
//       console.error("Error saving delivery:", error);
//       Alert.alert("Error", "Failed to save delivery. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Function to handle notification sending
//   const sendDeliveryNotification = async (customerId: string, deliveryNumber: string) => {
//     try {
//       // 1. Get customer's push token
//       const pushToken = await getCustomerPushToken(customerId);
      
//       if (!pushToken) {
//         console.warn("No push token found for customer");
//         return;
//       }
      
//       // 2. Prepare notification message
//       const materialsList = deliveryMaterials.map(mat => 
//         `${mat.name} (${mat.quantity} × ${mat.totalWeight/mat.quantity}kg)`
//       ).join('\n');
      
//       const notificationBody = `
//         Delivery #${deliveryNumber}
//         Materials:
//         ${materialsList}
//         Total Weight: ${totalWeight.toFixed(2)}kg
//       `;
      
//       // 3. Send the notification
//       await sendPushNotification(
//         pushToken,
//         "New Delivery Created",
//         notificationBody,
//         { 
//           deliveryNumber,
//           type: "delivery_created",
//           customerId: selectedCustomer?.id 
//         }
//       );
      
//       console.log("Delivery notification sent successfully");
//     } catch (error) {
//       console.error("Error sending delivery notification:", error);
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
//           onFocus={() => {
//             if (scrollViewRef.current && Platform.OS === 'ios') {
//               scrollViewRef.current.scrollTo({ y: 200 * index, animated: true });
//             }
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
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
//       >
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//               <Image
//                 source={require("../../assets/images/Back.png")}
//                 resizeMode="contain"
//                 style={styles.backIcon}
//               />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>Create Delivery</Text>
//           </View>

//           <ScrollView 
//             ref={scrollViewRef}
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             {/* Shipping Point Section */}
//             <View style={styles.card}>
//               <Text style={styles.label}>Current Shipping Point</Text>
//               <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
//             </View>

//             {/* Customer Section */}
//             <View style={styles.card}>
//               <Text style={styles.sectionTitle}>Deliver to?</Text>
//               <SearchableDropdown
//                 ref={customerDropdownRef}
//                 items={customers.map((c) => ({ id: c.id, name: c.name }))}
//                 onItemSelect={(item: { id: string, name: string }) => {
//                   const selected = customers.find(c => c.id === item.id);
//                   setSelectedCustomer(selected || null);
//                   setDropdownVisible({...dropdownVisible, customer: false});
//                 }}
//                 onTextChange={() => {}}
//                 defaultIndex={0}
//                 placeholder="Select Customer"
//                 resetValue={false}
//                 underlineColorAndroid="transparent"
//                 containerStyle={styles.dropdownContainer}
//                 textInputStyle={styles.dropdownInput}
//                 itemStyle={styles.dropdownItem}
//                 itemTextStyle={styles.dropdownItemText}
//                 itemsContainerStyle={styles.dropdownItemsContainer}
//                 onBlur={() => setDropdownVisible({...dropdownVisible, customer: false})}
//                 onFocus={() => setDropdownVisible({...dropdownVisible, customer: true})}
//               />
//               {selectedCustomer && (
//                 <View style={styles.customerDetails}>
//                   <Text style={styles.customerName}>{selectedCustomer.name}</Text>
//                   <Text style={styles.customerAddress}>{selectedCustomer.location?.address}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Shipment Section */}
//             <View style={styles.card}>
//               <Text style={styles.sectionTitle}>Assign to Shipment</Text>
//               <SearchableDropdown
//                 ref={shipmentDropdownRef}
//                 items={shipments.map((s) => ({ id: s.id, name: s.name, tons: s.tons }))}
//                 onItemSelect={(item: Shipment) => {
//                   setSelectedShipment(item);
//                   setRemainingCapacity(item.tons || 0);
//                   setDropdownVisible({...dropdownVisible, shipment: false});
//                 }}
//                 onTextChange={() => {}}
//                 defaultIndex={0}
//                 placeholder="Select a Shipment"
//                 resetValue={false}
//                 underlineColorAndroid="transparent"
//                 containerStyle={styles.dropdownContainer}
//                 textInputStyle={styles.dropdownInput}
//                 itemStyle={styles.dropdownItem}
//                 itemTextStyle={styles.dropdownItemText}
//                 itemsContainerStyle={styles.dropdownItemsContainer}
//                 onBlur={() => setDropdownVisible({...dropdownVisible, shipment: false})}
//                 onFocus={() => setDropdownVisible({...dropdownVisible, shipment: true})}
//               />
//               {selectedShipment && (
//                 <View style={styles.capacityContainer}>
//                   <Text style={styles.capacityText}>Shipment Capacity: {selectedShipment.tons || 0} tons</Text>
//                   <Text style={[styles.capacityText, {color: remainingCapacity < 0 ? 'red' : 'green'}]}>
//                     Remaining: {remainingCapacity.toFixed(2)} tons
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Materials Section */}
//             <View style={styles.card}>
//               <Text style={styles.sectionTitle}>Item(s) to deliver</Text>
//               <SearchableDropdown
//                 ref={materialDropdownRef}
//                 items={materials.map((m) => ({ id: m.id, name: m.name }))}
//                 onItemSelect={(item: Material) => handleAddMaterial(item.name)}
//                 onTextChange={() => {}}
//                 defaultIndex={0}
//                 placeholder="Add a Material"
//                 resetValue={false}
//                 underlineColorAndroid="transparent"
//                 containerStyle={styles.dropdownContainer}
//                 textInputStyle={styles.dropdownInput}
//                 itemStyle={styles.dropdownItem}
//                 itemTextStyle={styles.dropdownItemText}
//                 itemsContainerStyle={styles.dropdownItemsContainer}
//                 onBlur={() => setDropdownVisible({...dropdownVisible, material: false})}
//                 onFocus={() => setDropdownVisible({...dropdownVisible, material: true})}
//               />

//               <FlatList
//                 data={deliveryMaterials}
//                 renderItem={renderMaterialItem}
//                 keyExtractor={(item, index) => index.toString()}
//                 contentContainerStyle={styles.materialsList}
//                 scrollEnabled={false}
//               />

//               {/* Summary Section */}
//               {deliveryMaterials.length > 0 && (
//                 <View style={styles.summaryContainer}>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Total Quantity:</Text>
//                     <Text style={styles.summaryValue}>{totalQuantity}</Text>
//                   </View>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Total Weight:</Text>
//                     <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kg</Text>
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Save Button */}
//             <TouchableOpacity
//   style={[
//     styles.saveButton, 
//     (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0 || isLoading) && styles.disabledButton
//   ]}
//   onPress={handleSaveDelivery}
//   disabled={!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0 || isLoading}
// >
//   {isLoading ? (
//     <ActivityIndicator color="#FFF" />
//   ) : (
//     <Text style={styles.saveButtonText}>Save Delivery</Text>
//   )}
// </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </TouchableWithoutFeedback>
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
//   dropdownContainer: {
//     padding: 0,
//     marginBottom: 0,
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
  ActivityIndicator,
  Platform
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { MaterialIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { app } from "../firebase";
import { router, useLocalSearchParams } from "expo-router";
import axios from 'axios';

const db = getFirestore(app);

type Customer = {
  id: string;
  name: string;
  shippingPoint?: string;
  lga?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
};

type Material = {
  id: string;
  name: string;
  weight: number;
  icon?: string;
};

type Shipment = {
  id: string;
  tons: number;
  route: string;
  statusId: number;
  vehicleNo?: string;
  driverName?: string; 
};

type DeliveryMaterial = {
  name: string;
  quantity: number;
  totalWeight: number;
  icon?: string;
};

// Geocoding utility functions
const getLGAFromCoords = async (lat: number, lng: number, customerId?: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: 'AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0',
          result_type: 'administrative_area_level_2'
        }
      }
    );

    const lga = response.data.results[0]?.address_components[0]?.long_name || null;
    
    if (lga && customerId) {
      await updateDoc(doc(db, "customer", customerId), {
        lga
      });
    }

    return lga;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const extractLGAFromAddress = (address: string): string | null => {
  const patterns = [
    /,\s*([^,]+?)\s*(?:LGA|Local Government Area)\b/i,
    /,\s*([^,]+?),\s*Lagos/i,
    /(Eti-Osa|Ikeja|Kosofe|Agege|Alimosho)/i
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
};

const calculateDistance = async (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: 'AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0',
          units: 'metric'
        }
      }
    );

    if (response.data.rows[0].elements[0].status === 'OK') {
      return {
        text: response.data.rows[0].elements[0].distance.text,
        value: response.data.rows[0].elements[0].distance.value
      };
    }
    return null;
  } catch (error) {
    console.error("Distance calculation error:", error);
    return null;
  }
};

export default function CreateDelivery() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [deliveryMaterials, setDeliveryMaterials] = useState<DeliveryMaterial[]>([]);
  const [originLocation, setOriginLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [distance, setDistance] = useState<{ text: string; value: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [remainingCapacity, setRemainingCapacity] = useState<number>(0);
  const [lgaDeterminationStatus, setLgaDeterminationStatus] = useState<string>('');

  const { shippingPoint } = useLocalSearchParams();
  const resolvedShippingPoint = Array.isArray(shippingPoint) ? shippingPoint[0] : shippingPoint;

  // Material icons mapping
  const materialIcons: Record<string, string> = {
    'cement': 'foundation',
    'sand': 'beach-access',
    'gravel': 'landscape',
    'blocks': 'grid-on',
    'iron': 'build',
    'wood': 'forest',
    'paint': 'format-paint',
    'default': 'local-shipping'
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch origin location
        const originSnapshot = await getDocs(collection(db, "originPoint"));
        originSnapshot.forEach((doc) => {
          if (doc.id === resolvedShippingPoint) {
            const data = doc.data();
            setOriginLocation({
              lat: data.latitude,
              lng: data.longitude
            });
          }
        });

        // Fetch other data in parallel
        await Promise.all([
          fetchCustomers(),
          fetchShipments(),
          fetchMaterials()
        ]);
      } catch (error) {
        console.error("Initial data loading error:", error);
        Alert.alert("Error", "Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [resolvedShippingPoint]);

  const fetchCustomers = async () => {
    try {
      const q = query(
        collection(db, "customer"),
        where("LoadingPoint", "==", resolvedShippingPoint)
      );
      const snapshot = await getDocs(q);
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Customer));
      setCustomers(customerData);
    } catch (error) {
      console.error("Customer fetch error:", error);
      throw error;
    }
  };


  const fetchShipments = async () => {
    try {
      const q = query(
        collection(db, "Shipment"),
        where("statusId", "==", 0)
      );
      const snapshot = await getDocs(q);
      
      const shipmentData: Shipment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        shipmentData.push({
          id: doc.id, // Use Firestore document ID
          tons: data.tons || 0,
          route: formatRoute(data.route, data.transporter),
          statusId: data.statusId || 0
        });
      });
      
      console.log("Fetched shipments:", shipmentData);
      setShipments(shipmentData);
      setFilteredShipments(shipmentData);
    } catch (error) {
      console.error("Shipment fetch error:", error);
      Alert.alert("Error", "Failed to load shipments");
    }
  };

  const formatRoute = (route: string, transporter?: string) => {
    if (!route) return "";
    if (route.includes(" to ")) return route;
    return `${transporter || "Origin"} to ${route}`;
  };

  const fetchMaterials = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, `originPoint/${resolvedShippingPoint}/materials`)
      );
      const materialData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        icon: materialIcons[doc.data().name.toLowerCase()] || materialIcons.default
      } as Material));
      setMaterials(materialData);
    } catch (error) {
      console.error("Material fetch error:", error);
      throw error;
    }
  };


  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLgaDeterminationStatus('Determining LGA...');
    
    let customerLGA: any = customer.lga;
    let determinationMethod = 'From cache';
  
    if (!customerLGA && customer.location) {
      // Try to get LGA from coordinates
      customerLGA = await getLGAFromCoords(
        customer.location.latitude,
        customer.location.longitude,
        customer.id
      );
      determinationMethod = customerLGA ? 'From geocoding' : 'Failed geocoding';
  
      // Fallback to address parsing
      if (!customerLGA && customer.location.address) {
        customerLGA = extractLGAFromAddress(customer.location.address);
        determinationMethod = customerLGA ? 'From address parsing' : 'Failed address parsing';
      }
    }
  
    setLgaDeterminationStatus(`LGA ${determinationMethod}: ${customerLGA || 'Unknown'}`);
  
    // Filter shipments based on LGA - make matching more flexible
    const matchingShipments = shipments.filter(shipment => {
      if (!customerLGA) return true;
      
      const destinationPart = shipment.route.split(' to ')[1]?.trim();
      if (!destinationPart) return false;
      
      // Remove common suffixes and make lowercase for comparison
      const cleanCustomerLGA = customerLGA.toLowerCase()
        .replace('local government area', '')
        .replace('lga', '')
        .trim();
        
      const cleanDestinationLGA = destinationPart.toLowerCase()
        .replace('local government area', '')
        .replace('lga', '')
        .trim();
      
      // Check if either contains the other
      return cleanDestinationLGA.includes(cleanCustomerLGA) || 
             cleanCustomerLGA.includes(cleanDestinationLGA);
    });
  
    setFilteredShipments(matchingShipments);
    console.log("Matching shipments:", matchingShipments);
  
    // Calculate distance
    if (customer.location && originLocation) {
      const dist = await calculateDistance(
        originLocation,
        {
          lat: customer.location.latitude,
          lng: customer.location.longitude
        }
      );
      setDistance(dist);
    }
  };

  const handleAddMaterial = (material: Material) => {
    if (deliveryMaterials.some(m => m.name === material.name)) {
      Alert.alert("Error", "Material already added");
      return;
    }

    setDeliveryMaterials(prev => [
      ...prev,
      {
        name: material.name,
        quantity: 0,
        totalWeight: 0,
        icon: material.icon
      }
    ]);
  };

  const handleSaveDelivery = async () => {
    if (!validateDelivery()) return;

    setIsLoading(true);
    const deliveryNumber = generateDeliveryNumber();

    try {
      await saveDeliveryToFirestore(deliveryNumber);
      Alert.alert("Success", `Delivery ${deliveryNumber} created`);
      router.push('/agent/dashboard');
    } catch (error) {
      console.error("Delivery save error:", error);
      Alert.alert("Error", "Failed to save delivery");
    } finally {
      setIsLoading(false);
    }
  };

  const validateDelivery = () => {
    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return false;
    }
    if (!selectedShipment) {
      Alert.alert("Error", "Please select a shipment");
      return false;
    }
    if (deliveryMaterials.length === 0) {
      Alert.alert("Error", "Please add at least one material");
      return false;
    }

    const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);
    if (totalWeight > selectedShipment.tons) {
      Alert.alert("Error", `Total weight (${totalWeight}kg) exceeds shipment capacity`);
      return false;
    }

    return true;
  };

  const generateDeliveryNumber = () => {
    return `W-R${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // Save delivery data to Firestore

  const saveDeliveryToFirestore = async (deliveryNumber: string) => {
    try {
      if (!selectedShipment || !selectedShipment.id) {
        throw new Error("Invalid shipment selected");
      }
      
      // Debug logs
      console.log("Selected shipment ID:", selectedShipment.id);
      console.log("Selected customer ID:", selectedCustomer?.id);
  
      const deliveryData = {
        customer: selectedCustomer?.name || "Unknown",
        customerId: selectedCustomer?.id || "",
        shipmentId: selectedShipment.id,
        materials: deliveryMaterials.map(mat => ({
          name: mat.name,
          quantity: mat.quantity,
          totalWeight: mat.totalWeight
        })),
        deliveryNumber,
        address: selectedCustomer?.location?.address || "Unknown",
        coordinates: selectedCustomer?.location
          ? {
              latitude: selectedCustomer.location.latitude,
              longitude: selectedCustomer.location.longitude
            }
          : null,
        distance: distance?.text || "Unknown",
        createdAt: new Date().toISOString(),
        statusId: 0,
        shippingPoint: resolvedShippingPoint,
        // driverName: selectedShipment.driverName, // Add this if needed
        // vehicleNo: selectedShipment.vehicleNo   // Add this if needed
      };
  
      console.log("Saving delivery data:", deliveryData);
  
      // Save to both Shipment collection and deliveries subcollection
      const batch = writeBatch(db);
      
      // Add to deliveries subcollection
      const deliveryRef = doc(db, `Shipment/${selectedShipment.id}/deliveries`, deliveryNumber);
      batch.set(deliveryRef, deliveryData);
      
      // Update shipment tons
      const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);
      const shipmentRef = doc(db, "Shipment", selectedShipment.id);
      batch.update(shipmentRef, {
        tons: selectedShipment.tons - totalWeight,
        statusId: selectedShipment.tons - totalWeight <= 0 ? 1 : 0 // Update status if empty
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Detailed save error:", error);
      throw error;
    }
  };
  const renderMaterialItem = ({ item, index }: { item: DeliveryMaterial; index: number }) => {
    const material = materials.find(m => m.name === item.name);
    const weight = material?.weight || 0;

    return (
      <View style={styles.materialCard}>
        <View style={styles.materialHeader}>
          {item.icon && <MaterialIcons name={item.icon as any} size={24} color="#4169E1" />}
          <Text style={styles.materialName}>{item.name}</Text>
        </View>
        <View style={styles.materialControls}>
          <TextInput
            style={styles.quantityInput}
            placeholder="Qty"
            keyboardType="numeric"
            value={item.quantity.toString()}
            onChangeText={(text) => {
              const quantity = parseInt(text) || 0;
              const updatedMaterials = [...deliveryMaterials];
              updatedMaterials[index] = {
                ...item,
                quantity,
                totalWeight: quantity * weight
              };
              setDeliveryMaterials(updatedMaterials);
            }}
          />
          <Text style={styles.weightText}>{weight}kg each</Text>
          <TouchableOpacity onPress={() => {
            setDeliveryMaterials(prev => prev.filter((_, i) => i !== index));
          }}>
            <MaterialIcons name="delete" size={24} color="#E53935" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalWeightText}>
          Total: {item.totalWeight.toFixed(2)} kg
        </Text>
      </View>
    );
  };

  const totalWeight = deliveryMaterials.reduce((sum, mat) => sum + mat.totalWeight, 0);

  useEffect(() => {
    if (selectedShipment) {
      setRemainingCapacity(Math.max(0, selectedShipment.tons - totalWeight));
    }
  }, [selectedShipment, totalWeight]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Delivery</Text>
        </View>

        {/* Shipping Point */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="warehouse" size={20} color="#4169E1" />
            <Text style={styles.cardTitle}>Shipping Point</Text>
          </View>
          <Text style={styles.shippingPointText}>{resolvedShippingPoint}</Text>
        </View>

        {/* Customer Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={20} color="#4169E1" />
            <Text style={styles.cardTitle}>Customer</Text>
          </View>
          <SearchableDropdown
            items={customers.map(c => ({ id: c.id, name: c.name }))}
            onItemSelect={(item) => {
              const customer = customers.find(c => c.id === item.id);
              if (customer) handleCustomerSelect(customer);
            }}
            placeholder="Select customer"
            placeholderTextColor="#999"
            resetValue={false}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
          />
          
          {selectedCustomer && (
            <View style={styles.selectedItemCard}>
              <View style={styles.selectedItemHeader}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.selectedItemTitle}>{selectedCustomer.name}</Text>
              </View>
              
              {selectedCustomer.location?.address && (
                <Text style={styles.selectedItemText}>
                  <MaterialIcons name="location-on" size={16} color="#757575" />
                  {selectedCustomer.location.address}
                </Text>
              )}
              
              {distance && (
                <Text style={styles.distanceText}>
                  <MaterialIcons name="directions-car" size={16} color="#757575" />
                  Distance: {distance.text}
                </Text>
              )}
              
              <Text style={styles.statusText}>
                <MaterialIcons name="info" size={16} color="#757575" />
                {lgaDeterminationStatus}
              </Text>
            </View>
          )}
        </View>

        {/* Shipment Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#4169E1" />
            <Text style={styles.cardTitle}>Shipment</Text>
          </View>
          <SearchableDropdown
  items={filteredShipments.map(s => ({ 
    id: s.id, 
    // name: `${s.id} (${s.tons}kg)`
    name: `${s.id} (${s.route})` // Display route instead of tons
  }))}
  onItemSelect={(item) => {
    const shipment = filteredShipments.find(s => s.id === item.id);
    if (shipment) {
      console.log("Selected shipment:", shipment);
      setSelectedShipment(shipment);
    }
  }}
  placeholder={
    filteredShipments.length === 0 
      ? "No matching shipments found" 
      : "Select shipment"
  }
  disabled={filteredShipments.length === 0}
  placeholderTextColor="#999"
  containerStyle={styles.dropdownContainer}
  textInputStyle={[styles.dropdownInput, { color: '#000' }]}
  itemStyle={[styles.dropdownItem, { backgroundColor: '#FFF' }]}
  itemTextStyle={[styles.dropdownItemText, { color: '#000' }]}
/>
          
          {selectedShipment && (
            <View style={styles.selectedItemCard}>
              <View style={styles.selectedItemHeader}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.selectedItemTitle}>{selectedShipment.id}</Text>
              </View>
              
              <View style={styles.shipmentDetails}>
                <Text style={styles.detailText}>
                  <MaterialIcons name="route" size={16} color="#757575" />
                  Route: {selectedShipment.route}
                </Text>
                <Text style={styles.detailText}>
                  <MaterialIcons name="fitness-center" size={16} color="#757575" />
                  Capacity: {selectedShipment.tons} kg
                </Text>
                <Text style={[
                  styles.detailText,
                  remainingCapacity <= 0 && styles.warningText
                ]}>
                  <MaterialIcons name="battery-alert" size={16} color={remainingCapacity <= 0 ? "#E53935" : "#757575"} />
                  Remaining: {remainingCapacity.toFixed(2)} kg
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Materials Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="inventory" size={20} color="#4169E1" />
            <Text style={styles.cardTitle}>Materials</Text>
          </View>
          <SearchableDropdown
            items={materials.map(m => ({ id: m.id, name: m.name }))}
            onItemSelect={(item) => {
              const material = materials.find(m => m.id === item.id);
              if (material) handleAddMaterial(material);
            }}
            placeholder="Add material"
            placeholderTextColor="#999"
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
          />
          
          <FlatList
            data={deliveryMaterials}
            renderItem={renderMaterialItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.materialsList}
          />
        </View>

        {/* Summary */}
        {deliveryMaterials.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="summarize" size={20} color="#4169E1" />
              <Text style={styles.cardTitle}>Summary</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Weight:</Text>
              <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kg</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining Capacity:</Text>
              <Text style={[
                styles.summaryValue,
                remainingCapacity <= 0 && styles.warningText
              ]}>
                {remainingCapacity.toFixed(2)} kg
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0 || isLoading) && styles.disabledButton
          ]}
          onPress={handleSaveDelivery}
          disabled={!selectedCustomer || !selectedShipment || deliveryMaterials.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Create Delivery</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  scrollContainer: {
    paddingBottom: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4169E1',
    padding: 15,
    elevation: 3
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 15
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    margin: 10,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8
  },
  shippingPointText: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: 'bold',
    marginLeft: 28
  },
  dropdownContainer: {
    padding: 0,
    marginBottom: 10
  },
  dropdownInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    fontSize: 15
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333'
  },
  selectedItemCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  selectedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  selectedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 5
  },
  selectedItemText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 24,
    marginTop: 3
  },
  distanceText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 24,
    marginTop: 3
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 24,
    marginTop: 3,
    fontStyle: 'italic'
  },
  materialCard: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8
  },
  materialControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  quantityInput: {
    width: 60,
    height: 35,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 5,
    textAlign: 'center'
  },
  weightText: {
    fontSize: 12,
    color: '#757575'
  },
  totalWeightText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4169E1',
    textAlign: 'right'
  },
  materialsList: {
    marginTop: 10
  },
  shipmentDetails: {
    marginTop: 8
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 24,
    marginTop: 3
  },
  warningText: {
    color: '#E53935'
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    margin: 10,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  summaryLabel: {
    fontSize: 15,
    color: '#757575'
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    elevation: 3
  },
  disabledButton: {
    backgroundColor: '#95A5A6'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10
  }
});