import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from "expo-location";
import axios from "axios";

const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");
const GOOGLE_MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

const ProfileScreen = () => {
  const [profile, setProfile] = useState({ name: "", phoneNumber: "", imageUrl: "", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const { collectionName, id } = useLocalSearchParams();

  useEffect(() => {
    fetchPhoneNumberAndProfile();
  }, []);

  // Fetch phoneNumber from AsyncStorage and existing profile from Firestore
  const fetchPhoneNumberAndProfile = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        setProfile((prev) => ({ ...prev, phoneNumber }));
        await fetchProfileFromFirestore(phoneNumber);
      } else {
        Alert.alert("Error", "Phone number not found in AsyncStorage!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch phone number from AsyncStorage!");
    }
  };

  const fetchProfileFromFirestore = async (phoneNumber) => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, decodeURIComponent(Array.isArray(id) ? id[0] : id) as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile((prev) => ({
          ...prev,
          ...docSnap.data(),
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile from Firestore!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setUploading(true);
        const uri = result.assets[0].uri;
  
        // Convert the image to a Blob using XMLHttpRequest
        const blob: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });
  
        // Create a reference to the Firebase Storage path
        const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);
  
        // Upload the image to Firebase Storage
        await uploadBytes(imageRef, blob);
  
        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(imageRef);
  
        // Update the profile state with the new image URL
        setProfile((prev) => ({ ...prev, imageUrl: downloadURL }));
  
        // Save the updated profile to Firestore
        await saveProfileToFirestore();
  
        Alert.alert("Success", "Profile picture uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image!");
      console.log(storage)
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      if (response.data.status === "OK") {
        return response.data.results[0].formatted_address; // First result is usually the most relevant
      } else {
        throw new Error("Geocoding failed.");
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return "Address not found";
    }
  };
  
  // Save profile to Firestore
  const saveProfileToFirestore = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, id as string);
      await setDoc(docRef, profile, { merge: true });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


    // Fetch and update the user's current location in Firestore
  // const updateLocation = async () => {
  //   try {
  //     setLocationUpdating(true);

  //     // Request location permissions
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert("Permission Denied", "Allow location access to update your location.");
  //       return;
  //     }

  //     // Get current location
  //     let location = await Location.getCurrentPositionAsync({});
  //     const { latitude, longitude } = location.coords;

  //     const getAddress = async () => {
  //       const address = await reverseGeocode(latitude, longitude);
  //       setAddress(address)
  //     };
      
  //     getAddress();

  //     // Save location to Firestore
  //     const docRef = doc(db, collectionName as string, id as string);
  //     await setDoc(docRef, { location: { latitude, longitude, address } }, { merge: true });
  //     Alert.alert("Success", "Location updated successfully!");
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to update location!");
  //     console.error(error);
  //   } finally {
  //     setLocationUpdating(false);
  //   }
  // };

  const updateLocation = async () => {
    try {
      setLocationUpdating(true);
  
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to update your location.");
        return;
      }
  
      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
      // Get the address using reverse geocoding
      const address = await reverseGeocode(latitude, longitude);
      setAddress(address);
  
      // Save location and address to Firestore
      const docRef = doc(db, collectionName as string, id as string);
      await setDoc(docRef, { location: { latitude, longitude, address } }, { merge: true });
      Alert.alert("Success", "Location updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update location!");
      console.error(error);
    } finally {
      setLocationUpdating(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topSection}>
                    <TouchableOpacity onPress={() => router.back()}>
                      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()}>
                    <Image
                      source={require("../../assets/images/Back.png")}
                      style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
                    />
                    </TouchableOpacity>
                  </View>

      {/* Profile Image Upload */}
      <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
        {profile.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Upload</Text>
          </View>
        )}
        {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="orange" />}
      </TouchableOpacity>

      {/* Display Name */}
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
      />

      {/* Display Email */}
      <Text style={styles.label}>Display Email</Text>
      <TextInput
        style={styles.input}
        value={profile.email}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
      />

      {/* Display password */}
      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        value={profile.password}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
      />

      {/* Save Button */}
      <TouchableOpacity onPress={saveProfileToFirestore} style={[styles.button, styles.saveButton]}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

          {/*Update Location button */}
          <TouchableOpacity onPress={updateLocation} style={[styles.button, styles.locationButton]} disabled={locationUpdating}>
          {locationUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.locationButtonText}>Update Location</Text>}
        </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
    </ScrollView>
    
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 20,
    alignItems: "center",
    backgroundColor:'#fff'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#aaa",
    fontSize: 14,
  },
  imageLoader: {
    position: "absolute",
    top: 50,
    left: 50,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "black",
  },
  saveButtonText: {
    textAlign: "center",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 8,
    width: "100%",
  },
  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  topSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
    locationButton: {
    backgroundColor: "#007AFF",
    alignItems:'center'
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
