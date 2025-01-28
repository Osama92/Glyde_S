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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase"; 


const db = getFirestore(app);
const storage = getStorage(app);

const ProfileScreen = () => {
  const router = useRouter();
  const { collectionName, id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (collectionName && id) {
      fetchProfile();
    }
  }, [collectionName, id]);

  // Fetch profile from Firestore
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
        console.log(docSnap.data()) 
      } else {
        Alert.alert("Error", "Profile not found!");
        
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile!");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
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
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageRef = ref(storage, `profile_pictures/${id}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        setProfile((prev: any) => ({ ...prev, imageUrl: downloadURL }));
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image!");
      console.log(collectionName)
    } finally {
      setUploading(false);
    }
  };

  // Save profile updates
  const handleSave = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName as string, id as string);
      await updateDoc(docRef, profile);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile!");
      console.log(profile)
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
        {profile?.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Upload</Text>
          </View>
        )}
        {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="#000" />}
      </TouchableOpacity>

      <Text style={styles.label}>Display Name</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={profile?.name || ""}
          onChangeText={(text) => setProfile((prev: any) => ({ ...prev, name: text }))}
        />
        <TouchableOpacity>
          <Image source={require("../../assets/images/edit.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={profile?.phoneNumber || ""}
          onChangeText={(text) => setProfile((prev: any) => ({ ...prev, phoneNumber: text }))}
        />
        <TouchableOpacity>
          <Image source={require("../../assets/images/edit.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Language Preference</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  button: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
  },
  buttonText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  saveButtonText: {
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
});
