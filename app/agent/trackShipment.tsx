// import React, { useEffect, useState } from "react";
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   StyleSheet, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   TextInput, 
//   RefreshControl,
//   Image
// } from "react-native";
// import { getFirestore, collection, getDocs, doc, getDoc, query } from "firebase/firestore";
// import { router} from "expo-router";
// import { app } from "../firebase"; 

// const db = getFirestore(app);

// type Shipment = {
//   id: string;
//   driverName: string;
//   transporter: string;
//   vehicleNo: string;
//   mobileNumber: string;
//   statusId: number;
//   createdAt: string;
// };

// type Material = {
//   id: string;
//   name: string;
//   quantity: number;
// };

// type Delivery = {
//   id: string;
//   materials: Material[];
// };

// const TrackShipment = () => {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
//   const [deliveries, setDeliveries] = useState<Delivery[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Fetch shipments from Firestore
//   const fetchShipments = async () => {
//     setLoading(true);
//     try {
//       const snapshot = await getDocs(collection(db, "Shipment"));
//       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shipment[];
//       setShipments(data);
//       setFilteredShipments(data);
//     } catch (error) {
//       console.error("Error fetching shipments:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch deliveries for a selected shipment
//   const fetchDeliveries = async (shipmentId: string) => {
//     setLoading(true);
//     try {
//       const deliverySnapshot = await getDocs(collection(db, "Shipment", shipmentId, "deliveries"));
//       const deliveryData = deliverySnapshot.docs.map(doc => ({
//         id: doc.id,
//         materials: doc.data().materials || [],
//       })) as Delivery[];
//       setDeliveries(deliveryData);
//       setSelectedShipmentId(shipmentId);
//     } catch (error) {
//       console.error("Error fetching deliveries:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShipments();
//   }, []);

//   // Pull-to-refresh function for shipments
//   const onRefreshShipments = async () => {
//     setRefreshing(true);
//     await fetchShipments();
//     setRefreshing(false);
//   };

//   // Pull-to-refresh function for deliveries
//   const onRefreshDeliveries = async () => {
//     setRefreshing(true);
//     if (selectedShipmentId) {
//       await fetchDeliveries(selectedShipmentId);
//     }
//     setRefreshing(false);
//   };

//   // Filter shipments based on search text
//   const handleSearch = (text: string) => {
//     setSearchText(text);
//     if (text.trim() === "") {
//       setFilteredShipments(shipments);
//     } else {
//       const filtered = shipments.filter((shipment) =>
//         shipment.id.toLowerCase().includes(text.toLowerCase())
//       );
//       setFilteredShipments(filtered);
//     }
//   };

//   // Render each shipment
//   const renderShipment = ({ item }: { item: Shipment }) => (
//     <TouchableOpacity
//       style={styles.row}
//       onPress={() => fetchDeliveries(item.id)}
//     >
//       <Text style={styles.cell}>{item.id}</Text>
//       <Text style={styles.cell}>{item.driverName}</Text>
//       <Text style={styles.cell}>{item.transporter}</Text>
//       <Text style={styles.cell}>{item.vehicleNo}</Text>
//       <Text style={styles.cell}>{item.statusId}</Text>
//     </TouchableOpacity>
//   );

//   // Render each delivery
//   const renderDelivery = ({ item }: { item: Delivery }) => (
//     <View>
//       <Text style={styles.subHeader}>Delivery ID: {item.id}</Text>
//       {item.materials.map((material) => (
//         <View style={styles.row} key={material.id}>
//           <Text style={styles.cell}>{material.name}</Text>
//           <Text style={styles.cell}>{material.quantity}</Text>
//         </View>
//       ))}
//     </View>
//   );

