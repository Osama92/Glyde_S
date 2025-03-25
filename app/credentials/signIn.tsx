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
//   Animated
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import {
//   getFirestore,
//   doc,
//   getDocs,
//   query,
//   where,
//   collection,
// } from "firebase/firestore";
// import { app } from "../firebase";
// import { useFonts } from "expo-font";

// const db = getFirestore(app);

// export default function SignIn() {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const [fontsLoaded] = useFonts({
//     Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//   });

//   if (!fontsLoaded) return null;

//   useEffect(() => {
//     // Load the persisted phone number from AsyncStorage
//     const loadPhoneNumber = async () => {
//       const savedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (savedPhoneNumber) {
//         setPhoneNumber(savedPhoneNumber);
//       }
//     };
//     loadPhoneNumber();
//   }, []);

//   const dismissKeyboard = () => Keyboard.dismiss();

//   const handleLogin = async () => {
//     const collections = [
//       "Admin",
//       "deliverydriver",
//       "customer",
//       "fieldagent",
//       "transporter",
//     ]; // Add your collection names here
//     let userFound = false;
  
//     if (!phoneNumber || !password) {
//       Alert.alert("Error", "Please enter both phone number and password.");
//       return;
//     }
  
//     setLoading(true);
  
//     try {
//       for (const collectionName of collections) {
//         const userQuery = query(
//           collection(db, collectionName), // Replace "db" with your Firestore instance
//           where("phoneNumber", "==", phoneNumber)
//         );
  
//         const querySnapshot = await getDocs(userQuery);
  
//         if (!querySnapshot.empty) {
//           for (const doc of querySnapshot.docs) {
//             const userData = doc.data();
//             if (userData.password === password) {
//               userFound = true;
  
//               // Save phone number to AsyncStorage for persistence
//               await AsyncStorage.setItem("phoneNumber", phoneNumber);
  
//               // Redirect user based on their collection name
//               let screen: any = "/credentials/whoami"; // Default screen
//               if (collectionName === "customer") {
//                 screen = "/customer/dashboard";
//               } else if (collectionName === "deliverydriver") {
//                 screen = "/driver/notificationScreen";
//               } else if (collectionName === "fieldagent") {
//                 screen = "/agent/dashboard";
//               } else if (collectionName === "transporter") {
//                 screen = "/transporter/dashboard";
//               }else if (collectionName === "Admin") {
//                 // screen = "/admin/approve_onboard";
//                 screen = "/admin/dashboard";
//               }
  
//               setLoading(false);
//               router.push(screen);
//               return; 
//             }
//           }
//         }
//       }
  
//       if (!userFound) {
//         setLoading(false);
//         Alert.alert("Error", "Invalid phone number or password.");
//       }
//     } catch (error: any) {
//       setLoading(false);
//       Alert.alert("Error", `Login failed: ${error.message}`);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <TouchableWithoutFeedback onPress={dismissKeyboard}>
        

//         <View style={styles.innerContainer}>

//         <View style={styles.topSection}>
//           <TouchableOpacity onPress={() => router.push("/credentials/signUp")}>
//             <Text style={{fontSize:20}}>Back to sign up</Text>
//           </TouchableOpacity>
//           <Image
//             source={require("../../assets/images/Back.png")}
//             style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//           />
//         </View>

//         <Image source={require('../../assets/images/signIn.png')} resizeMode='contain' style={{width:200, height:200}}/>

//           <Text style={styles.title}>Login</Text>

//           <TextInput
//             placeholder="Phone Number"
//             style={styles.input}
//             keyboardType="phone-pad"
//             value={phoneNumber}
//             onChangeText={setPhoneNumber}
//             clearButtonMode= 'while-editing'
//           />

//           <TextInput
//             placeholder="Password"
//             style={styles.input}
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//             placeholderTextColor={"grey"}
//             autoCapitalize="none"
//             clearButtonMode= 'while-editing'
//           />

//           {loading ? (
//             <ActivityIndicator size="large" color="orange" />
//           ) : (
//             <TouchableOpacity style={styles.button} onPress={handleLogin}>
//               <Text style={styles.buttonText}>Log In</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 40,
//     fontWeight: "bold",
//     textAlign: "left",
//     marginBottom: 20,
//     fontFamily: "Poppins",
//   },
//   input: {
//     height: 50,
//     width: "100%",
//     backgroundColor: "#f5f5f5",
//     borderRadius: 10,
//     fontSize: 18,
//     paddingHorizontal: 10,
//     fontFamily: "Nunito",
//     color: "#000",
//     marginTop: 15,
//   },
//   button: {
//     backgroundColor: "#000",
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 20,
//     width:'50%',
//     alignSelf:'center'
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 20,
//     fontFamily: 'Nunito'
//   },
//   topSection: {
//     width: '100%',
//     height: '20%',
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
// });


import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Image,
  Dimensions,
  Easing,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  getFirestore,
  doc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";

const db = getFirestore(app);

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

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
    const loadPhoneNumber = async () => {
      const savedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (savedPhoneNumber) {
        setPhoneNumber(savedPhoneNumber);
      }
    };
    loadPhoneNumber();
  }, []);

  const dismissKeyboard = () => Keyboard.dismiss();

  const handleLogin = async () => {
    const collections = [
      "Admin",
      "deliverydriver",
      "customer",
      "fieldagent",
      "transporter",
    ];
    let userFound = false;
  
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }
  
    setLoading(true);
  
    try {
      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName),
          where("phoneNumber", "==", phoneNumber)
        );
  
        const querySnapshot = await getDocs(userQuery);
  
        if (!querySnapshot.empty) {
          for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            if (userData.password === password) {
              userFound = true;
  
              await AsyncStorage.setItem("phoneNumber", phoneNumber);
  
              let screen: any = "/credentials/whoami";
              if (collectionName === "customer") {
                screen = "/customer/dashboard";
              } else if (collectionName === "deliverydriver") {
                screen = "/driver/notificationScreen";
              } else if (collectionName === "fieldagent") {
                screen = "/agent/dashboard";
              } else if (collectionName === "transporter") {
                screen = "/transporter/dashboard";
              } else if (collectionName === "Admin") {
                screen = "/admin/dashboard";
              }
  
              setLoading(false);
              router.push(screen);
              return; 
            }
          }
        }
      }
  
      if (!userFound) {
        setLoading(false);
        Alert.alert("Error", "Invalid phone number or password.");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", `Login failed: ${error.message}`);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <Animated.View style={[styles.loadingContainer, { transform: [{ rotate: spin }] }]}>
                <Image
                  source={require('../../assets/images/Glyde.png')}
                  style={styles.loadingLogo}
                />
              </Animated.View>
            </View>
          )}

          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => router.push("/credentials/signUp")}>
              <Text style={{fontSize:20}}>Back to sign up</Text>
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/Back.png")}
              style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
            />
          </View>

          <Image 
            source={require('../../assets/images/signIn.png')} 
            resizeMode='contain' 
            style={{width:200, height:200}}
          />

          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            clearButtonMode='while-editing'
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={"grey"}
            autoCapitalize="none"
            clearButtonMode='while-editing'
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
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
    backgroundColor: "#f5f5f5",
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
    height: '20%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
  },
});