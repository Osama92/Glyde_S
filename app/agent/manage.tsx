// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   Image,
//   StatusBar,
//   FlatList,
//   Alert,
//   RefreshControl,
//   ScrollView
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   updateDoc
// } from "firebase/firestore";
// import { app, auth } from "../firebase";
// import { useFonts } from "expo-font";

// // Initialize Firestore
// const db = getFirestore(app);

// export default function Manage() {
//   const [shippingPoints, setShippingPoints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const [rows, setRows] = useState<any[]>([]);
//   const [editableRowId, setEditableRowId] = useState<string | null>(null);
//   const [editedRow, setEditedRow] = useState<any>({});
//   const [searchText, setSearchText] = useState("");
//   const [filteredData, setFilteredData] = useState(rows);
//   const [refreshing, setRefreshing] = useState(false);

//   const [fontsLoaded] = useFonts({
//     Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//   });

//   const { shippingPoint } = useLocalSearchParams();

//   // Fetch data from Firestore
//   useEffect(() => {
//     const fetchShippingPoints = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "shippingpoints"));
//         const points:any = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().shippingpoint,
//         }));
//         setShippingPoints(points);
//       } catch (error) {
//         console.error("Error fetching shipping points:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShippingPoints();
//   }, [])

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const snapshot = await getDocs(collection(db, "DriverOnBoarding"));
//       const fetchedRows = snapshot.docs
//         .map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }))
//         .filter((row: any) => row.LoadingPoint === shippingPoint);
  
//       setRows(fetchedRows);
//       setFilteredData(fetchedRows);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       Alert.alert("Error", "Unable to fetch data from Firestore.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };
  
//   // Initial data fetch
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Handle pull-to-refresh
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchData();
//   };

//   const handleSearch = (text: string) => {
//     setSearchText(text);
//     if (text.trim() === "") {
//       setFilteredData(rows);
//     } else {
//       const filtered = rows.filter((item) => {
//         const vehicleNo = item.vehicleNo?.toLowerCase() || "";
//         const transporter = item.transporter?.toLowerCase() || "";
//         const driver = item.driverName?.toLowerCase() || "";
  
//         return (
//           vehicleNo.includes(text.toLowerCase()) ||
//           transporter.includes(text.toLowerCase()) ||
//           driver.includes(text.toLowerCase())
//         );
//       });
//       setFilteredData(filtered);
//     }
//   };
  
//   // Handle edit action
//   const handleEdit = (row: any) => {
//     setEditableRowId(row.id);
//     setEditedRow({ ...row });
//   };

//   // Handle save action
//   const handleSave = async (id: string) => {
//     try {
//       setRows((prevRows) =>
//         prevRows.map((row) =>
//           row.id === id ? { ...row, ...editedRow } : row
//         )
//       );

//       const docRef = doc(db, "DriverOnBoarding", id);
//       await updateDoc(docRef, editedRow);

//       Alert.alert("Success", "Row updated successfully.");
//     } catch (error) {
//       console.error("Error updating Firestore:", error);
//       Alert.alert("Error", "Unable to update data in Firestore.");
//     } finally {
//       setEditableRowId(null);
//     }
//   };

//   const confirmSave = (id: string) => {
//     Alert.alert(
//       "Confirm Save",
//       "Are you sure you want to save changes?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Save", onPress: () => handleSave(id) },
//       ]
//     );
//   };
  
//   const renderRow = ({ item }: { item: any }) => {
//     const isEditable = editableRowId === item.id;

//     return (
//       <View style={styles.row}>
//         {isEditable ? (
//           <TextInput
//             style={styles.cellInput}
//             value={editedRow.vehicleNo}
//             onChangeText={(text) =>
//               setEditedRow((prev: any) => ({ ...prev, vehicleNo: text }))
//             }
//           />
//         ) : (
//           <Text style={styles.cell}>{item.vehicleNo}</Text>
//         )}

