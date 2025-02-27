// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   Image,
//   ScrollView,
// } from "react-native";
// import {
//   getFirestore,
//   collection,
//   doc,
//   getDoc,
//   setDoc,
//   addDoc,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// export default function CreateMaterialScreen() {
//   const [materialName, setMaterialName] = useState<string>("");
//   const [originName, setOriginName] = useState<string>("");
//   const [isSaving, setIsSaving] = useState<boolean>(false);

//   const handleSaveMaterial = async () => {
//     if (!materialName.trim() || !originName.trim()) {
//       Alert.alert("Error", "Origin name and material name cannot be empty.");
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const materialsRef = collection(
//         db,
//         `originPoint/${originName}/materials`
//       );
//       const q = query(materialsRef, where("name", "==", materialName));

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         // Material already exists under the origin
//         Alert.alert(
//           "Info",
//           "This material already exists for the specified origin."
//         );
//       } else {
//         // Add new material to the materials sub-collection
//         await addDoc(materialsRef, {
//           name: materialName,
//           createdAt: new Date().toISOString(),
//         });
//         Alert.alert("Success", "Material added successfully.");
//       }

//       setMaterialName("");
//       setOriginName(""); // Clear input fields
//     } catch (error) {
//       console.error("Error saving material:", error);
//       Alert.alert("Error", "Failed to save material. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.topSection}>
//         <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
//           Back
//         </Text>

//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={{ marginLeft: 20, marginTop: 20 }}
//         >
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollContainer}>
//         <Text style={styles.header}>Create Material</Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Origin Name"
//           placeholderTextColor={"#666"}
//           value={originName}
//           onChangeText={(text) => setOriginName(text)}
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Enter Material Name"
//           placeholderTextColor={"#666"}
//           value={materialName}
//           onChangeText={(text) => setMaterialName(text)}
//         />

// <TextInput
//           style={styles.input}
//           placeholder="Enter Material weight (kg)"
//           placeholderTextColor={"#666"}
//           value={materialName}
//           onChangeText={(text) => setMaterialName(text)}
//         />

//         <TouchableOpacity
//           style={styles.saveButton}
//           onPress={handleSaveMaterial}
//           disabled={isSaving}
//         >
//           <Text style={styles.saveButtonText}>
//             {isSaving ? "Saving..." : "Save Material"}
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     //justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   scrollContainer: {
//     padding: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//     fontSize: 16,
//     color: "#333",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButton: {
//     //backgroundColor: '#6200ee',
//     backgroundColor: "orange",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
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
//   Image,
//   ScrollView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker"; // Import Picker from the correct library
// import {
//   getFirestore,
//   collection,
//   doc,
//   getDoc,
//   setDoc,
//   addDoc,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// export default function CreateMaterialScreen() {
//   const [materialName, setMaterialName] = useState<string>("");
//   const [originName, setOriginName] = useState<string>("");
//   const [weight, setWeight] = useState<string>("");
//   const [uom, setUom] = useState<string>("Cartons");
//   const [productSensitivity, setProductSensitivity] = useState<string>("Fragile");
//   const [isSaving, setIsSaving] = useState<boolean>(false);
//   const [originPoints, setOriginPoints] = useState<any[]>([]);

//   useEffect(() => {
//     fetchOriginPoints();
//   }, []);

//   const fetchOriginPoints = async () => {
//     try {
//       const originPointsRef = collection(db, "originPoint");
//       const querySnapshot = await getDocs(originPointsRef);
//       const origins = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setOriginPoints(origins);
//     } catch (error) {
//       console.error("Error fetching origin points:", error);
//     }
//   };

//   const handleSaveMaterial = async () => {
//     if (!originName.trim() || !materialName.trim() || !weight.trim()) {
//       Alert.alert("Error", "Origin name, material name, and weight cannot be empty.");
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const materialsRef = collection(db, `originPoint/${originName}/materials`);
//       const q = query(materialsRef, where("name", "==", materialName));

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         Alert.alert("Info", "This material already exists for the specified origin.");
//       } else {
//         await addDoc(materialsRef, {
//           name: materialName,
//           weight: parseFloat(weight),
//           uom,
//           productSensitivity,
//           createdAt: new Date().toISOString(),
//         });
//         Alert.alert("Success", "Material added successfully.");
//       }

//       setMaterialName("");
//       setOriginName("");
//       setWeight("");
//       setUom("Cartons");
//       setProductSensitivity("Fragile");
//     } catch (error) {
//       console.error("Error saving material:", error);
//       Alert.alert("Error", "Failed to save material. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.topSection}>
//         <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
//           Back
//         </Text>

//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={{ marginLeft: 20, marginTop: 20 }}
//         >
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollContainer}>
//         <Text style={styles.header}>Create Material</Text>

//         <Picker
//           selectedValue={originName}
//           style={styles.input}
//           onValueChange={(itemValue) => setOriginName(itemValue)}
//         >
//           <Picker.Item label="Select Origin" value="" />
//           {originPoints.map((origin) => (
//             <Picker.Item key={origin.id} label={origin.id} value={origin.id} />
//           ))}
//         </Picker>

