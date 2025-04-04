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
//                 <ScrollView horizontal>
//                   <View>
//                     {/* Render headers */}
//                     <View style={styles.row}>
//                       {Object.keys(item.data[0] || {}).map((header, index) => (
                       
//                             <Text key={index} style={styles.cellHeader}>{header}</Text>
//                       ))}
//                     </View>
//                     {/* Render rows */}
//                     {item.data.map((row, rowIndex) => (
//                       <View key={rowIndex} style={styles.row}>
//                         {Object.values(row).map((cell, cellIndex) => (
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
//   cellHeader: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 12,
//     marginRight:10
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
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#000",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
    
//   },
//   headerText: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Button,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
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
  const [routes, setRoutes] = useState<{ routeName: string; data: any[] }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleFilePick = async () => {
    setUploading(true);
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
        setUploading(false);
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
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate the number of columns
      if (jsonData[0] && jsonData[0].length !== 5) {
        Alert.alert("Error", "The uploaded file must have exactly 5 columns.");
        setUploading(false);
        return;
      }

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
      Alert.alert("Error", "Failed to upload the file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteRoute = async (routeName: string) => {
    try {
      const routeDocRef = doc(db, "transporter", transporterName, "myRoutes", routeName);
      await deleteDoc(routeDocRef);

      // Update local state
      setRoutes((prev) => prev.filter((route) => route.routeName !== routeName));
    } catch (error) {
      console.error("Error deleting route:", error);
      Alert.alert("Error", "Failed to delete the route. Please try again.");
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

          <Button title="Upload Excel File" onPress={handleFilePick} disabled={uploading} />

          {uploading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

          <FlatList
            data={filteredRoutes}
            keyExtractor={(item) => item.routeName}
            ListEmptyComponent={<Text style={styles.noResults}>No routes found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.routeContainer}>
                {/* <Text style={styles.routeName}>{item.routeName}</Text> */}
                <ScrollView horizontal>
                  <View>
                    {/* Render headers */}
                    <View style={styles.tableHeader}>
                      {Object.keys(item.data[0] || {}).map((header, index) => (
                        <Text key={index} style={styles.headerText}>{header}</Text>
                      ))}
                    </View>
                    {/* Render rows */}
                    {item.data.map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.row}>
                        {Object.values(row).map((cell: any, cellIndex) => (
                          <Text key={cellIndex} style={styles.cell}>{cell}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity onPress={() => deleteRoute(item.routeName)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
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
  searchInput: {
    height: 40,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginVertical: 10,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    justifyContent:'space-between',
    width:'100%'
  },
  headerText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
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
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  noResults: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  topSection: {
    width: '100%',
    height: 60,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

