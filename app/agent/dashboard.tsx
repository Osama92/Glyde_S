import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Easing
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { router, useLocalSearchParams } from "expo-router";
import CheckValueInCollection from "../../app/count";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const db = getFirestore(app);

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [shippingPoint, setShippingPoint] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!phoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }

        const collections = ["deliverydriver", "customer", "fieldagent", "transporter"];
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
            setShippingPoint(userDoc.LoadingPoint || "Not Defined");
            setCollectionName(colName);
            setId(encodeURIComponent(userDoc.uid));
            break;
          }
        }
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        Alert.alert("Error", `Failed to fetch user details: ${error.message}`);
      }
    };

    fetchUserDetails();
    
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F6984C" />
      </View>
    );
  }

  const ActionCard = ({ title, icon, color, onPress }) => (
    <Animated.View 
      style={[
        styles.actionCard, 
        { backgroundColor: color },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity style={styles.cardTouchable} onPress={onPress}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {icon}
        </View>
        {/* <Image source={image} style={styles.cardImage} resizeMode="contain" /> */}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f9f9f9', '#ffffff']} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => router.push(`/agent/editProfile?collectionName=${collectionName}&id=${id}`)}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/images/icon.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.profileText}>
            <Text style={styles.greeting}>Hello, {displayName}</Text>
            <View style={styles.locationBadge}>
              <MaterialIcons name="location-on" size={16} color="#F6984C" />
              <Text style={styles.locationText}>{shippingPoint}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/agent/trackShipment')}
          >
            <Feather name="search" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Feather name="help-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Fleet Size</Text>
          <CheckValueInCollection searchValue={shippingPoint} />
          <MaterialIcons name="local-shipping" size={24} color="#F6984C" style={styles.statIcon} />
        </View>
        
        <TouchableOpacity 
          style={[styles.statCard, styles.editButton]}
          onPress={() => router.push(`/agent/manage?shippingPoint=${shippingPoint}`)}
        >
          <Feather name="edit-3" size={20} color="#F6984C" />
        </TouchableOpacity>
      </View>

      {/* Main Actions */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ActionCard
          title="Create Shipment"
          icon={<FontAwesome5 name="shipping-fast" size={42} color="#fff" />}
          color="#6C63FF"
          onPress={() => router.push(`/agent/createShipment?originPoint=${shippingPoint}`)}
        />
        
        <ActionCard
          title="Create Delivery"
          icon={<MaterialIcons name="delivery-dining" size={42} color="#fff" />}
          color="#FF6584"
          onPress={() => router.push(`/agent/createDelivery?originPoint=${shippingPoint}`)}
        />
        
        <ActionCard
          title="Shipment Status"
          icon={<MaterialIcons name="assessment" size={42} color="#fff" />}
          color="#20C3AF"
          onPress={() => router.push('/agent/shipmentStatus')}
        />
        
        {/* Additional Feature Card */}
        <Animated.View 
          style={[
            styles.featureCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.featureTitle}>Need Help?</Text>
          <Text style={styles.featureText}>Our support team is available 24/7 to assist you</Text>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#F6984C',
  },
  profileText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'rgba(246, 152, 76, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#F6984C',
    marginLeft: 5,
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6984C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  editButton: {
    maxWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  actionCard: {
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTouchable: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardContent: {
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  cardImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  featureButton: {
    backgroundColor: '#F6984C',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  featureButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});