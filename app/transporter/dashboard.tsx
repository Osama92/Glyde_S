import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const db = getFirestore(app);

const TransporterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [transporterName, setTransporterName] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedProfileImage = await AsyncStorage.getItem("imageUrl");
        
        if (!storedPhoneNumber) {
          console.error("No phone number found");
          return;
        }
        
        setPhoneNumber(storedPhoneNumber);
        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch Transporter Data
  const fetchTransporterData = useCallback(async () => {
    if (!phoneNumber) return;

    try {
      setLoading(true);
      const transporterRef = collection(db, "transporter");
      const transporterSnapshot = await getDocs(transporterRef);
      let foundTransporter: any = null;

      transporterSnapshot.forEach((doc) => {
        if (doc.id.startsWith(`${phoneNumber}_`)) {
          foundTransporter = doc.id;
        }
      });
      

      if (!foundTransporter) {
        console.error("Transporter not found");
        setLoading(false);
        return;
      }

      setTransporterName(foundTransporter);
      setProfileImage(transporterSnapshot.docs[0].data().imageUrl);

      // Fetch Vehicles inside transporter
      const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
      const vehicleSnapshot = await getDocs(vehicleRef);
      const vehicleList = vehicleSnapshot.docs.map((doc) => doc.id);

      setVehicles(vehicleList);

      // Calculate total trips
      let tripSum = 0;
      for (const vehicle of vehicleList) {
        const shipmentRef = collection(db, "Shipment");
        const shipmentQuery = query(shipmentRef, where("vehicleNo", "==", vehicle));
        const snapshot = await getDocs(shipmentQuery);
        tripSum += snapshot.size;
      }
      setTotalTrips(tripSum);
    } catch (error) {
      console.error("Error fetching transporter data:", error);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber) {
      fetchTransporterData();
    }
  }, [phoneNumber, fetchTransporterData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransporterData().finally(() => setRefreshing(false));
  }, [fetchTransporterData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingText}>
            Hello {transporterName ? transporterName.split("_")[1] : 'User'},
          </Text>
          <Text style={styles.timeGreeting}>{getGreeting()}</Text>
        </View>
        
        <TouchableOpacity onPress={() => router.push('/transporter/editProfile')}>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialIcons name="person" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Navigation Tabs */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {["Overview", "Shipping", "Tracking", "Invoice", "Manage"].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.tabButton}
            onPress={() => router.push(`/transporter/${item.toLowerCase()}?transporterName=${transporterName}`)}
          >
            <Text style={styles.tabButtonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['orange']}
            tintColor="orange"
          />
        }
      >
        {/* Delivery Fleets Card */}
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Delivery Fleets</Text>
              <Text style={styles.cardSubtitle}>Vehicles in your fleet</Text>
            </View>
            <TouchableOpacity 
              style={styles.cardActionButton}
              onPress={() => router.push('/transporter/addNew')}
            >
              <Ionicons name="add-circle" size={24} color="orange" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardStats}>
              <Text style={styles.cardNumber}>{vehicles.length}</Text>
              <Text style={styles.cardLabel}>Fleets</Text>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View positions</Text>
                <MaterialIcons name="chevron-right" size={16} color="orange" />
              </TouchableOpacity>
            </View>
            <Image 
              source={require('../../assets/images/Van01.png')} 
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
        
        {/* Total Shipments Card */}
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Total Shipments</Text>
              <Text style={styles.cardSubtitle}>Summary of shipments</Text>
            </View>
            <TouchableOpacity 
              style={styles.cardActionButton}
              onPress={() => router.push('/transporter/shipping')}
            >
              <FontAwesome5 name="chart-line" size={20} color="orange" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardStats}>
              <Text style={styles.cardNumber}>{totalTrips}</Text>
              <Text style={styles.cardLabel}>Shipments</Text>
            </View>
            <Image 
              source={require('../../assets/images/trips.png')} 
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
        
        {/* Analytics Card */}
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Analytics</Text>
              <Text style={styles.cardSubtitle}>Delivery & truck performance</Text>
            </View>
            <TouchableOpacity 
              style={styles.cardActionButton}
              onPress={() => router.push(`/transporter/analytics?transporterName=${transporterName?.split("_")[1]}`)}
            >
              <Ionicons name="analytics" size={20} color="orange" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.cardContent, {justifyContent: 'center'}]}>
            <Image 
              source={require('../../assets/images/analytics.png')} 
              style={[styles.cardImage, {width: '100%', height: 150}]}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  timeGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'orange',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingBottom: 10,
    height: 70,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    color: 'orange',
    fontWeight: '500',
  },
  contentContainer: {
    //flex: 1,
    marginTop: 10,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'orange',
  },
  cardLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: -5,
  },
  cardImage: {
    width: 150,
    height: 120,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewButtonText: {
    color: 'orange',
    fontWeight: '500',
    marginRight: 5,
  },
});

export default TransporterScreen;