//         <TextInput
//           style={styles.input}
//           placeholder="Enter Material Name"
//           placeholderTextColor={"#666"}
//           value={materialName}
//           onChangeText={(text) => setMaterialName(text)}
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Enter Material Weight (kg)"
//           placeholderTextColor={"#666"}
//           value={weight}
//           onChangeText={(text) => setWeight(text)}
//           keyboardType="numeric"
//         />

//         <Picker
//           selectedValue={uom}
//           style={styles.input}
//           onValueChange={(itemValue) => setUom(itemValue)}
//         >
//           <Picker.Item label="Cartons" value="Cartons" />
//           <Picker.Item label="Bags" value="Bags" />
//           <Picker.Item label="Pieces" value="Pieces" />
//           <Picker.Item label="Gallons" value="Gallons" />
//         </Picker>

//         <Picker
//           selectedValue={productSensitivity}
//           style={styles.input}
//           onValueChange={(itemValue) => setProductSensitivity(itemValue)}
//         >
//           <Picker.Item label="Fragile" value="Fragile" />
//           <Picker.Item label="Flammable" value="Flammable" />
//           <Picker.Item label="Non-Fragile" value="Non-Fragile" />
//         </Picker>

//         <TouchableOpacity
//           style={styles.saveButton}
//           onPress={handleSaveMaterial}
//           disabled={isSaving}
//         >
//           <Text style={styles.saveButtonText}>
//             {isSaving ? "Saving..." : "Save Material"}
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   scrollContainer: {
//     padding: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//     fontSize: 16,
//     color: "#333",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButton: {
//     backgroundColor: "orange",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
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
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { router } from "expo-router";

// const db = getFirestore(app);

// export default function OriginPointScreen() {
//   const [originPoints, setOriginPoints] = useState<any[]>([]);
//   const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
//   const [materials, setMaterials] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
//   const [materialName, setMaterialName] = useState<string>("");
//   const [weight, setWeight] = useState<string>("");
//   const [uom, setUom] = useState<string>("Cartons");
//   const [productSensitivity, setProductSensitivity] = useState<string>("Fragile");
//   const [isNewOrigin, setIsNewOrigin] = useState<boolean>(false);
//   const [newOriginName, setNewOriginName] = useState<string>("");

//   useEffect(() => {
//     fetchOriginPoints();
//   }, []);

//   const fetchOriginPoints = async () => {
//     setIsLoading(true);
//     try {
//       const originPointsRef = collection(db, "originPoint");
//       const querySnapshot = await getDocs(originPointsRef);
//       const origins = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setOriginPoints(origins);
//     } catch (error) {
//       console.error("Error fetching origin points:", error);
//       Alert.alert("Error", "Failed to fetch origin points.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchMaterials = async (originId: string) => {
//     setIsLoading(true);
//     try {
//       const materialsRef = collection(db, `originPoint/${originId}/materials`);
//       const querySnapshot = await getDocs(materialsRef);
//       const materialsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setMaterials(materialsData);
//       setIsModalVisible(true);
//     } catch (error) {
//       console.error("Error fetching materials:", error);
//       Alert.alert("Error", "Failed to fetch materials.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveMaterial = async () => {
//     if ((!isNewOrigin && !selectedOrigin) || !materialName.trim() || !weight.trim()) {
//       Alert.alert("Error", "Please fill all required fields.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const originId = isNewOrigin ? newOriginName : selectedOrigin.id;
//       const materialsRef = collection(db, `originPoint/${originId}/materials`);
//       await addDoc(materialsRef, {
//         name: materialName,
//         weight: parseFloat(weight),
//         uom,
//         productSensitivity,
//         createdAt: new Date().toISOString(),
//       });
//       Alert.alert("Success", "Material added successfully.");
//       setIsCreateModalVisible(false);
//       setMaterialName("");
//       setWeight("");
//       setUom("Cartons");
//       setProductSensitivity("Fragile");
//       setNewOriginName("");
//       setIsNewOrigin(false);
//     } catch (error) {
//       console.error("Error saving material:", error);
//       Alert.alert("Error", "Failed to save material. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.topSection}>
//         <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
//           Back
//         </Text>

//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={{ marginLeft: 20, marginTop: 20 }}
//         >
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollContainer}>
//         <Text style={styles.header}>Origin Points</Text>

//         {isLoading ? (
//           <ActivityIndicator size="large" color="orange" />
//         ) : (
//           originPoints.map((origin) => (
//             <TouchableOpacity
//               key={origin.id}
//               style={styles.originItem}
//               onPress={() => fetchMaterials(origin.id)}
//             >
//               <Text style={styles.originText}>{origin.id}</Text>
//             </TouchableOpacity>
//           ))
//         )}

