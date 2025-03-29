import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { app, auth } from "../firebase";
import { useFonts } from "expo-font";

// Initialize Firestore
const db = getFirestore(app);

export default function Manage() {
  const [shippingPoints, setShippingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [editableRowId, setEditableRowId] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(rows);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  const { shippingPoint } = useLocalSearchParams();

  // Fetch data from Firestore
  useEffect(() => {
    const fetchShippingPoints = async () => {
      try {
        const snapshot = await getDocs(collection(db, "shippingpoints"));
        const points:any = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().shippingpoint,
        }));
        setShippingPoints(points);
      } catch (error) {
        console.error("Error fetching shipping points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingPoints();
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "DriverOnBoarding"));
      const fetchedRows = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((row: any) => row.LoadingPoint === shippingPoint);
  
      setRows(fetchedRows);
      setFilteredData(fetchedRows);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Unable to fetch data from Firestore.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredData(rows);
    } else {
      const filtered = rows.filter((item) => {
        const vehicleNo = item.vehicleNo?.toLowerCase() || "";
        const transporter = item.transporter?.toLowerCase() || "";
        const driver = item.driverName?.toLowerCase() || "";
  
        return (
          vehicleNo.includes(text.toLowerCase()) ||
          transporter.includes(text.toLowerCase()) ||
          driver.includes(text.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
  };
  
  // Handle edit action
  const handleEdit = (row: any) => {
    setEditableRowId(row.id);
    setEditedRow({ ...row });
  };

  // Handle save action
  const handleSave = async (id: string) => {
    try {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, ...editedRow } : row
        )
      );

      const docRef = doc(db, "DriverOnBoarding", id);
      await updateDoc(docRef, editedRow);

      Alert.alert("Success", "Row updated successfully.");
    } catch (error) {
      console.error("Error updating Firestore:", error);
      Alert.alert("Error", "Unable to update data in Firestore.");
    } finally {
      setEditableRowId(null);
    }
  };

  const confirmSave = (id: string) => {
    Alert.alert(
      "Confirm Save",
      "Are you sure you want to save changes?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: () => handleSave(id) },
      ]
    );
  };
  
  const renderRow = ({ item }: { item: any }) => {
    const isEditable = editableRowId === item.id;

    return (
      <View style={styles.row}>
        {isEditable ? (
          <TextInput
            style={styles.cellInput}
            value={editedRow.vehicleNo}
            onChangeText={(text) =>
              setEditedRow((prev: any) => ({ ...prev, vehicleNo: text }))
            }
          />
        ) : (
          <Text style={styles.cell}>{item.vehicleNo}</Text>
        )}

        {isEditable ? (
          <TextInput
            style={styles.cellInput}
            value={editedRow.transporter}
            onChangeText={(text) =>
              setEditedRow((prev: any) => ({ ...prev, transporter: text }))
            }
          />
        ) : (
          <Text style={styles.cell}>{item.transporter}</Text>
        )}

        {isEditable ? (
          <TextInput
            style={styles.cellInput}
            value={editedRow.driverName}
            onChangeText={(text) =>
              setEditedRow((prev: any) => ({ ...prev, driverName: text }))
            }
          />
        ) : (
          <Text style={styles.cell}>{item.driverName}</Text>
        )}

        <TouchableOpacity
          style={styles.editIcon}
          onPress={() =>
            isEditable ? confirmSave(item.id) : handleEdit(item)
          }
        >
          <Text style={{ fontSize: 10 }}>
            {isEditable ? "✔️" : "✏️"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          {/* Header Section */}
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image
                source={require("../../assets/images/Back.png")}
                resizeMode="contain"
                style={styles.backIcon}
              />
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {/* Shipping Point Info */}
          <View style={styles.shippingPointContainer}>
            <Text style={styles.shippingPointLabel}>Current Shipping Point</Text>
            <Text style={styles.shippingPointValue}>{shippingPoint}</Text>
          </View>

          {/* Manage Drivers Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.manageDriversText}>Manage Drivers</Text>
            <TouchableOpacity onPress={() => router.push('/agent/manageDriver')}>
              <Text style={styles.newDriverButton}> + New</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#888"
          />

          {/* Table Header */}
          <View style={styles.header}>
            <Text style={[styles.cell, styles.headerText]}>Vehicle No.</Text>
            <Text style={[styles.cell, styles.headerText]}>Transporter</Text>
            <Text style={[styles.cell, styles.headerText]}>Driver</Text>
            <Text style={styles.headerText}></Text>
          </View>

          {/* Scrollable Table Content */}
          {loading ? (
            <ActivityIndicator size="large" color="#F6984C" style={styles.loadingIndicator} />
          ) : (
            <View style={styles.tableContainer}>
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={renderRow}
                ListEmptyComponent={
                  <Text style={styles.noDataText}>No Results Found</Text>
                }
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={handleRefresh}
                    colors={['#F6984C']}
                    tintColor="#F6984C"
                  />
                }
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  manageText: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#000',
  },
  shippingPointContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  shippingPointLabel: {
    fontSize: 16,
    color: '#666',
  },
  shippingPointValue: {
    color: "#F6984C",
    fontSize: 18,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  manageDriversText: {
    fontSize: 20,
    fontWeight: "600",
    color: '#000',
  },
  newDriverButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F6984C',
  },
  searchBar: {
    height: 45,
    width: '100%',
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    textAlign:'center'
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    minHeight: 50,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  cellInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#F6984C",
    height: 40,
    padding: 0,
    margin: 0,
  },
  editIcon: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  tableContainer: {
    flex: 1, // This makes the FlatList take up remaining space
  },
  flatList: {
    width: '100%',
    //marginBottom: 20,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some padding at the bottom
  },
});