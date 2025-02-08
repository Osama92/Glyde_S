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
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart } from "react-native-gifted-charts";

const db = getFirestore(app);

const TransporterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [transporterName, setTransporterName] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalTrips, setTotalTrips] = useState<number>(0);

  const data=[ {value:50}, {value:80}, {value:90}, {value:70} ]
  const data2 = [ {value:30}, {value:60}, {value:70}, {value:50} ]

  

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (!storedPhoneNumber) {
          console.error("No phone number found");
          return;
        }
        setPhoneNumber(storedPhoneNumber);
      } catch (error) {
        console.error("Error fetching phone number:", error);
      }
    };

    fetchPhoneNumber();
  }, []);

  // Fetch Transporter Data
  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransporterData = async () => {
      try {
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

        // Fetch Vehicles inside transporter
        const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
        const vehicleSnapshot = await getDocs(vehicleRef);
        const vehicleList = vehicleSnapshot.docs.map((doc) => doc.id);

        setVehicles(vehicleList);
      } catch (error) {
        console.error("Error fetching transporter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransporterData();
  }, [phoneNumber]);


  const fetchTransporterData = async () => {
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

      // Fetch Vehicles inside transporter
      const vehicleRef = collection(db, "transporter", foundTransporter, "VehicleNo");
      const vehicleSnapshot = await getDocs(vehicleRef);
      const vehicleList = vehicleSnapshot.docs.map((doc) => doc.id);

      setVehicles(vehicleList);
    } catch (error) {
      console.error("Error fetching transporter data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      fetchTransporterData();
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (!vehicles.length) return;
  
    const fetchTotalTrips = async () => {
      try {
        let tripSum = 0;
        for (const vehicle of vehicles) {
          const shipmentRef = collection(db, "Shipment");
          const shipmentQuery = query(shipmentRef, where("vehicleNo", "==", vehicle));
          const snapshot = await getDocs(shipmentQuery);
          tripSum += snapshot.size;
        }
        setTotalTrips(tripSum);
      } catch (error) {
        console.error("Error fetching total trips:", error);
      }
    };
  
    fetchTotalTrips();
  }, [vehicles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransporterData().finally(() => setRefreshing(false));
  }, []);

  const useShipmentCount = (vehicleNo: string) => {
    const [shipmentCount, setShipmentCount] = useState<number | null>(null);

    useEffect(() => {
      if (!vehicleNo) return;

      const fetchShipmentCount = async () => {
        try {
          const shipmentRef = collection(db, "Shipment");
          const shipmentQuery = query(shipmentRef, where("vehicleNo", "==", vehicleNo));
          const snapshot = await getDocs(shipmentQuery);

          setShipmentCount(snapshot.size);
        } catch (error) {
          console.error("Error fetching shipment count:", error);
        }
      };

      fetchShipmentCount();
    }, [vehicleNo]);

    return shipmentCount;
  };

//   const TripCount = ({ vehicleNo }: { vehicleNo: string }) => {
//     const shipmentCount = useShipmentCount(vehicleNo);

//     return (
//       <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 5 }}>
//         Trips: {shipmentCount ?? "Loading..."}
//       </Text>
//     );
//   };


  
  const handlePressIn = (button: string) => {
    setPressedButton(button);
  };

  const handlePressOut = () => {
    setPressedButton(null);
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  

  return (

    <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{width:'100%', height: 90, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 20}}>
            <View style={{width:'70%', height:'100%', flexDirection:'column', justifyContent:'center'}}>
                {transporterName ? <Text style={{fontSize:14, fontWeight:'500'}}>Hello {transporterName.split("_")[1]},</Text> : <Text>No transporter found</Text>
                }
                <Text style={{fontWeight:'bold', fontSize: 23,marginTop:10}}>Good Afternoon</Text>
            </View>
            <View style={{width:70, height:70, backgroundColor: 'lightgreen', borderRadius: 35}}></View>
        </View>
        <View style={{width:'100%', height: 60, marginTop:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#f5f5f5', borderRadius: 10, paddingHorizontal: 5}}>
            {["Overview", "Shipping", "Tracking", "Invoice", "Manage"].map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.button,
            pressedButton === item && styles.pressedButton,
          ]}
          onPressIn={() => handlePressIn(item)}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>{item}</Text>
        </TouchableOpacity>
      ))}

        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{width:'100%', marginTop: 5}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={{width:'100%', height: 250, backgroundColor: '#f5f5f5', marginTop: 20, borderRadius: 10}}>
                <View style={{width:'100%', height:60, flexDirection:'row'}}>
                    <View style={{width:'80%', height:'100%'}}>
                        <Text style={{fontSize: 20, fontWeight:'bold', marginLeft: 10, marginTop: 10}}>Delivery Fleets</Text>
                        <Text style={{fontSize: 13, marginLeft: 10, marginTop: 5}}>Vehicles operating in your fleet</Text>
                    </View>
                    <View style={{width:'20%', height:'100%',alignItems:'center', justifyContent:'center'}}>
                        <TouchableOpacity style={{width: 50, height:50, borderRadius:25, justifyContent:'center', alignItems:'center'}} onPress={() => {router.push('/transporter/addNew')}}>
                            <Image source={require('../../assets/images/Kbutton.png')} resizeMode="contain" style={{width:40, height:40}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{width:'100%', height: 160,flexDirection:'row'}}>
                    <View style={{width:'40%', height:'100%', justifyContent:'center'}}>
                        <Text style={{paddingLeft:20, fontSize: 70, fontWeight:'bold', marginTop:10}}>{vehicles.length}</Text>
                        <Text style={{paddingLeft:20, fontSize: 14}}>Fleets</Text>
                    </View>
                    <Image source={require('../../assets/images/Van01.png')} style={{width:190, height:190}} resizeMode="contain"/>
                </View>
                <TouchableOpacity style={{padding:8}}>
                    <Text style={{color:'green'}}>View vehicle position</Text>
                </TouchableOpacity>
            </View>

            <View style={{width:'100%', height: 250, backgroundColor: '#f5f5f5', marginTop: 20, borderRadius: 10}}>
                <View style={{width:'100%', height:60, flexDirection:'row'}}>
                    <View style={{width:'80%', height:'100%'}}>
                        <Text style={{fontSize: 20, fontWeight:'bold', marginLeft: 10, marginTop: 10}}>Total Shipments</Text>
                        <Text style={{fontSize: 13, marginLeft: 10, marginTop: 5}}>Summary of completed shipments</Text>
                    </View>
                    <View style={{width:'20%', height:'100%',alignItems:'center', justifyContent:'center'}}>
                        <TouchableOpacity style={{width: 50, height:50, borderRadius:25, justifyContent:'center', alignItems:'center'}} onPress={() => {router.push('/transporter/routes')}}>
                            <Image source={require('../../assets/images/Kbutton.png')} resizeMode="contain" style={{width:40, height:40}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{width:'100%', height: 160,flexDirection:'row'}}>
                    <View style={{width:'40%', height:'100%', justifyContent:'center'}}>
                        <Text style={{paddingLeft:20, fontSize: 70, fontWeight:'bold', marginTop:10}}>{totalTrips}</Text>
                        <Text style={{paddingLeft:20, fontSize: 14}}>Shipments</Text>
                    </View>
                    <Image source={require('../../assets/images/trips.png')} style={{width:190, height:190}} resizeMode="contain"/>
                </View>
            </View>
            
        </ScrollView>
        
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "90%",
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    //backgroundColor: "orange",
    //height: '100%',
    justifyContent: 'center',
   
  },
  buttonText: {
    color: "black",
    //fontWeight: "bold",
  },
  vehicleItem: {
    fontSize: 16,
    marginVertical: 5,
  },

  pressedButton: {
    backgroundColor: "#f5f5f5",
  },

});

export default TransporterScreen;
