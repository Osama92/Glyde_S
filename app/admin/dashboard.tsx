import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";

const db = getFirestore(app);
const { width, height } = Dimensions.get('window');

interface ShippingPointCounterProps {
  shippingPoint: string;
}

const collections = ["deliverydriver", "customer", "fieldagent", "transporter", "Admin"];

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [shippingPoint, setShippingPoint] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Animation setup
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
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
            setShippingPoint(userDoc.LoadingPoint || "Not Defined")
            setCollectionName(colName);
            const encodedID = encodeURIComponent(userDoc.uid);
            setId(encodedID)
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
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.loadingContainer, { transform: [{ rotate: spin }] }]}>
          <Image
            source={require('../../assets/images/Glyde.png')}
            style={styles.loadingLogo}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.TopNav}>
        <View style={styles.leftNav}>
          <View style={{ flexDirection: "row", width: "100%", height: "50%", alignItems: "center" }}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/images/icon.png')}
              resizeMode="cover"
              style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Hi, {displayName}
              </Text>
              <TouchableOpacity onPress={()=>router.push(`/agent/editProfile?collectionName=${collectionName}&id=${id}`)}>
                <Text>Edit my Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: "100%", height: "50%", flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/Pin.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text>Kings Landing</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightNav}>
          <View style={styles.navItem}>
            <View style={styles.iconContainer}>
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
          
          <View style={styles.navItem}>
            <View style={[styles.iconContainer, { backgroundColor: "#F6984C" }]}>
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
      
      <ScrollView style={{ width: "100%", height: "70%"}}>
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <TouchableOpacity style={styles.menuIcon} onPress={()=>router.push("/admin/addUser")}>
              <Image source={require('../../assets/images/userIcon.png')} style={{width: 30, height:30}}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Create User</Text>
          </View>
          
          <View style={styles.menuItem}>
            <TouchableOpacity style={styles.menuIcon} onPress={()=>router.push('/admin/approve_onboard')}>
              <Image source={require('../../assets/images/cVan.png')} style={{width: 30, height:30}}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Vehicle Approval</Text>
          </View>

          <View style={styles.menuItem}>
            <TouchableOpacity style={styles.menuIcon} onPress={()=>router.push('/admin/createMaterial')}>
              <Image source={require('../../assets/images/material.png')} style={{width: 30, height:30}}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Create Material</Text>
          </View>

          <View style={styles.menuItem}>
            <TouchableOpacity style={styles.menuIcon} onPress={()=>router.push('/admin/invoice')}>
              <Image source={require('../../assets/images/invoice.png')} style={{width: 30, height:30}}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Create Invoice</Text>
          </View>
          <View style={styles.menuItem}>
            <TouchableOpacity style={styles.menuIcon} onPress={()=>router.push('/admin/addRoute')}>
              <Image source={require('../../assets/images/routing.png')} style={{width: 30, height:30}}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Create Invoice</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
  },
  TopNav: {
    flexDirection: "row",
    width: "100%",
    height: 130,
    justifyContent: "space-between",
    alignItems: 'flex-end',
    marginTop: 20
  },
  leftNav: {
    backgroundColor: "#f4f4f4",
    width: "48%",
    height: "80%",
    borderRadius: 30,
    marginBottom: 10
  },
  rightNav: {
    width: "48%",
    height: "80%",
    borderRadius: 30,
    justifyContent: "space-between",
    marginBottom: 10
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#EDEBEB",
    borderRadius: 20,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  navItem: {
    flexDirection: "row",
    width: "100%",
    height: "46%",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: 30,
  },
  menuContainer: {
    width: "100%",
    flexWrap: "wrap",
    height: 400,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    margin: 10
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  menuText: {
    textAlign: 'center'
  }
});