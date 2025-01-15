import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Button,
  ActivityIndicator,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onSnapshot, query, where, updateDoc, getFirestore, collection, doc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const NotificationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState(""); // Shipment with statusId == 2
  const [shipmentDisplayName, setShipmentDisplayName] = useState<string>("");

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
        console.log("Fetched phoneNumber:", storedPhoneNumber);
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
      }
    };

    fetchPhoneNumber();
  }, []);

  // Listen for real-time shipment updates
  useEffect(() => {
    if (!phoneNumber) return;

    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", phoneNumber),
      where("statusId", "==", 2)
    );

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const shipment = querySnapshot.docs[0]; // Assuming one shipment per user
        setShipmentId(shipment.id);
        setShipmentDisplayName(shipment.data().mobileNumber);
        setShowRedDot(true);
        console.log("Shipment found:", shipment.id, shipment.data());
      } else {
        setShowRedDot(false);
        setShipmentId("");
        console.log("No shipments found for phoneNumber:", phoneNumber);
      }
      setLoading(false); // Mark loading as false once the query executes
    });

    return () => unsubscribe();
  }, [phoneNumber]);

  const handleAccept = async () => {
    try {
      if (shipmentId) {
        const shipmentDocRef = doc(db, "Shipment", shipmentId);
        await updateDoc(shipmentDocRef, { statusId: 3 });
        Alert.alert("Success", "Shipment accepted.");
        setIsModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to update shipment: ${error.message}`);
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "You have declined the shipment.");
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => shipmentId && setIsModalVisible(true)}
      >
        <View style={styles.icon}>
          {showRedDot && <View style={styles.redDot} />}
        </View>
      </TouchableOpacity>
      {shipmentDisplayName ? <Text>📦 {shipmentDisplayName}</Text> : <Text>No shipments available.</Text>}

      {/* Modal for Accept/Decline */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Do you accept this shipment?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={handleAccept} />
            <Button title="Decline" onPress={handleDecline} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
  },
  icon: {
    width: 50,
    height: 50,
    backgroundColor: "black",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    position: "absolute",
    top: 5,
    right: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
});

export default NotificationScreen;