//   // Main UI
//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="orange" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {selectedShipmentId ? (
//         // Deliveries View
//         <View>
//           <Text style={styles.tableHeader}>Deliveries for Shipment {selectedShipmentId}</Text>
//           <View style={[styles.row, styles.headerRow]}>
//             <Text style={[styles.cell, styles.headerCell]}>Material Name</Text>
//             <Text style={[styles.cell, styles.headerCell]}>Quantity</Text>
//           </View>
//           <FlatList
//             data={deliveries}
//             renderItem={renderDelivery}
//             keyExtractor={(item) => item.id}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefreshDeliveries}
//               />
//             }
//             ListEmptyComponent={<Text style={styles.emptyText}>No deliveries found.</Text>}
//           />
//           <TouchableOpacity style={styles.backButton} onPress={() => setSelectedShipmentId(null)}>
//             <Text style={styles.backButtonText}>Back to Shipments</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         // Shipments View
//         <View>
//              <View style={styles.topSection}>
//                         <TouchableOpacity onPress={() => router.back()}>
//                           <Text style={{ fontSize: 20, fontWeight: "bold" }}>Track Shipment</Text>
//                         </TouchableOpacity>
//                         <Image
//                           source={require("../../assets/images/Back.png")}
//                           style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//                         />
//                       </View>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Enter Shipment ID..."
//             value={searchText}
//             onChangeText={handleSearch}
//           />
//           {/* <Text style={styles.tableHeader}>Shipments</Text> */}
//           <View style={[styles.row, styles.headerRow]}>
//             <Text style={[styles.cell, styles.headerCell]}>Shipment ID</Text>
//             <Text style={[styles.cell, styles.headerCell]}>Driver Name</Text>
//             <Text style={[styles.cell, styles.headerCell]}>Transporter</Text>
//             <Text style={[styles.cell, styles.headerCell]}>Vehicle No</Text>
//             <Text style={[styles.cell, styles.headerCell]}>Status</Text>
//           </View>
//           <FlatList
//             data={filteredShipments}
//             renderItem={renderShipment}
//             keyExtractor={(item) => item.id}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefreshShipments}
//               />
//             }
//             ListEmptyComponent={<Text style={styles.emptyText}>No shipments found.</Text>}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#fff",
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   tableHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginVertical: 5,
//   },
//   searchInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 5,
//     padding: 8,
//     marginBottom: 10,
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     paddingVertical: 8,
//   },
//   headerRow: {
//     backgroundColor: "#f0f0f0",
//   },
//   headerCell: {
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   cell: {
//     flex: 1,
//     textAlign: "center",
//     marginHorizontal: 5,
//   },
//   backButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: "black",
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   backButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#888",
//   },
//   topSection: {
//     width: "100%",
//     height: "10%",
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     marginTop:30,
//     marginBottom: 10
//   },
// });

// export default TrackShipment;


import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  RefreshControl,
  Image,
  ScrollView,
  SafeAreaView
} from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc, query } from "firebase/firestore";
import { router } from "expo-router";
import { app } from "../firebase"; 

const db = getFirestore(app);

type Shipment = {
  id: string;
  driverName: string;
  transporter: string;
  vehicleNo: string;
  mobileNumber: string;
  statusId: number;
  createdAt: string;
};

type Material = {
  id: string;
  name: string;
  quantity: number;
};

type Delivery = {
  id: string;
  materials: Material[];
};

const statusMap = {
  0: { text: "Pending", color: "#FFA500" },
  1: { text: "Loaded", color: "#4169E1" },
  2: { text: "Dispatched", color: "#1E90FF" },
  3: { text: "In Transit", color: "#9370DB" },
  4: { text: "Delivered", color: "#32CD32" }
};

