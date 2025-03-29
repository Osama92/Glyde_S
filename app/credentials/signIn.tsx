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
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getFirestore, doc, getDocs, query, where, collection } from "firebase/firestore";
import { app } from "../firebase";
import { useFonts } from "expo-font";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const db = getFirestore(app);

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });

  useEffect(() => {
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const loadPhoneNumber = async () => {
      const savedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (savedPhoneNumber) {
        setPhoneNumber(savedPhoneNumber);
      }
    };
    loadPhoneNumber();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
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

              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity 
                  onPress={() => router.push("/credentials/signUp")}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                  <Text style={styles.backText}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Main Content - Wrapped in a View with flexGrow */}
              <View style={styles.contentContainer}>
                <Image 
                  source={require('../../assets/images/signIn.png')} 
                  resizeMode='contain' 
                  style={styles.illustration}
                />

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                {/* Input Fields */}
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your phone number"
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        clearButtonMode='while-editing'
                        placeholderTextColor="#aaa"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your password"
                        style={styles.input}
                        secureTextEntry={secureEntry}
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="#aaa"
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={() => setSecureEntry(!secureEntry)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons 
                          name={secureEntry ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#888" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button with Space */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLogin} 
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#F6984C', '#FF8C00']}
                      style={styles.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.loginButtonText}>
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer - Now properly spaced */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/credentials/signUp")}>
                  <Text style={styles.signUpText}> Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding at bottom
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  illustration: {
    width: Dimensions.get('window').width * 0.6, // Responsive width
    height: Dimensions.get('window').width * 0.6, // Responsive height
    maxWidth: 220,
    maxHeight: 220,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Nunito',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    fontFamily: 'Nunito',
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#F6984C',
    fontSize: 14,
    fontFamily: 'Nunito',
  },
  buttonContainer: {
    marginBottom: 30, // Space between button and footer
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F6984C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    marginTop: 'auto', // Pushes footer to bottom
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Nunito',
  },
  signUpText: {
    color: '#F6984C',
    fontSize: 14,
    fontFamily: 'Nunito',
    fontWeight: '600',
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
    width: 80,
    height: 80,
  },
});