//         {isEditable ? (
//           <TextInput
//             style={styles.cellInput}
//             value={editedRow.transporter}
//             onChangeText={(text) =>
//               setEditedRow((prev: any) => ({ ...prev, transporter: text }))
//             }
//           />
//         ) : (
//           <Text style={styles.cell}>{item.transporter.split("_")[1]}</Text>
//         )}

//         {isEditable ? (
//           <TextInput
//             style={styles.cellInput}
//             value={editedRow.driverName}
//             onChangeText={(text) =>
//               setEditedRow((prev: any) => ({ ...prev, driverName: text }))
//             }
//           />
//         ) : (
//           <Text style={styles.cell}>{item.driverName}</Text>
//         )}

//         <TouchableOpacity
//           style={styles.editIcon}
//           onPress={() =>
//             isEditable ? confirmSave(item.id) : handleEdit(item)
//           }
//         >
//           <Text style={{ fontSize: 10 }}>
//             {isEditable ? "✔️" : "✏️"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (!fontsLoaded) return null;

//   const dismissKeyboard = () => Keyboard.dismiss();

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
//     >
//       <StatusBar barStyle="dark-content" />
//       <TouchableWithoutFeedback onPress={dismissKeyboard}>
//         <View style={styles.innerContainer}>
//           {/* Header Section */}
//           <View style={styles.topSection}>
//             <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//               <Image
//                 source={require("../../assets/images/Back.png")}
//                 resizeMode="contain"
//                 style={styles.backIcon}
//               />
//               <Text style={styles.manageText}>Manage</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Shipping Point Info */}
//           <View style={styles.shippingPointContainer}>
//             <Text style={styles.shippingPointLabel}>Current Shipping Point</Text>
//             <Text style={styles.shippingPointValue}>{shippingPoint}</Text>
//           </View>

//           {/* Manage Drivers Header */}
//           <View style={styles.headerContainer}>
//             <Text style={styles.manageDriversText}>Manage Drivers</Text>
//             <TouchableOpacity onPress={() => router.push({pathname:'/agent/manageDriver', params: { originPoint: shippingPoint }})}>
//               <Text style={styles.newDriverButton}> + New</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Search Bar */}
//           <TextInput
//             style={styles.searchBar}
//             placeholder="Search"
//             value={searchText}
//             onChangeText={handleSearch}
//             placeholderTextColor="#888"
//           />

//           {/* Table Header */}
//           <View style={styles.header}>
//             <Text style={[styles.cell, styles.headerText]}>Vehicle No.</Text>
//             <Text style={[styles.cell, styles.headerText]}>Transporter</Text>
//             <Text style={[styles.cell, styles.headerText]}>Driver</Text>
//             <Text style={styles.headerText}></Text>
//           </View>

