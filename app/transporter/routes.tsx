// import React, { useState } from "react";
// import { View, Text, Button, FlatList, StyleSheet, ScrollView } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from "expo-file-system";
// import * as XLSX from "xlsx";

// const ExcelUploadScreen: React.FC = () => {
//   const [data, setData] = useState<string[][]>([]); // Store the Excel data as a 2D array

//   const handleFilePick = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: [
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//           "application/vnd.ms-excel"
//         ],
//         copyToCacheDirectory: true,
//         multiple: false
//       });

//       // Ensure a valid file was selected
//       if (result.canceled || !result.assets?.length) {
//         console.log("File selection was canceled");
//         return;
//       }

//       const fileUri = result.assets[0].uri;

//       // Read file as a base64 string
//       const fileContent = await FileSystem.readAsStringAsync(fileUri, {
//         encoding: FileSystem.EncodingType.Base64
//       });

//       // Convert base64 to binary
//       const binaryString = atob(fileContent);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       // Parse Excel file
//       const workbook = XLSX.read(bytes, { type: "array" });
//       const sheetName = workbook.SheetNames[0]; // Read first sheet
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//       setData(jsonData);
//     } catch (error) {
//       console.error("Error reading Excel file:", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Button title="Upload Excel File" onPress={handleFilePick} />

//       {data.length > 0 && (
//         <ScrollView horizontal>
//           <FlatList
//             data={data}
//             keyExtractor={(_, index) => index.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.row}>
//                 {item.map((cell, index) => (
//                   <Text key={index} style={styles.cell}>{cell}</Text>
//                 ))}
//               </View>
//             )}
//           />
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//     paddingVertical: 5
//   },
//   cell: {
//     paddingHorizontal: 10,
//     fontSize: 14,
//     minWidth: 100 // Ensures proper spacing in columns
//   }
// });

// export default ExcelUploadScreen;




// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// import * as XLSX from 'xlsx';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { collection, addDoc, query, where, getDocs, orderBy, doc, getFirestore } from 'firebase/firestore';
// import { app } from "../firebase";

// const db = getFirestore(app);

// const UploadRoutesScreen = () => {
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [search, setSearch] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [transporterName, setTransporterName] = useState<string | null>(null);
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

//   useEffect(() => {
//     const fetchPhoneNumber = async () => {
//       const storedPhone = await AsyncStorage.getItem('phoneNumber');
//       const storedTransporter = await AsyncStorage.getItem('transporterName');
//       if (storedPhone && storedTransporter) {
//         setPhoneNumber(storedPhone);
//         setTransporterName(storedTransporter);
//         fetchRoutes(storedPhone, storedTransporter);
//       }
//     };
//     fetchPhoneNumber();
//   }, []);

//   const fetchRoutes = async (phone: string, transporter: string) => {
//     const transporterDocId = `${phone}_${transporter}`;
//     const routesRef = collection(db, 'transporter', transporterDocId, 'myRoute');
//     const q = query(routesRef, orderBy('timestamp', sortOrder));
//     const querySnapshot = await getDocs(q);
//     const routeData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     setRoutes(routeData);
//   };

//   const handleUpload = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] });
//       if (result.canceled) return;

//       const response = await fetch(result.assets[0].uri);
//       const blob = await response.blob();
//       const reader = new FileReader();
//       reader.readAsBinaryString(blob);
//       reader.onload = async (e) => {
//         const data = e.target?.result;
//         const workbook = XLSX.read(data, { type: 'binary' });
//         const sheetName = workbook.SheetNames[0];
//         const sheet: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        
//         if (!Array.isArray(sheet) || sheet.length === 0 || sheet[0].length !== 5) {
//           Alert.alert('Invalid File', 'The uploaded file must have exactly 5 columns.');
//           return;
//         }
        
//         const formattedData = sheet.slice(1).map(row => ({
//           column1: row[0],
//           column2: row[1],
//           column3: row[2],
//           column4: row[3],
//           column5: row[4],
//           timestamp: new Date(),
//         }));
        
//         if (phoneNumber && transporterName) {
//           const transporterDocId = `${phoneNumber}_${transporterName}`;
//           for (const route of formattedData) {
//             await addDoc(collection(db, 'transporter', transporterDocId, 'myRoute'), route);
//           }
//           Alert.alert('Success', 'Routes uploaded successfully!');
//           fetchRoutes(phoneNumber, transporterName);
//         }
//       };
//     } catch (error: any) {
//       Alert.alert('Error', error);
//     }
//   };

//   const filteredRoutes = routes.filter(route =>
//     Object.values(route).some(value =>
//       typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
//     )
//   );

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Upload Excel File" onPress={handleUpload} />
//       <TextInput
//         placeholder="Search Routes"
//         value={search}
//         onChangeText={setSearch}
//         style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
//       />
//       <Button title={`Sort by Timestamp (${sortOrder.toUpperCase()})`} onPress={() => {
//         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//         if (phoneNumber && transporterName) fetchRoutes(phoneNumber, transporterName);
//       }} />
//       <FlatList
//         data={filteredRoutes}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={{ padding: 10, borderBottomWidth: 1 }}>
//             <Text>{JSON.stringify(item, null, 2)}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default UploadRoutesScreen;


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Button,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";

