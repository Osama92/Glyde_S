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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, "users", phoneNumber)); // Adjust the Firestore collection name if needed

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.password === password) {
          // Save phone number to AsyncStorage for persistence
          await AsyncStorage.setItem("phoneNumber", phoneNumber);

          setLoading(false);
          //router.push("/dashboard"); // Navigate to the Dashboard screen
        } else {
          setLoading(false);
          Alert.alert("Error", "Invalid password. Please try again.");
        }
      } else {
        setLoading(false);
        Alert.alert("Error", "User does not exist. Please sign up first.");
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
