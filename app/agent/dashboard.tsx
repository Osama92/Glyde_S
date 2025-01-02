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
  StatusBar
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

const collections = ["deliverydriver", "customer", "fieldagent", "transporter"];

export default function Dashboard() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get phone number from AsyncStorage
        const phoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!phoneNumber) {
          Alert.alert("Error", "No phone number found. Please log in again.");
          return;
        }

        // Search through collections to find the user
        for (const colName of collections) {
          const userQuery = query(
            collection(db, colName),
            where("phoneNumber", "==", phoneNumber)
          );
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setDisplayName(userDoc.name || "Unknown User");
            setCollectionName(colName);
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
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.TopNav}>
        <View style={styles.leftNav}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: "50%",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/Aisha5.jpeg")}
              resizeMode="cover"
              style={{ width: 40, height: 40, borderRadius: 20, margin: 5 }}
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Hi, {displayName}
              </Text>
              <TouchableOpacity>
                <Text>Edit my Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "50%",
              flexDirection: "row",
              alignItems: "center",
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
                source={require("../../assets/images/Pin.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "600", marginBottom: 3 }}>
                Your location
              </Text>
              <TouchableOpacity>
                <Text>Work</Text>
              </TouchableOpacity>
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
              <TouchableOpacity>
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
      {/*Scroll View will live here */}
      <ScrollView style={{ width: "100%", height: "70%"}}>
        <View style={{flexDirection:'row', height: 60, width: '100%', marginBottom: 10, justifyContent:'space-between', borderBottomWidth: 1, borderBottomColor: 'lightgrey'}}>
            <View style={{width:'40%',height:'100%'}}>
                <Text style={{fontSize: 20}}>Fleet Size</Text>
                <Text style={{fontSize: 20}}>13</Text>
            </View>
            <View style={{width:'40%',height:'100%'}}>
                <Text style={{fontSize: 20, marginBottom: 10}}>Shipping Point</Text>
                <Text>Shipping Point here</Text>
            </View>
            <View style={{width:'15%',height:'100%',justifyContent:'center', alignItems:'center'}}>
                <Image source={require('../../assets/images/edit.png')} resizeMode="contain" style={{width: 30, height: 30}}/>
            </View>
        </View>
        <View
          style={{
            width: "100%",
            height: 300,
            backgroundColor: "#f4f4f4",
            borderRadius: 20,
            flexDirection: 'row',
            alignItems:'flex-start'
          }}
        >
          <View style={{alignItems:'center',justifyContent:'center', width: 70, margin:10}}>
          <TouchableOpacity style={{width: 60, height:60, borderRadius: 30, backgroundColor:'lightgrey', justifyContent:'center', alignItems:'center'}} onPress={()=>router.push('/agent/shipment')}>
            <Image source={require('../../assets/images/Create.png')} style={{width: 30, height:30}}/>
          </TouchableOpacity>
          <Text style={{textAlign:'center'}}>Create Shipment</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight:10,
    backgroundColor:'#fff'
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
    marginTop:20
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
});
