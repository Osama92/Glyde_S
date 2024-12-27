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
  Alert,
  Image
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

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  useEffect(() => {
    // Load the persisted phone number from AsyncStorage
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
      "deliverydriver",
      "customer",
      "fieldAgent",
      "transporter",
    ]; // Add your collection names here
    let userFound = false;

    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    setLoading(true);

    try {
      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName), // Replace "db" with your Firestore instance
          where("phoneNumber", "==", phoneNumber)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (doc) => {
            const userData = doc.data();
            if (userData.password === password) {
              userFound = true;

              // Save phone number to AsyncStorage for persistence
              await AsyncStorage.setItem("phoneNumber", phoneNumber);

              // Navigate to the Dashboard screen
              setLoading(false);
              router.push("/main/dashboard");
            }
          });
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        

        <View style={styles.innerContainer}>

        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text>Back to sign up</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/Back.png")}
            style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
          />
        </View>

        <Image source={require('../../assets/images/signIn.png')} resizeMode='contain' style={{width:'50%', height:'25%'}}/>

          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={"grey"}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
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
    height: '20%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