const db = getFirestore(app);

export default function Details() {
  const [transporterName, setTransporterName] = useState(null);
  const [routeInput, setRouteInput] = useState("");
  const [routes, setRoutes] = useState<{ routeName: string; data: string[][] }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber: any = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransporterData = async () => {
      const transporterRef = collection(db, "transporter");
      const transporterSnapshot = await getDocs(transporterRef);
      let foundTransporter: any = null;

      transporterSnapshot.forEach((doc) => {
        if (doc.id.startsWith(`${phoneNumber}_`)) {
          foundTransporter = doc.id;
        }
      });

      if (!foundTransporter) return;
      setTransporterName(foundTransporter);

      const routeRef = collection(db, "transporter", foundTransporter, "myRoutes");
      const routeSnapshot = await getDocs(routeRef);
      setRoutes(routeSnapshot.docs.map((doc) => ({ routeName: doc.id, data: doc.data().data })));
      setLoading(false);
    };
    fetchTransporterData();
  }, [phoneNumber]);

//   const handleFilePick = async () => {
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

//       const routeName = `Route_${new Date().toISOString()}`;
//       const routeDocRef = doc(db, "transporter", transporterName, "myRoutes", routeName);
//       await setDoc(routeDocRef, { data: jsonData });
//       setRoutes((prev) => [...prev, { routeName, data: jsonData }]);
//     } catch (error) {
//       console.error("Error reading the Excel file:", error);
//     }
//   };

const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel"
        ],
        copyToCacheDirectory: true,
        multiple: false
      });
  
      if (result.canceled || !result.assets?.length) {
        console.log("File selection was canceled");
        return;
      }
  
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
  
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
  
      const workbook = XLSX.read(bytes, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
  
      // Convert the sheet data to JSON
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Convert 2D array to an array of objects
      const headers = jsonData[0]; // First row is the header
      const rows = jsonData.slice(1); // Rest are the rows
  
      const formattedData = rows.map((row) => {
        const rowObject: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index] || ""; // Use header as key and row value as value
        });
        return rowObject;
      });
  
      const routeName = `Route_${new Date().toISOString()}`;
      const routeDocRef = doc(db, "transporter", transporterName, "myRoutes", routeName);
  
      // Save the formatted data to Firestore
      await setDoc(routeDocRef, { data: formattedData });
  
      // Update local state
      setRoutes((prev) => [...prev, { routeName, data: formattedData }]);
    } catch (error) {
      console.error("Error reading Excel file:", error);
    }
  };

  const filteredRoutes = routes.filter((route) => route.routeName.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20 }}>Dashboard</Text>
            </TouchableOpacity>
            <Image source={require("../../assets/images/Back.png")} style={{ width: 30, resizeMode: "contain", marginRight: 10 }} />
          </View>

          <Text style={styles.title}>Route List</Text>

          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#000"
            placeholder="Search Route..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <Button title="Upload Excel File" onPress={handleFilePick} />

          {/* <FlatList
            data={filteredRoutes}
            keyExtractor={(item) => item.routeName}
            ListHeaderComponent={
                <View style={styles.tableHeader}>
                  <Text style={styles.headerText}>Route Name</Text>
                  <Text style={styles.headerText}>Data</Text>
                </View>
              }
            ListEmptyComponent={<Text style={styles.noResults}>No routes found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.routeName}</Text>
                <ScrollView horizontal>
                  <FlatList
                    data={item.data}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: row }) => (
                      <View style={styles.row}>
                        {row.map((cell, index) => (
                          <Text key={index} style={styles.cell}>{cell}</Text>
                        ))}
                      </View>
                    )}
                  />
                </ScrollView>
              </View>
            )}
          /> */}

<FlatList
  data={filteredRoutes}
  keyExtractor={(item) => item.routeName}
  ListHeaderComponent={
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Route Name</Text>
      <Text style={styles.headerText}>Data</Text>
    </View>
  }
  ListEmptyComponent={<Text style={styles.noResults}>No routes found.</Text>}
  renderItem={({ item }) => (
    <View style={styles.routeContainer}>
      <Text style={styles.routeName}>{item.routeName}</Text>
      <ScrollView horizontal>
        <View>
          {/* Render headers */}
          <View style={styles.row}>
            {Object.keys(item.data[0] || {}).map((header, index) => (
              <Text key={index} style={styles.cellHeader}>{header}</Text>
            ))}
          </View>
          {/* Render rows */}
          {item.data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Object.values(row).map((cell, cellIndex) => (
                <Text key={cellIndex} style={styles.cell}>{cell}</Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )}
/>

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Route</Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Route Name"
                  value={routeInput}
                  onChangeText={setRouteInput}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 8,
  },
  searchInput: {
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  headerText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  topSection: {
    width: '100%',
    height: 60,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  closeButton: { textAlign: "center", marginTop: 10, color: "red" },
  noResults: { textAlign: "center", marginTop: 10, fontSize: 16, color: "gray" },
  routeContainer: {
    marginBottom: 20,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cellHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});