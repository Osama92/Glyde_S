// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   Alert,
//   Image,
//   StatusBar
// } from "react-native";
// import SearchableDropdown from 'react-native-searchable-dropdown';
// import { useRouter } from "expo-router";
// import {
//   getFirestore,
//   doc,
//   getDocs,
//   query,
//   where,
//   collection,
// } from "firebase/firestore";
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import { app } from "../firebase";
// import { useFonts } from "expo-font";

// const db = getFirestore(app);

// export default function Shipment() {
//     const [shippingPoints, setShippingPoints] = useState([]);
//     const [selectedPoint, setSelectedPoint] = useState('');
//     const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const [fontsLoaded] = useFonts({
//     Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//   });

//   if (!fontsLoaded) return null;

  

//   const dismissKeyboard = () => Keyboard.dismiss();

//   // Fetch data from Firestore
//   useEffect(() => {
//     const fetchShippingPoints = async () => {
//       try {
//         const snapshot = await firebase.firestore().collection('ShippingPoint').get();
//         const points = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().name, // Assuming the document has a `name` field
//         }));
//         setShippingPoints(points);
//       } catch (error) {
//         console.error('Error fetching shipping points:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShippingPoints();
//   }, []);
  

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//         <StatusBar barStyle="dark-content"/>
//       <TouchableWithoutFeedback onPress={dismissKeyboard}>
        

//         <View style={styles.innerContainer}>

//         <View style={styles.topSection}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Text style={{fontSize:20, fontWeight:'bold'}}>Manage</Text>
//           </TouchableOpacity>
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </View>
        
//         <View style={{flexDirection:'row', width: '100%',height: 40, justifyContent: 'space-between', alignItems:'center'}}>
//             <Text style={{fontSize: 16}}>Current Shipping Point</Text>
//             <Text style={{color:'#F6984C'}}>{selectedPoint}</Text>
//         </View>

//         <View style={{flexDirection:'row', width: '100%',height: 40, justifyContent: 'space-between', alignItems:'center'}}>
//             <Text style={{fontSize: 20, fontWeight:'600'}}>Update Shipping Point</Text>
//             <Text style={{color:'#F6984C'}}>See all</Text>
        
//         </View>
//         {loading ? (
//         <ActivityIndicator size="large" color="blue" />
//       ) : (
//         <>
//           <Text>Select a Shipping Point:</Text>
//           <SearchableDropdown
//             items={shippingPoints}
//             onItemSelect={(item:any) => setSelectedPoint(item.name)}
//             placeholder="Search Shipping Point"
//           />
//           <Text style={{ marginTop: 20 }}>Selected Point: </Text>
//         </>
//       )}
          
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }
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
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { useRouter } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
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

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  const dismissKeyboard = () => Keyboard.dismiss();

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
        console.log(shippingPoints)
      } catch (error) {
        console.error("Error fetching shipping points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingPoints();
  }, []);

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
});
