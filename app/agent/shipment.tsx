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
  Image,
  StatusBar
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

export default function Shipment() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  

  const dismissKeyboard = () => Keyboard.dismiss();

  
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <StatusBar barStyle="dark-content"/>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        

        <View style={styles.innerContainer}>

        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{fontSize:20, fontWeight:'bold'}}>Manage</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/Back.png")}
            style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
          />
        </View>
        
        <View style={{flexDirection:'row', width: '100%',height: 40, justifyContent: 'space-between', alignItems:'center'}}>
            <Text style={{fontSize: 16}}>Current Shipping Point</Text>
            <Text style={{color:'#F6984C'}}>Shipping point here</Text>
        </View>

          
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
