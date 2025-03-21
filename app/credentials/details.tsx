import React, { useState } from "react";
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
  Image
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useFonts } from 'expo-font';

const db = getFirestore(app);
const auth = getAuth(app);

export default function Details() {
  const { title } = useLocalSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dismissKeyboard = () => Keyboard.dismiss();


    const [fontsLoaded] = useFonts({
      Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
      Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
    });
  
    if (!fontsLoaded) return null;

    const handleContinue = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not authenticated. Please verify OTP first.");
        setLoading(false);
        return;
      }

      const uid = `${user.phoneNumber}_${displayName}`; // UID is phone number and display name
      const docData = {
        name: title === "Customer" ? organizationName : displayName,
        email,
        password,
        phoneNumber: user.phoneNumber,
        uid,
        createdAt: new Date(),
      };

      const folderName =
        typeof title === "string"
          ? title.replace(/\s+/g, "").toLowerCase()
          : "unknown";

      // Save the data to Firestore
      await setDoc(doc(db, folderName, uid), docData);

      setLoading(false);
      alert("Data saved successfully!");
      router.push("/credentials/success");
    } catch (error: any) {
      setLoading(false);
      alert("Error saving data: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <View style={styles.topSection}>
                
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{fontWeight:'700', fontSize:20}}>Go Back</Text>
                  </TouchableOpacity>
                  <Image
                    source={require('../../assets/images/Back.png')}
                    style={{ width: 30, resizeMode: 'contain', marginLeft: 15 }}
                  />
                </View>
        
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Complete your profile</Text>

          {title === "Customer" ? (
            <TextInput
              placeholder="Organization Name"
              style={styles.input}
              value={organizationName}
              onChangeText={setOrganizationName}
              placeholderTextColor={'#000'}
            />
          ) : (
            <TextInput
              placeholder="Display Name"
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor={'#000'}
            />
          )}

          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={'#000'}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Choose Password"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={'#000'}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Text style={styles.toggleText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor={'#000'}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            >
              <Text style={styles.toggleText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor:'#fff'
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  topSection: {
    width: '100%',
    height: '15%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 30,
    
  },
  title: {
    fontSize: 40,
    fontFamily: "Poppins",
    textAlign: "left",
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
    color: '#000',
    marginTop:15
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  passwordInput: {
    height: 50,
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
    color: '#000',
    marginTop:15,
    flex: 1,
    
  },
  toggleButton: {
    marginLeft: 10,
  },
  toggleText: {
    color: "#000"
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