//           {/* Scrollable Table Content */}
//           {loading ? (
//             <ActivityIndicator size="large" color="#F6984C" style={styles.loadingIndicator} />
//           ) : (
//             <View style={styles.tableContainer}>
//               <FlatList
//                 data={filteredData}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderRow}
//                 ListEmptyComponent={
//                   <Text style={styles.noDataText}>No Results Found</Text>
//                 }
//                 style={styles.flatList}
//                 contentContainerStyle={styles.flatListContent}
//                 refreshControl={
//                   <RefreshControl 
//                     refreshing={refreshing} 
//                     onRefresh={handleRefresh}
//                     colors={['#F6984C']}
//                     tintColor="#F6984C"
//                   />
//                 }
//               />
//             </View>
//           )}
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   innerContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   topSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backIcon: {
//     width: 24,
//     height: 24,
//     marginRight: 10,
//   },
//   manageText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: '#000',
//   },
//   shippingPointContainer: {
//     flexDirection: "row",
//     width: "100%",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   shippingPointLabel: {
//     fontSize: 16,
//     color: '#666',
//   },
//   shippingPointValue: {
//     color: "#F6984C",
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     width: '100%',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   manageDriversText: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: '#000',
//   },
//   newDriverButton: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#F6984C',
//   },
//   searchBar: {
//     height: 45,
//     width: '100%',
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     fontSize: 16,
//     backgroundColor: '#f8f8f8',
//   },
//   header: {
//     flexDirection: "row",
//     backgroundColor: "#f8f8f8",
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   headerText: {
//     fontWeight: "bold",
//     fontSize: 14,
//     color: "#333",
//     textAlign:'center'
//   },
//   row: {
//     flexDirection: "row",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     alignItems: "center",
//     minHeight: 50,
//   },
//   cell: {
//     flex: 1,
//     fontSize: 14,
//     color: "#333",
//     textAlign: "center",
//   },
//   cellInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#333",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F6984C",
//     height: 40,
//     padding: 0,
//     margin: 0,
//   },
//   editIcon: {
//     width: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   noDataText: {
//     textAlign: "center",
//     color: "#888",
//     marginTop: 20,
//     fontSize: 16,
//   },
//   loadingIndicator: {
//     marginTop: 40,
//   },
//   tableContainer: {
//     flex: 1, // This makes the FlatList take up remaining space
//   },
//   flatList: {
//     width: '100%',
//     //marginBottom: 20,
//   },
//   flatListContent: {
//     flexGrow: 1,
//     paddingBottom: 20, // Add some padding at the bottom
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  FlatList,
  RefreshControl,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
  Alert
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');
const db = getFirestore(app);

export default function Manage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState('');
  const [documentLoading, setDocumentLoading] = useState({license: false,driverPhoto: false
  });

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  const { shippingPoint } = useLocalSearchParams();

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "DriverOnBoarding"));
      const fetchedDrivers = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((driver: any) => driver.LoadingPoint === shippingPoint);
  
      setDrivers(fetchedDrivers);
      setFilteredData(fetchedDrivers);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const viewDocument = async (docType: 'driverPhoto' | 'licencePhoto') => {
    try {
      if (!selectedDriver || !selectedDriver[docType]) {
        Alert.alert('Error', 'Document not available');
        return;
      }
  
      // Set loading state for the specific document type
      setDocumentLoading(prev => ({...prev, [docType]: true}));
      
      const storage = getStorage(app);
      const documentRef = ref(storage, selectedDriver[docType]);
      const downloadUrl = await getDownloadURL(documentRef);
      
      setCurrentDocumentUrl(downloadUrl);
      setDocumentModalVisible(true);
      
    } catch (error) {
      console.error('Error fetching document:', error);
      Alert.alert('Error', 'Could not load document');
    } finally {
      // Reset loading state for the specific document type
      setDocumentLoading(prev => ({...prev, [docType]: false}));
    }
  };
  
  const openInBrowser = async () => {
    if (currentDocumentUrl) {
      await WebBrowser.openBrowserAsync(currentDocumentUrl);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredData(drivers);
    } else {
      const filtered = drivers.filter((driver) => {
        const searchLower = text.toLowerCase();
        return (
          driver.vehicleNo?.toLowerCase().includes(searchLower) ||
          driver.transporter?.toLowerCase().includes(searchLower) ||
          driver.driverName?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  };

  const handleSelectDriver = (driver: any) => {
    setSelectedDriver(driver);
    setShowDetails(true);
  };

  const renderDriverItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => handleSelectDriver(item)}
    >
      <View style={styles.driverCardHeader}>
        <Ionicons name="car-sport" size={24} color="#4A90E2" />
        <Text style={styles.driverVehicleNo}>{item.vehicleNo}</Text>
      </View>
      
      <View style={styles.driverInfoRow}>
        <MaterialIcons name="person" size={18} color="#666" />
        <Text style={styles.driverInfoText}>{item.driverName}</Text>
      </View>
      
      <View style={styles.driverInfoRow}>
        <MaterialIcons name="local-shipping" size={18} color="#666" />
        <Text style={styles.driverInfoText}>
          {item.transporter?.split("_")[1] || "N/A"}
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.statusBadge}>
          {item.status || "Active"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4A90E2"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver Management</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/agent/manageDriver",
                params: { originPoint: shippingPoint },
              })
            }
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Shipping Point Info */}
        <View style={styles.shippingPointContainer}>
          <Text style={styles.shippingPointLabel}>Current Location:</Text>
          <Text style={styles.shippingPointValue}>{shippingPoint}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {/* Driver List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4A90E2"
            style={styles.loader}
          />
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="directions-car" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No drivers found</Text>
            {searchText && (
              <Text style={styles.emptySubtext}>
                Try a different search term
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderDriverItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>

      {/* Driver Details Modal */}
      {showDetails && selectedDriver && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver & Vehicle Details</Text>
              <TouchableOpacity
                onPress={() => setShowDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Vehicle Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <DetailRow
                icon="directions-car"
                label="Vehicle No"
                value={selectedDriver.vehicleNo}
              />
              <DetailRow
                icon="local-shipping"
                label="Transporter"
                value={selectedDriver.transporter?.split("_")[1]}
              />
              <DetailRow
                icon="scale"
                label="Tonnage"
                value={selectedDriver.tonnage}
              />
              <DetailRow
                icon="color-lens"
                label="Color"
                value={selectedDriver.color || "N/A"}
              />
            </View>

            {/* Driver Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <DetailRow
                icon="person"
                label="Name"
                value={selectedDriver.driverName}
              />
              <DetailRow
                icon="phone"
                label="Contact"
                value={selectedDriver.mobileNumber}
              />
              <DetailRow
                icon="location-on"
                label="Origin Point"
                value={selectedDriver.LoadingPoint}
              />
            </View>

            {/* Documents Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Documents</Text>
              <TouchableOpacity 
    style={styles.documentButton}
    onPress={() => viewDocument('licencePhoto')}
    disabled={documentLoading.license}
  >
    {documentLoading.license ? (
      <ActivityIndicator color="#4A90E2" />
    ) : (
      <Text style={styles.documentButtonText}>View Driver License</Text>
    )}
  </TouchableOpacity>
  
  {/* Driver Photo Button */}
  <TouchableOpacity 
    style={styles.documentButton}
    onPress={() => viewDocument('driverPhoto')}
    disabled={documentLoading.driverPhoto}
  >
    {documentLoading.driverPhoto ? (
      <ActivityIndicator color="#4A90E2" />
    ) : (
      <Text style={styles.documentButtonText}>View Driver Photo</Text>
    )}
  </TouchableOpacity>
            </View>

            {/* Document Viewer Modal */}
<Modal
  visible={documentModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setDocumentModalVisible(false)}
>
  <View style={styles.documentModalContainer}>
    <View style={styles.documentModalContent}>
      <View style={styles.documentModalHeader}>
        <Text style={styles.documentModalTitle}>Document Viewer</Text>
        <TouchableOpacity onPress={() => setDocumentModalVisible(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {currentDocumentUrl ? (
        <>
          <Image 
            source={{ uri: currentDocumentUrl }}
            style={styles.documentImage}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.openInBrowserButton}
            onPress={openInBrowser}
          >
            <Text style={styles.openInBrowserText}>Open in Browser</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.documentNotFound}>Document not available</Text>
      )}
    </View>
  </View>
</Modal>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Reusable Detail Row Component
const DetailRow = ({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialIcons>['name'], label: string, value: any }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={20} color="#4A90E2" />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins',
  },
  addButton: {
    padding: 8,
  },
  shippingPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  shippingPointLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
    fontFamily: 'Nunito',
  },
  shippingPointValue: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    fontFamily: 'Nunito',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Nunito',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    fontFamily: 'Nunito',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 5,
    fontFamily: 'Nunito',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  driverCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverVehicleNo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    fontFamily: 'Poppins',
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  driverInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    fontFamily: 'Nunito',
  },
  cardFooter: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Nunito',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins',
  },
  closeButton: {
    padding: 5,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    width: 100,
    fontFamily: 'Nunito',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Nunito',
  },
  documentButton: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  documentButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Nunito',
  },
  documentModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  documentModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  documentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  documentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentImage: {
    width: '100%',
    height: 300,
    marginBottom: 15,
  },
  openInBrowserButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  openInBrowserText: {
    color: '#FFF',
    fontWeight: '500',
  },
  documentNotFound: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});