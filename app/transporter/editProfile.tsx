import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDocs, updateDoc, where, collection, query} from "firebase/firestore";
import { app } from "../firebase";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const db = getFirestore(app);
const storage = getStorage(app);

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    imageUrl: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { collectionName } = useLocalSearchParams();

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

  useEffect(() => {
    fetchPhoneNumberAndProfile();
  }, []);

  const fetchProfileFromFirestore = async (phoneNumber: string) => {
    try {
      setLoading(true);
      
      // Find the transporter document that matches the phone number
      const transporterQuery = query(
        collection(db, "transporter"),
        where("phoneNumber", "==", phoneNumber)
      );
      
      const querySnapshot = await getDocs(transporterQuery);
      
      if (!querySnapshot.empty) {
        // Get the first matching document (assuming phone numbers are unique)
        const docSnap = querySnapshot.docs[0];
        const transporterData = docSnap.data();
        
        setProfile({
          name: transporterData.name || "",
          phoneNumber: transporterData.phoneNumber || phoneNumber,
          imageUrl: transporterData.imageUrl || "",
          email: transporterData.email || "",
          password: transporterData.password || "",
        });
        
        // Also store the document ID for later updates
        await AsyncStorage.setItem("transporterDocId", docSnap.id);
      } else {
        Alert.alert("Info", "No transporter profile found for this phone number");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile!");
      console.error("Firestore fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "We need access to your photos to upload a profile picture");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!pickerResult.canceled && pickerResult.assets) {
        setUploading(true);
        const uri = pickerResult.assets[0].uri;
        const filename = uri.substring(uri.lastIndexOf("/") + 1);
        const storageRef = ref(storage, `profile_images/${filename}`);

        // Convert image to blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Upload to Firebase Storage
        await uploadBytes(storageRef, blob);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Update profile state
        setProfile(prev => ({ ...prev, imageUrl: downloadURL }));
        setUploading(false);
      }
    } catch (error) {
      setUploading(false);
      Alert.alert("Error", "Failed to upload image");
      console.error("Image upload error:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const transporterDocId = await AsyncStorage.getItem("transporterDocId");
      
      if (!transporterDocId) {
        Alert.alert("Error", "No transporter document ID found");
        return;
      }

      const docRef = doc(db, "transporter", transporterDocId);
      
      await updateDoc(docRef, {
        name: profile.name,
        email: profile.email,
        password: profile.password,
        imageUrl: profile.imageUrl,
        // Don't update phoneNumber as it's likely used as an identifier
      });

      // Update AsyncStorage with new profile image if changed
      if (profile.imageUrl) {
        await AsyncStorage.setItem("profileImage", profile.imageUrl);
      }

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.profileImageContainer}>
        {profile.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <MaterialIcons name="person" size={50} color="#fff" />
          </View>
        )}
        <TouchableOpacity style={styles.editImageButton} onPress={handleImagePick}>
          <MaterialIcons name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile.phoneNumber}
            editable={false}
            placeholder="Phone number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Register your email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={profile.password}
              onChangeText={(text) => setProfile({ ...profile, password: text })}
              placeholder="Enter your password"
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <MaterialIcons
                name={isPasswordVisible ? "visibility-off" : "visibility"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "orange",
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 30,
    backgroundColor: "orange",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  uploadingOverlay: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#888",
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 12,
  },
  saveButton: {
    backgroundColor: "orange",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfile;