// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// import { app } from "../firebase";

// const db = getFirestore(app);
// const storage = getStorage(app);

// const ProfileScreen = () => {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // Search user by phone number
//   const searchUser = async () => {
//     try {
//       setLoading(true);
//       const usersRef = collection(db, "fieldagent"); // Change "users" to your collection name
//       const q = query(usersRef, where("phoneNumber", "==", phoneNumber));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const userData = querySnapshot.docs[0].data();
//         setProfile({ ...userData, id: querySnapshot.docs[0].id });
//       } else {
//         Alert.alert("Error", "No user found with this phone number");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to search user");
//       console.error("Search User Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle image upload
//   const handleImageUpload = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         setUploading(true);
//         const uri = result.assets[0].uri;
//         const response = await fetch(uri);
//         const blob = await response.blob();
//         const imageRef = ref(storage, `profile_pictures/${profile.id}.jpg`);
//         await uploadBytes(imageRef, blob);
//         const downloadURL = await getDownloadURL(imageRef);

//         setProfile((prev: any) => ({ ...prev, imageUrl: downloadURL }));
//         Alert.alert("Success", "Profile picture updated!");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to upload image!");
//       console.error("Image Upload Error:", error);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Save profile updates
//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       const userRef = doc(db, "fieldagent", profile.id); // Update "users" to your collection name
//       await updateDoc(userRef, { name: profile.name });
//       Alert.alert("Success", "Profile updated successfully!");
//     } catch (error) {
//       Alert.alert("Error", "Failed to update profile!");
//       console.error("Save Profile Error:", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.label}>Search by Phone Number</Text>
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           value={phoneNumber}
//           onChangeText={setPhoneNumber}
//           placeholder="Enter phone number"
//         />
//         <TouchableOpacity onPress={searchUser} style={styles.searchButton}>
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.searchButtonText}>Search</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {profile && (
//         <>
//           <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
//             {profile.imageUrl ? (
//               <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
//             ) : (
//               <View style={styles.placeholder}>
//                 <Text style={styles.placeholderText}>Upload</Text>
//               </View>
//             )}
//             {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="#000" />}
//           </TouchableOpacity>

//           <Text style={styles.label}>Name</Text>
//           <View style={styles.inputRow}>
//             <TextInput
//               style={styles.input}
//               value={profile.name || ""}
//               onChangeText={(text) => setProfile((prev: any) => ({ ...prev, name: text }))}
//             />
//           </View>

//           <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
//             {saving ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.saveButtonText}>Save</Text>
//             )}
//           </TouchableOpacity>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     alignItems: "center",
//   },
//   label: {
//     alignSelf: "flex-start",
//     fontSize: 16,
//     marginBottom: 5,
//     fontWeight: "600",
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//     width: "100%",
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//   },
//   searchButton: {
//     marginLeft: 10,
//     padding: 10,
//     backgroundColor: "#007bff",
//     borderRadius: 8,
//   },
//   searchButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   imageContainer: {
//     marginBottom: 20,
//     position: "relative",
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//   },
//   placeholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#f0f0f0",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   placeholderText: {
//     color: "#aaa",
//     fontSize: 14,
//   },
//   imageLoader: {
//     position: "absolute",
//     top: 50,
//     left: 50,
//   },
//   button: {
//     padding: 15,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//     width: "100%",
//     marginBottom: 15,
//   },
//   saveButton: {
//     backgroundColor: "#007bff",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });


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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc, getFirestore, collection } from "firebase/firestore";
import { app } from "../firebase"; // Adjust path to your Firebase config file
import {useLocalSearchParams, router} from 'expo-router'

const db = getFirestore(app);
const storage = getStorage(app);



const ProfileScreen = () => {
  const [profile, setProfile] = useState({ name: "", phoneNumber: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {collectionName, id} = useLocalSearchParams()

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

  // Handle image upload to Firebase Storage
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
        const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);

        // Upload image to Firebase Storage
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        // Update profile with image URL
        setProfile((prev) => ({ ...prev, imageUrl: downloadURL }));

        // Save profile to Firestore
        await saveProfileToFirestore();

        Alert.alert("Success", "Profile picture uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image!");
      console.log(error);
    } finally {
      setUploading(false);
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Image Upload */}
      <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
        {profile.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Upload</Text>
          </View>
        )}
        {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="#000" />}
      </TouchableOpacity>

      {/* Display Name */}
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
      />

      {/* Save Button */}
      <TouchableOpacity onPress={saveProfileToFirestore} style={[styles.button, styles.saveButton]}>
        <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: "#007bff",
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
});