const TrackShipment = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "Shipment"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shipment[];
      setShipments(data);
      setFilteredShipments(data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (shipmentId: string) => {
    setLoading(true);
    try {
      const deliverySnapshot = await getDocs(collection(db, "Shipment", shipmentId, "deliveries"));
      const deliveryData = deliverySnapshot.docs.map(doc => ({
        id: doc.id,
        materials: doc.data().materials || [],
      })) as Delivery[];
      setDeliveries(deliveryData);
      setSelectedShipmentId(shipmentId);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const onRefreshShipments = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const onRefreshDeliveries = async () => {
    setRefreshing(true);
    if (selectedShipmentId) {
      await fetchDeliveries(selectedShipmentId);
    }
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredShipments(shipments);
    } else {
      const filtered = shipments.filter((shipment) =>
        shipment.id.toLowerCase().includes(text.toLowerCase()) ||
        shipment.driverName.toLowerCase().includes(text.toLowerCase()) ||
        shipment.vehicleNo.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredShipments(filtered);
    }
  };

  const renderStatus = (statusId: number) => {
    const status = statusMap[statusId as keyof typeof statusMap] || { text: "Unknown", color: "#888" };
    return (
      <View style={[styles.statusContainer, { backgroundColor: status.color }]}>
        <Text style={styles.statusText}>{status.text}</Text>
      </View>
    );
  };

  const renderShipment = ({ item }: { item: Shipment }) => (
    <TouchableOpacity
      style={styles.shipmentCard}
      onPress={() => fetchDeliveries(item.id)}
    >
      <View style={styles.shipmentHeader}>
        <Text style={styles.shipmentId}>Shipment #{item.id}</Text>
        {renderStatus(item.statusId)}
      </View>
      <View style={styles.shipmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Driver:</Text>
          <Text style={styles.detailValue}>{item.driverName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transporter:</Text>
          <Text style={styles.detailValue}>{item.transporter}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle:</Text>
          <Text style={styles.detailValue}>{item.vehicleNo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact:</Text>
          <Text style={styles.detailValue}>{item.mobileNumber}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDelivery = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryCard}>
      <Text style={styles.deliveryHeader}>Delivery #{item.id}</Text>
      <View style={styles.materialsHeader}>
        <Text style={[styles.materialCell, styles.headerCell]}>Material</Text>
        <Text style={[styles.materialCell, styles.headerCell]}>Quantity</Text>
      </View>
      {item.materials.map((material) => (
        <View style={styles.materialRow} key={material.id}>
          <Text style={styles.materialCell}>{material.name}</Text>
          <Text style={styles.materialCell}>{material.quantity}</Text>
        </View>
      ))}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedShipmentId ? (
          <ScrollView 
            style={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshDeliveries}
              />
            }
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelectedShipmentId(null)}>
                <Image
                  source={require("../../assets/images/Back.png")}
                  resizeMode="contain"
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Shipment Details</Text>
            </View>
            
            <Text style={styles.shipmentTitle}>Shipment #{selectedShipmentId}</Text>
            
            <FlatList
              data={deliveries}
              renderItem={renderDelivery}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No deliveries found for this shipment</Text>
              }
            />
          </ScrollView>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshShipments}
              />
            }
          >
            <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Image
                  source={require("../../assets/images/Back.png")}
                  resizeMode="contain"
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Track Shipments</Text>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search shipments..."
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={handleSearch}
              />
              <Image
                source={require("../../assets/images/search.png")}
                style={styles.searchIcon}
              />
            </View>
            
            <FlatList
              data={filteredShipments}
              renderItem={renderShipment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require("../../assets/images/empty.png")}
                    style={styles.emptyImage}
                  />
                  <Text style={styles.emptyText}>No shipments found</Text>
                </View>
              }
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C3E50",
  },
  shipmentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 14,
    width: 20,
    height: 20,
    tintColor: "#888",
  },
  shipmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 12,
  },
  shipmentId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  statusContainer: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  shipmentDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "500",
  },
  deliveryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 12,
  },
  materialsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 8,
    marginBottom: 8,
  },
  materialRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  materialCell: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
  },
  headerCell: {
    fontWeight: "600",
    color: "#7F8C8D",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
  },
});

export default TrackShipment;