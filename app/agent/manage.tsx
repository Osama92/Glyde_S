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
  RefreshControl
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { useRouter } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { app } from "../firebase"; // Ensure this points to your Firebase initialization file
import { useFonts } from "expo-font";


// Initialize Firestore
const db = getFirestore(app);

export default function Manage() {
  const [shippingPoints, setShippingPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState("");
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

  

  // Fetch data from Firestore
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const snapshot = await getDocs(collection(db, "shippingpoints")); // Use your collection name
  //       const fetchedRows = snapshot.docs.map((doc) => ({
  //         id: doc.id, 
  //         ...doc.data(), 
  //       }));
  //       setRows(fetchedRows);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       Alert.alert("Error", "Unable to fetch data from Firestore");
  //     } finally {
  //       setLoading(false);
  //       setRefreshing(false);
  //     }
  //   };

  //   fetchData();
  // }, []);
  // Fetch data from Firestore
  useEffect(() => {
    const fetchShippingPoints = async () => {
      try {
        const snapshot = await getDocs(collection(db, "shippingpoints"));
        
        const points:any = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().shippingpoint, // Ensure your Firestore documents have a `name` field
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
      const snapshot = await getDocs(collection(db, "shippingpoints")); // Use your collection name
      const fetchedRows = snapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document data (fields like vehicleNo, transporter, driver)
      }));
      setRows(fetchedRows);
      setFilteredData(fetchedRows)
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
      const filtered = rows.filter(
        (item) =>
          item.vehicleNo.toLowerCase().includes(text.toLowerCase()) ||
          item.transporter.toLowerCase().includes(text.toLowerCase()) ||
          item.driver.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Handle edit action
  const handleEdit = (row: any) => {
    setEditableRowId(row.id);
    setEditedRow({ ...row }); // Clone the row for editing
  };

  // Handle save action (locally and in Firestore)
  const handleSave = async (id: string) => {
    try {
      // Update the local state
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, ...editedRow } : row
        )
      );

      // Update Firestore
      const docRef = doc(db, "shippingpoints", id); // Use your collection name
      await updateDoc(docRef, editedRow);

      Alert.alert("Success", "Row updated successfully.");
    } catch (error) {
      console.error("Error updating Firestore:", error);
      Alert.alert("Error", "Unable to update data in Firestore.");
    } finally {
      setEditableRowId(null); // Exit edit mode
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
        {/* Editable or Static Field for Vehicle No */}
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

        {/* Editable or Static Field for Transporter */}
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

        {/* Editable or Static Field for Driver */}
        {isEditable ? (
          <TextInput
            style={styles.cellInput}
            value={editedRow.driver}
            onChangeText={(text) =>
              setEditedRow((prev: any) => ({ ...prev, driver: text }))
            }
          />
        ) : (
          <Text style={styles.cell}>{item.driver}</Text>
        )}

        {/* Edit/Save Icon */}
        <TouchableOpacity
          style={styles.editIcon}
          // onPress={() =>
          //   isEditable ? handleSave(item.id) : handleEdit(item)
          // }
          onPress={() =>
            isEditable ? confirmSave(item.id) : handleEdit(item)
          }
        >
          <Text style={{ fontSize: 16 }}>
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
    >
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Manage</Text>
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/Back.png")}
              style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 40,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>Current Shipping Point</Text>
            <Text style={{ color: "#F6984C" }}>{selectedPoint}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 40,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "600" }}>
              Update Shipping Point
            </Text>
            <Text style={{ color: "#F6984C" }}>See all</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="Orange" />
          ) : (
            <>
              <SearchableDropdown
                items={shippingPoints}
                onItemSelect={(item:any) => setSelectedPoint(item.name)} 
                containerStyle={{  width:'100%' }}
                itemTextStyle={{ color: '#222' }}
                itemsContainerStyle={{ height: 80, marginTop: 10 }}
                resetValue={true}
                itemStyle={{
                  padding: 10,
                  marginTop: 2,
                  backgroundColor: '#ddd',
                  borderColor: '#bbb',
                  borderWidth: 1,
                  borderRadius: 5,
                }}
                textInputProps={
                    {
                      placeholder: "Search Shipping Point",
                      underlineColorAndroid: "transparent",
                      style: {
                          padding: 12,
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 5,
                      },
                      onTextChange: text => (null)
                    }
                  }
              />
            </>
          )}

          <View style={{flexDirection:'row', width:'100%', height: 40,alignItems:'flex-end', justifyContent:'space-between', marginBottom:10}}>
            <Text style={{fontSize:20, fontWeight: "600"}}>Manage Drivers</Text>
            <TouchableOpacity>
              <Text style={{fontSize:14, fontWeight:'bold', color:'orange'}}> + New</Text>
            </TouchableOpacity>
          </View>
          <>
             {/* Search Input */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Table Header */}
      <View style={styles.header}>
        <Text style={[styles.cell, styles.headerText]}>Vehicle No.</Text>
        <Text style={[styles.cell, styles.headerText]}>Transporter</Text>
        <Text style={[styles.cell, styles.headerText]}>Driver</Text>
        <Text style={styles.headerText}></Text>
      </View>

      {/* Table Rows */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          //data={rows}
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          ListEmptyComponent={<Text style={styles.noDataText}>No Results Found</Text>}
          style={{width:'100%'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
          </>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    fontFamily: "Poppins",
  },
  input: {
    height: 50,
    width: "100%",
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: "Nunito",
    color: "#000",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    width:'50%',
    alignSelf:'center'
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: 'Nunito'
  },
  topSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  searchBar: {
    height: 40,
    width:'100%',
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    width:'100%',
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  editIcon: {
    //flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#888",
  },
  cellInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    height: 40
  }
});
