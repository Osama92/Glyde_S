import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import StepIndicator from "react-native-step-indicator";
import { app } from "../firebase";
import {router} from 'expo-router';

const db = getFirestore(app);

const collections = ["deliveryDriver", "customer", "fieldAgent", "transporter"];
const labels = ["Loaded", "Dispatched", "In-Transit", "Delivered"];

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
   const [profileImage, setProfileImage] = useState<string | null>(null);
   const [collectionName, setCollectionName] = useState<string | null>(null);
   const [id, setId] = useState<string | null>(null);

  const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#F6984C",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "#F6984C",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#F6984C",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#F6984C",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#F6984C",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 13,
  currentStepLabelColor: "#fe7013",
};

  const fetchUserDetails = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (!phoneNumber) {
        Alert.alert("Error", "No phone number found. Please log in again.");
        return;
      }

      for (const colName of collections) {
        const userQuery = query(
          collection(db, colName),
          where("phoneNumber", "==", phoneNumber)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          
          const userDoc = querySnapshot.docs[0].data();
          setDisplayName(userDoc.name || "Unknown User");
          setProfileImage(userDoc.imageUrl || null);
          setCollectionName(colName);
            const encodedID = encodeURIComponent(userDoc.uid);
            setId(encodedID)
          break;
        }
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch user detail: ${error.message}`);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (displayName) {
      fetchDeliveryDetails();
    }
  }, [displayName]);

  const fetchDeliveryDetails = async () => {
    if (!displayName) return;

    try {
      const shipmentQuery = query(collection(db, "Shipment"));
      const shipmentSnapshot = await getDocs(shipmentQuery);

      const pending: any[] = [];
      const completed: any[] = [];

      for (const shipmentDoc of shipmentSnapshot.docs) {
        const shipmentData = shipmentDoc.data();

        const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
        const deliveriesQuery = query(
          deliveriesRef,
          where("customer", "==", displayName)
          
        );

        const deliveriesSnapshot = await getDocs(deliveriesQuery);

        

        deliveriesSnapshot.forEach((doc) => {
          const delivery:any = { id: doc.id, ...doc.data(), shipmentId: shipmentDoc.id };
          if (delivery.statusId === 1||delivery.statusId === 2||delivery.statusId === 3) {
            pending.push(delivery);
          } else if (delivery.statusId === 4) {
            completed.push(delivery);
          }
        });
      }

      setPendingDeliveries(pending);
      setCompletedDeliveries(completed);
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch delivery details: ${error.message}`);
    }
  };

  const markAsReceived = async (delivery: any) => {
    try {
      const deliveryRef = doc(
        db,
        "Shipment",
        delivery.shipmentId,
        "deliveries",
        delivery.id
      );
      await updateDoc(deliveryRef, { statusId: 4 });

      setPendingDeliveries((prev) =>
        prev.filter((item) => item.id !== delivery.id)
      );
      setCompletedDeliveries((prev) => [delivery, ...prev]);
    } catch (error: any) {
      Alert.alert("Error", `Failed to update delivery: ${error.message}`);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await fetchUserDetails();
    await fetchDeliveryDetails();
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    await fetchUserDetails();
    await fetchDeliveryDetails();
  }, []);

    const renderDeliveryItem = ({ item }: { item: any }, isPending: boolean) => (
    <View style={styles.deliveryItem}>
      <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={item.statusId}
        labels={labels}
        stepCount={4}
      />
      {isPending && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => markAsReceived(item)}
        >
          <Text style={styles.buttonText}>Delivered</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCompletedItem = ({ item }: { item: any }, isPending: boolean) => (
    <View style={styles.deliveryItem}>
      <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
      {/* {isPending && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => markAsReceived(item)}
        >
          <Text style={styles.buttonText}>Received</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.TopNav}>
              <View style={styles.leftNav}>
                <View style={{flexDirection: "row",width: "100%",height: "50%",alignItems: "center"}}>
                  <Image source={profileImage ? { uri: profileImage } : require('../../assets/images/icon.png')} resizeMode="cover" style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}/>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontWeight: "600", marginBottom: 3 }}>Hi, {displayName}</Text>
                    <TouchableOpacity onPress={()=>router.push(`/customer/editProfile?collectionName=${collectionName}&id=${id}`)}>
                      <Text>Edit my Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{width: "100%",height: "50%",flexDirection: "row",alignItems: "center"}}>
                  <View style={{ width: 40, height: 40, backgroundColor: "#EDEBEB", borderRadius: 20, margin: 5, alignItems: "center", justifyContent: "center" }}>
                    <Image source={require("../../assets/images/Pin.png")} resizeMode="cover" style={{ width: 20, height: 20 }}/>
                  </View>
                  <View style={{ flexDirection: "column" }}>
                  <Text>location</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightNav}>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    height: "46%",
                    alignItems: "center",
                    backgroundColor: "#f4f4f4",
                    borderRadius: 30,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EDEBEB",
                      borderRadius: 20,
                      margin: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={require("../../assets/images/Trackk.png")}
                      resizeMode="cover"
                      style={{ width: 20, height: 20 }}
                    />
                  </View>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                      Track Shipment
                    </Text>
                    <TouchableOpacity onPress={()=>router.push('/agent/trackShipment')}>
                      <Text>Track by ID</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View
                  style={{
                    width: "100%",
                    height: "46%",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f4f4f4",
                    borderRadius: 30,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#F6984C",
                      borderRadius: 20,
                      margin: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={require("../../assets/images/Support.png")}
                      resizeMode="cover"
                      style={{ width: 20, height: 20}}
                    />
                  </View>
                  <View style={{ flexDirection: "column" }}>
                    <TouchableOpacity>
                      <Text>Support Desk</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
    </View>
    <View style={{width:'100%'}}>
      <Text style={styles.sectionTitle}>Incoming Deliveries</Text>
    <FlatList
       data={pendingDeliveries}
       keyExtractor={(item) => `${item.shipmentId}-${item.id}`}
       renderItem={(item) => renderDeliveryItem(item, true)}
       refreshControl={
         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
       }
      />
      <Text style={styles.sectionTitle}>Completed Transactions</Text>
      <FlatList
        data={completedDeliveries}
        keyExtractor={(item) => `${item.shipmentId}-${item.id}`}
        renderItem={(item) => renderCompletedItem(item, false)}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    padding:10,
    backgroundColor:'#fff',
    width:'100%',
    height:'100%'

  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  TopNav: {
    flexDirection: "row",
    width: "100%",
    height: 130,
    justifyContent: "space-between",
    alignItems: 'flex-end',
    marginTop:10
  },
  leftNav: {
    backgroundColor: "#f4f4f4",
    width: "48%",
    height: "80%",
    borderRadius: 30,
    marginBottom:10
  },
  rightNav: {
    //backgroundColor:'#f4f4f4',
    width: "48%",
    height: "80%",
    borderRadius: 30,
    justifyContent: "space-between",
    marginBottom:10
  },
  sectionTitle: { 
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop:10
    },
  deliveryNumber: { 
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  deliveryItem: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width:'100%',
    height: 200,
  },
  button: {
    backgroundColor: "#F6984C",
    padding: 10,
    borderRadius: 5,
    marginTop:30
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  
});
