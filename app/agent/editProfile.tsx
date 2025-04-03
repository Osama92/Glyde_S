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
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-s-eb857.firebasestorage.app");

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
  const [editMode, setEditMode] = useState(false);

  const { collectionName, id } = useLocalSearchParams();

  useEffect(() => {
    fetchPhoneNumberAndProfile();
  }, []);

  const fetchPhoneNumberAndProfile = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        setProfile(prev => ({ ...prev, phoneNumber }));
        await fetchProfileFromFirestore(phoneNumber);
      } else {
        Alert.alert("Error", "Phone number not found!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch phone number!");
    }
  };

  const fetchProfileFromFirestore = async (phoneNumber) => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, decodeURIComponent(Array.isArray(id) ? id[0] : id) as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(prev => ({
          ...prev,
          ...docSnap.data(),
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile!");
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
  
        const blob: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = (e) => reject(new TypeError("Network request failed"));
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });
  
        const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
  
        setProfile(prev => ({ ...prev, imageUrl: downloadURL }));
        await saveProfileToFirestore();
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image!");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  
  const saveProfileToFirestore = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, id as string);
      await setDoc(docRef, profile, { merge: true });
      Alert.alert("Success", "Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      saveProfileToFirestore();
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F6984C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity 
              onPress={toggleEditMode}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {editMode ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity 
              onPress={handleImageUpload} 
              style={styles.imageContainer}
            >
              {profile.imageUrl ? (
                <Image 
                  source={{ uri: profile.imageUrl }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.placeholder}>
                  <MaterialIcons name="add-a-photo" size={32} color="#F6984C" />
                </View>
              )}
              {uploading && (
                <View style={styles.imageLoader}>
                  <ActivityIndicator size="small" color="#F6984C" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.profileName}>
              {profile.name || 'Your Name'}
            </Text>
            <Text style={styles.profileEmail}>
              {profile.email || 'email@example.com'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="person-outline" 
                  size={20} 
                  color="#888" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={profile.name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                  editable={editMode}
                  placeholder="Enter your full name"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="email" 
                  size={20} 
                  color="#888" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                  editable={editMode}
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="phone" 
                  size={20} 
                  color="#888" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: '#888' }]}
                  value={profile.phoneNumber}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="lock-outline" 
                  size={20} 
                  color="#888" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={profile.password}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, password: text }))}
                  editable={editMode}
                  secureTextEntry
                  placeholder="Change your password"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveProfileToFirestore}
            >
              <Text style={styles.saveButtonText}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={()=>router.push('/credentials/signIn')}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#F6984C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#F6984C',
  },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F6984C',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#F6984C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 70,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  actionButtons: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: '#F6984C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#F6984C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;