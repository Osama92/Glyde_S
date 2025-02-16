import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  onSnapshot,
  query,
  where,
  updateDoc,
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps"; // Native Maps
import { GoogleMap, LoadScript, Marker as WebMarker, Polyline as WebPolyline } from "@react-google-maps/api"; // Web Maps
import * as Location from "expo-location";

const db = getFirestore(app);
const MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w"; // Replace with your Google Maps API key

type Delivery = {
  id: string;
  customer: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

const NotificationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [deliverDriver, setDeliverDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRedDot, setShowRedDot] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState<boolean>(false);
  const [deliveryOrder, setDeliveryOrder] = useState<Delivery[]>([]);
  const [showDeliveries, setShowDeliveries] = useState(false); // Toggle for showing/hiding deliveries
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]); // Polyline coordinates
  const [travelTime, setTravelTime] = useState<string | null>(null); // Travel time to destination
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null); // Selected delivery for polyline
  const [loadingDirections, setLoadingDirections] = useState(false); // Loading state for directions

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch phone number: ${error.message}`);
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchDeliverDriver = async () => {
      try {
        const usersQuery = query(collection(db, "deliverydriver"), where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setDeliverDriver(userData.phoneNumber || null);
        }
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch deliverDriver: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliverDriver();
  }, [phoneNumber]);

  useEffect(() => {
    if (!deliverDriver) return;

    const shipmentsQuery = query(
      collection(db, "Shipment"),
      where("mobileNumber", "==", deliverDriver)
    );

    const unsubscribe = onSnapshot(shipmentsQuery, (querySnapshot) => {
      let activeShipment: any = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.statusId === 2 || data.statusId === 3) {
          activeShipment = { id: doc.id, ...data };
        }
      });

      if (activeShipment) {
        setShipmentId(activeShipment.id);
        setShipmentData(activeShipment);
        setShowRedDot(true);
        fetchDeliveryOrder(activeShipment.id); // Fetch deliveries when shipment is found
      } else {
        setShowRedDot(false);
      }
    });

    return () => unsubscribe();
  }, [deliverDriver]);

  const fetchDeliveryOrder = async (shipmentId: string) => {
    try {
      const deliveriesQuery = query(collection(db, "Shipment", shipmentId, "deliveries"));
      const querySnapshot = await getDocs(deliveriesQuery);
      const deliveries: Delivery[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        customer: doc.data().customer,
        address: doc.data().address,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
      }));
      setDeliveryOrder(deliveries);
    } catch (error: any) {
      Alert.alert("Error", `Failed to fetch deliveries: ${error.message}`);
    }
  };

  const fetchDirections = async (origin: Coordinate, destination: Delivery) => {
    setLoadingDirections(true); // Start loading
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points); // Decode polyline points
        setRouteCoordinates(decodedPoints);

        const duration = data.routes[0].legs[0].duration.text;
        setTravelTime(duration);
      } else {
        console.error("Directions API Error:", data);
        Alert.alert("Error", "Failed to fetch directions. Please check your API key and coordinates.");
      }
    } catch (error: any) {
      console.error("Fetch Directions Error:", error);
      Alert.alert("Error", `Failed to fetch directions: ${error.message}`);
    } finally {
      setLoadingDirections(false); // Stop loading
    }
  };

  const decodePolyline = (encoded: string): Coordinate[] => {
    const points: Coordinate[] = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (Platform.OS === "web") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              Alert.alert("Error", `Failed to get location: ${error.message}`);
            }
          );
        } else {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Location permission denied.");
            Alert.alert("Error", "Permission to access location was denied.");
            return;
          }

          let currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } catch (error: any) {
        Alert.alert("Error", `Failed to fetch location: ${error.message}`);
      }
    };
    fetchLocation();
  }, []);

  const handleAccept = async () => {
    if (!shipmentId) return;
    try {
      const shipmentDocRef = doc(db, "Shipment", shipmentId);
      await updateDoc(shipmentDocRef, { statusId: 3 });
      Alert.alert("Success", "Shipment accepted.");
      setIsModalVisible(false);
      setShowRedDot(false);
      startTracking();
      fetchDeliveryOrder(shipmentId); // Refresh deliveries after accepting shipment
    } catch (error: any) {
      Alert.alert("Error", `Failed to update shipment: ${error.message}`);
    }
  };

  const handleDecline = () => {
    Alert.alert("Declined", "You have declined the shipment.");
    setIsModalVisible(false);
  };

  const startTracking = async () => {
    setTracking(true);
    await updateCurrentLocation();
    setInterval(updateCurrentLocation, 10 * 60 * 1000); // Update every 10 minutes
  };

  const updateCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: new Date().toISOString(),
      };
      setLocation(newLocation);

      if (!shipmentId) return;

      await setDoc(doc(db, "currentLocation", shipmentId), {
        shipmentId,
        location: newLocation,
      }, { merge: true });
    } catch (error: any) {
      Alert.alert("Error", `Failed to update location: ${error.message}`);
    }
  };

  const handleDeliveryTap = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    if (location) {
      fetchDirections(location, delivery); // Fetch directions to the selected delivery
    }
  };

  if (loading || !location) {
    return (
      <View>
        <ActivityIndicator size="small" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-Screen Map */}
      {Platform.OS === "web" ? (
        <LoadScript googleMapsApiKey={MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={styles.map}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
          >
            <WebMarker position={{ lat: location.latitude, lng: location.longitude }} />
            {showDeliveries && deliveryOrder.map((delivery) => (
              <WebMarker
                key={delivery.id}
                position={{ lat: delivery.latitude, lng: delivery.longitude }}
                label={delivery.address}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker for destinations
                }}
              />
            ))}
            {/* Polyline for directions */}
            {routeCoordinates.length > 0 && (
              <WebPolyline
                path={routeCoordinates.map((coord) => ({ lat: coord.latitude, lng: coord.longitude }))}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} />
          {showDeliveries && deliveryOrder.map((delivery) => (
            <Marker
              key={delivery.id}
              coordinate={{ latitude: delivery.latitude, longitude: delivery.longitude }}
              title={delivery.address}
              pinColor="blue" // Blue marker for destinations
            />
          ))}
          {/* Polyline for directions */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FF0000"
              strokeWidth={2}
            />
          )}
        </MapView>
      )}

      {/* Show Optimized Delivery Order View and Toggle Only When Shipment is Accepted */}
      {shipmentData?.statusId === 3 && (
        <>
          {/* Optimized Delivery Order View at the Bottom */}
          {showDeliveries && (
            <View style={styles.deliveryListContainer}>
              <Text style={styles.deliveryListHeader}>Optimized Delivery Order:</Text>
              <ScrollView style={styles.deliveryList}>
                {deliveryOrder.map((delivery, index) => (
                  <TouchableOpacity
                    key={delivery.id}
                    style={styles.deliveryItem}
                    onPress={() => handleDeliveryTap(delivery)}
                  >
                    <Text>{index + 1}. {delivery.customer} - {delivery.address}</Text>
                    {selectedDelivery?.id === delivery.id && travelTime && (
                      <Text style={styles.travelTimeText}>Travel Time: {travelTime}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Show/Hide Deliveries Button */}
          <TouchableOpacity
            style={styles.showDeliveriesButton}
            onPress={() => setShowDeliveries(!showDeliveries)}
          >
            <Text style={styles.showDeliveriesButtonText}>
              {showDeliveries ? "Hide Deliveries" : "Show Deliveries"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Loading Indicator for Directions */}
      {loadingDirections && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading directions...</Text>
        </View>
      )}

      {/* Notification Icon */}
      <TouchableOpacity style={styles.notificationIcon} onPress={() => shipmentId && setIsModalVisible(true)}>
        <Image source={require("../../assets/images/notifications.png")} style={{ width: 40, height: 40 }} />
        {showRedDot && <View style={styles.redDot} />}
      </TouchableOpacity>

      {/* Modal for Shipment Details */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Shipment Number: <Text style={{ fontWeight: "bold" }}>{shipmentData?.id}</Text></Text>
          <Text>Pick-up point: {shipmentData?.route1}</Text>
          <Text>Destination: {shipmentData?.route2}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: StyleSheet.absoluteFillObject,
  notificationIcon: { position: "absolute", top: 50, right: 20 },
  redDot: { width: 10, height: 10, backgroundColor: "red", borderRadius: 5, position: "absolute", top: 0, right: 0 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  buttonContainer: { flexDirection: "row", gap: 20 },
  rejectButton: { backgroundColor: "red", padding: 15, borderRadius: 10 },
  acceptButton: { backgroundColor: "green", padding: 15, borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
  deliveryListContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
  deliveryListHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  deliveryList: { maxHeight: 150 },
  deliveryItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  travelTimeText: { fontSize: 14, color: "gray", marginTop: 5 },
  showDeliveriesButton: {
    position: "absolute",
    bottom: 200,
    right: 20,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  showDeliveriesButtonText: { color: "white", fontWeight: "bold" },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
  }

    })

 export default NotificationScreen;