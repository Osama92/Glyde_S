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
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-s-eb857.firebasestorage.app");
const GOOGLE_MAPS_API_KEY = "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w";

const ProfileScreen = () => {
  const [profile, setProfile] = useState({ 
    name: "", 
    phoneNumber: "", 
    imageUrl: "", 
    email: "", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const { collectionName, id } = useLocalSearchParams();

  useEffect(() => {
    fetchPhoneNumberAndProfile();
  }, []);

  const fetchPhoneNumberAndProfile = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        setProfile((prev) => ({ ...prev, phoneNumber }));
        await fetchProfileFromFirestore(phoneNumber);
      } else {
        Alert.alert("Error", "Phone number not found!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch phone number!");
      console.error(error);
    }
  };

  const fetchProfileFromFirestore = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, decodeURIComponent(Array.isArray(id) ? id[0] : id) as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile((prev) => ({
          ...prev,
          ...data,
        }));
        if (data.location?.address) {
          setAddress(data.location.address);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile!");
      console.error(error);
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
  
      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        
        setProfile((prev) => ({ ...prev, imageUrl: downloadURL }));
        await saveProfileToFirestore();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image!");
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
        return response.data.results[0].formatted_address;
      }
      throw new Error("Geocoding failed");
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Address not available";
    }
  };
  
  const saveProfileToFirestore = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, id as string);
      await setDoc(docRef, profile, { merge: true });
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", "Update failed!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      setLocationUpdating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please enable location access");
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const address = await reverseGeocode(latitude, longitude);
      
      setAddress(address);
      const docRef = doc(db, collectionName as string, id as string);
      await setDoc(docRef, { 
        location: { 
          latitude, 
          longitude, 
          address,
          updatedAt: new Date().toISOString() 
        } 
      }, { merge: true });
    } catch (error) {
      Alert.alert("Error", "Location update failed!");
      console.error(error);
    } finally {
      setLocationUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("phoneNumber");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
            {profile.imageUrl ? (
              <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="person" size={40} color="#aaa" />
              </View>
            )}
            <View style={styles.editIcon}>
              <MaterialIcons name="edit" size={18} color="white" />
            </View>
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile.name || 'Your Name'}</Text>
          <Text style={styles.profilePhone}>{profile.phoneNumber || 'Phone number'}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Change Password</Text>
            <TextInput
              style={styles.input}
              value={profile.password}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, password: text }))}
              placeholder="Enter new password"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            {address ? (
              <View style={styles.addressContainer}>
                <Ionicons name="location-sharp" size={18} color="orange" />
                <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
              </View>
            ) : (
              <Text style={styles.noAddressText}>No location set</Text>
            )}
            <TouchableOpacity 
              onPress={updateLocation} 
              style={styles.locationButton}
              disabled={locationUpdating}
            >
              {locationUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={styles.locationButtonText}>Update Location</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            onPress={saveProfileToFirestore} 
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#ff4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#eee',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#eee',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  noAddressText: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    padding: 14,
    borderRadius: 8,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ProfileScreen;