// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   Alert,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Image,
//   Button,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   setDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { useFonts } from "expo-font";
// import { router } from "expo-router";
// import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from "expo-file-system";
// import * as XLSX from "xlsx";

// const db = getFirestore(app);

// export default function Details() {
//   const [transporterName, setTransporterName] = useState(null);
//   const [routes, setRoutes] = useState<{ routeName: string; data: any[] }[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const [fontsLoaded] = useFonts({
//     Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//   });

//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       const storedPhoneNumber: any = await AsyncStorage.getItem("phoneNumber");
//       if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
//     };
//     fetchPhoneNumber();
//   }, []);

//   useEffect(() => {
//     if (!phoneNumber) return;

//     const fetchTransporterData = async () => {
//       const transporterRef = collection(db, "transporter");
//       const transporterSnapshot = await getDocs(transporterRef);
//       let foundTransporter: any = null;

//       transporterSnapshot.forEach((doc) => {
//         if (doc.id.startsWith(`${phoneNumber}_`)) {
//           foundTransporter = doc.id;
//         }
//       });

//       if (!foundTransporter) return;
//       setTransporterName(foundTransporter);

//       const routeRef = collection(db, "transporter", foundTransporter, "myRoutes");
//       const routeSnapshot = await getDocs(routeRef);
//       setRoutes(routeSnapshot.docs.map((doc) => ({ routeName: doc.id, data: doc.data().data })));
//       setLoading(false);
//     };
//     fetchTransporterData();
//   }, [phoneNumber]);