//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={() => setIsCreateModalVisible(true)}
//         >
//           <Text style={styles.createButtonText}>Create Material</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Modal for Materials */}
//       <Modal
//         visible={isModalVisible}
//         animationType="slide"
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalHeader}>Materials for {selectedOrigin?.id}</Text>
//           <ScrollView>
//             {materials.map((material) => (
//               <View key={material.id} style={styles.materialItem}>
//                 <Text style={styles.materialText}>{material.name}</Text>
//                 <Text style={styles.materialText}>Weight: {material.weight} kg</Text>
//                 <Text style={styles.materialText}>UoM: {material.uom}</Text>
//                 <Text style={styles.materialText}>Sensitivity: {material.productSensitivity}</Text>
//               </View>
//             ))}
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsModalVisible(false)}
//           >
//             <Text style={styles.closeButtonText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {/* Modal for Create Material */}
//       <Modal
//         visible={isCreateModalVisible}
//         animationType="slide"
//         onRequestClose={() => setIsCreateModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalHeader}>Create Material</Text>
//           <ScrollView>
//             <Text style={styles.promptText}>Create for an existing origin point?</Text>
//             <TouchableOpacity
//               style={styles.toggleButton}
//               onPress={() => setIsNewOrigin(!isNewOrigin)}
//             >
//               <Text style={styles.toggleButtonText}>
//                 {isNewOrigin ? "Use Existing Origin" : "Create New Origin"}
//               </Text>
//             </TouchableOpacity>

//             {isNewOrigin ? (
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter New Origin Name"
//                 placeholderTextColor={"#666"}
//                 value={newOriginName}
//                 onChangeText={(text) => setNewOriginName(text)}
//               />
//             ) : (
//               <Picker
//                 selectedValue={selectedOrigin?.id}
//                 style={styles.input}
//                 onValueChange={(itemValue) =>
//                   setSelectedOrigin(originPoints.find((origin) => origin.id === itemValue))
//                 }
//               >
//                 <Picker.Item label="Select Origin" value="" />
//                 {originPoints.map((origin) => (
//                   <Picker.Item key={origin.id} label={origin.id} value={origin.id} />
//                 ))}
//               </Picker>
//             )}

//             <TextInput
//               style={styles.input}
//               placeholder="Enter Material Name"
//               placeholderTextColor={"#666"}
//               value={materialName}
//               onChangeText={(text) => setMaterialName(text)}
//             />

//             <TextInput
//               style={styles.input}
//               placeholder="Enter Material Weight (kg)"
//               placeholderTextColor={"#666"}
//               value={weight}
//               onChangeText={(text) => setWeight(text)}
//               keyboardType="numeric"
//             />

//             <Picker
//               selectedValue={uom}
//               style={styles.input}
//               onValueChange={(itemValue) => setUom(itemValue)}
//             >
//               <Picker.Item label="Cartons" value="Cartons" />
//               <Picker.Item label="Bags" value="Bags" />
//               <Picker.Item label="Pieces" value="Pieces" />
//               <Picker.Item label="Gallons" value="Gallons" />
//             </Picker>

//             <Picker
//               selectedValue={productSensitivity}
//               style={styles.input}
//               onValueChange={(itemValue) => setProductSensitivity(itemValue)}
//             >
//               <Picker.Item label="Fragile" value="Fragile" />
//               <Picker.Item label="Flammable" value="Flammable" />
//               <Picker.Item label="Non-Fragile" value="Non-Fragile" />
//             </Picker>

//             <TouchableOpacity
//               style={styles.saveButton}
//               onPress={handleSaveMaterial}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.saveButtonText}>Save Material</Text>
//               )}
//             </TouchableOpacity>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsCreateModalVisible(false)}
//           >
//             <Text style={styles.closeButtonText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   scrollContainer: {
//     padding: 20,
//   },
//   originItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   originText: {
//     fontSize: 16,
//   color: "#333",
//   },
//   createButton: {
//     backgroundColor: "orange",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   createButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalContainer: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   modalHeader: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   materialItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   materialText: {
//     fontSize: 16,
//     color: "#333",
//   },
//   closeButton: {
//     backgroundColor: "orange",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   closeButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   promptText: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   toggleButton: {
//     backgroundColor: "#ddd",
//     borderRadius: 8,
//     padding: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   toggleButtonText: {
//     fontSize: 16,
//     color: "#333",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//     fontSize: 16,
//     color: "#333",
//   },
//   saveButton: {
//     backgroundColor: "orange",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
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
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
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
    <View style={styles.container}>
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

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps={true}>
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
          <Text style={styles.createButtonText}>Create Material</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Materials */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Materials for {selectedOrigin?.id}</Text>
          <ScrollView>
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
        </View>
      </Modal>

      {/* Modal for Create Material */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Create Material</Text>
          <ScrollView>
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
                onTextChange={(text) => console.log(text)} // Optional
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
        </View>
      </Modal>
    </View>
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
    padding: 10,
    marginBottom: 16,
  },
  dropdownInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
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
    backgroundColor: "orange",
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