//   const handleFilePick = async () => {
//     setUploading(true);
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: [
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//           "application/vnd.ms-excel"
//         ],
//         copyToCacheDirectory: true,
//         multiple: false
//       });

//       if (result.canceled || !result.assets?.length) {
//         console.log("File selection was canceled");
//         setUploading(false);
//         return;
//       }

//       const fileUri = result.assets[0].uri;
//       const fileContent = await FileSystem.readAsStringAsync(fileUri, {
//         encoding: FileSystem.EncodingType.Base64
//       });

//       const binaryString = atob(fileContent);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       const workbook = XLSX.read(bytes, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//       // Validate the number of columns
//       if (jsonData[0] && jsonData[0].length !== 5) {
//         Alert.alert("Error", "The uploaded file must have exactly 5 columns.");
//         setUploading(false);
//         return;
//       }

//       // Convert 2D array to an array of objects
//       const headers = jsonData[0]; // First row is the header
//       const rows = jsonData.slice(1); // Rest are the rows

//       const formattedData = rows.map((row) => {
//         const rowObject: { [key: string]: string } = {};
//         headers.forEach((header, index) => {
//           rowObject[header] = row[index] || ""; // Use header as key and row value as value
//         });
//         return rowObject;
//       });

//       const routeName = `Route_${new Date().toISOString()}`;
//       const routeDocRef = doc(db, "transporter", transporterName, "myRoutes", routeName);

//       // Save the formatted data to Firestore
//       await setDoc(routeDocRef, { data: formattedData });

//       // Update local state
//       setRoutes((prev) => [...prev, { routeName, data: formattedData }]);
//     } catch (error) {
//       console.error("Error reading Excel file:", error);
//       Alert.alert("Error", "Failed to upload the file. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const deleteRoute = async (routeName: string) => {
//     try {
//       const routeDocRef = doc(db, "transporter", transporterName, "myRoutes", routeName);
//       await deleteDoc(routeDocRef);

//       // Update local state
//       setRoutes((prev) => prev.filter((route) => route.routeName !== routeName));
//     } catch (error) {
//       console.error("Error deleting route:", error);
//       Alert.alert("Error", "Failed to delete the route. Please try again.");
//     }
//   };

//   const filteredRoutes = routes.filter((route) => route.routeName.toLowerCase().includes(searchQuery.toLowerCase()));

//   if (!fontsLoaded) return null;

//   return (
//     <KeyboardAvoidingView behavior="padding" style={styles.container}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={styles.container}>
//           <View style={styles.topSection}>
//             <TouchableOpacity onPress={() => router.back()}>
//               <Text style={{ fontSize: 20 }}>Dashboard</Text>
//             </TouchableOpacity>
//             <Image source={require("../../assets/images/Back.png")} style={{ width: 30, resizeMode: "contain", marginRight: 10 }} />
//           </View>

//           <Text style={styles.title}>Route List</Text>

//           <TextInput
//             style={styles.searchInput}
//             placeholderTextColor="#000"
//             placeholder="Search Route..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />

//           <Button title="Upload Excel File" onPress={handleFilePick} disabled={uploading} />

//           {uploading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

//           <FlatList
//             data={filteredRoutes}
//             keyExtractor={(item) => item.routeName}
//             ListEmptyComponent={<Text style={styles.noResults}>No routes found.</Text>}
//             renderItem={({ item }) => (
//               <View style={styles.routeContainer}>
//                 {/* <Text style={styles.routeName}>{item.routeName}</Text> */}
//                 <ScrollView horizontal>
//                   <View>
//                     {/* Render headers */}
//                     <View style={styles.tableHeader}>
//                       {Object.keys(item.data[0] || {}).map((header, index) => (
//                         <Text key={index} style={styles.headerText}>{header}</Text>
//                       ))}
//                     </View>
//                     {/* Render rows */}
//                     {item.data.map((row, rowIndex) => (
//                       <View key={rowIndex} style={styles.row}>
//                         {Object.values(row).map((cell: any, cellIndex) => (
//                           <Text key={cellIndex} style={styles.cell}>{cell}</Text>
//                         ))}
//                       </View>
//                     ))}
//                   </View>
//                 </ScrollView>
//                 <TouchableOpacity onPress={() => deleteRoute(item.routeName)} style={styles.deleteButton}>
//                   <Text style={styles.deleteButtonText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           />
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontFamily: "Poppins",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   searchInput: {
//     height: 40,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 10,
//     fontSize: 18,
//     paddingHorizontal: 10,
//     fontFamily: "Nunito",
//     color: "#000",
//     marginVertical: 10,
//   },
//   routeContainer: {
//     marginBottom: 20,
//   },
//   routeName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#000",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//     justifyContent:'space-between',
//     width:'100%'
//   },
//   headerText: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 15,
//     textAlign: "center",
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     paddingVertical: 10,
//   },
//   cell: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 16,
//   },
//   deleteButton: {
//     backgroundColor: "red",
//     padding: 10,
//     borderRadius: 5,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   deleteButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   noResults: {
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 16,
//     color: "gray",
//   },
//   topSection: {
//     width: '100%',
//     height: 60,
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
// });


import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { router } from 'expo-router';

const SupplierCreationScreen = () => {
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore(app);

  const handleCreateSupplier = async () => {
    if (!supplierName || !supplierAddress) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
      return;
    }
  
    setIsLoading(true);
    try {
      const transporterId = 'YOUR_TRANSPORTER_ID'; // Get this from your auth system
      
      // Save to both locations for compatibility
      // 1. In the transporter document's suppliers map
      const transporterRef = doc(db, 'transporter', transporterId);
      await updateDoc(transporterRef, {
        [`suppliers.${supplierName.replace(/\s+/g, '_')}`]: {
          name: supplierName,
          address: supplierAddress,
          contactPerson,
          phoneNumber,
          email,
          taxId,
          createdAt: serverTimestamp()
        }
      });
      
      // 2. In the suppliers subcollection
      const suppliersRef = collection(transporterRef, 'suppliers');
      await addDoc(suppliersRef, {
        name: supplierName,
        address: supplierAddress,
        contactPerson,
        phoneNumber,
        email,
        taxId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      Alert.alert('Success', 'Supplier created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating supplier:', error);
      Alert.alert('Error', 'Failed to create supplier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Create New Supplier</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {/* Supplier Information Section */}
          <Text style={styles.sectionLabel}>Supplier Information</Text>
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="business" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Supplier Name *"
              placeholderTextColor="#95a5a6"
              value={supplierName}
              onChangeText={setSupplierName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Address *"
              placeholderTextColor="#95a5a6"
              value={supplierAddress}
              onChangeText={setSupplierAddress}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contact Person"
              placeholderTextColor="#95a5a6"
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="phone" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#95a5a6"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#95a5a6"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="receipt" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tax ID/VAT Number"
              placeholderTextColor="#95a5a6"
              value={taxId}
              onChangeText={setTaxId}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleCreateSupplier}
            style={styles.createButton}
            labelStyle={styles.buttonText}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Create Supplier</Text>
              </>
            )}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#2c3e50',
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 15,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default SupplierCreationScreen;