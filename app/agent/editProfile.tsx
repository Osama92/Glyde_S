// import React, { useEffect, useState } from "react";
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
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
// import { app } from "../firebase";
// import { useLocalSearchParams, router } from 'expo-router';

// const db = getFirestore(app);
// const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");

// const ProfileScreen = () => {
//   const [profile, setProfile] = useState({ name: "", phoneNumber: "", imageUrl: "", email:"", password:"" });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const { collectionName, id } = useLocalSearchParams();

//   useEffect(() => {
//     fetchPhoneNumberAndProfile();
//   }, []);

//   // Fetch phoneNumber from AsyncStorage and existing profile from Firestore
//   const fetchPhoneNumberAndProfile = async () => {
//     try {
//       const phoneNumber = await AsyncStorage.getItem("phoneNumber");
//       if (phoneNumber) {
//         setProfile((prev) => ({ ...prev, phoneNumber }));
//         await fetchProfileFromFirestore(phoneNumber);
//       } else {
//         Alert.alert("Error", "Phone number not found in AsyncStorage!");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to fetch phone number from AsyncStorage!");
//     }
//   };

//   const fetchProfileFromFirestore = async (phoneNumber) => {
//     try {
//       setLoading(true);
//       const docRef = doc(db, collectionName as string, decodeURIComponent(Array.isArray(id) ? id[0] : id) as string);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         setProfile((prev) => ({
//           ...prev,
//           ...docSnap.data(),
//         }));
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to fetch profile from Firestore!");
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

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
  
//         // Convert the image to a Blob using XMLHttpRequest
//         const blob: any = await new Promise((resolve, reject) => {
//           const xhr = new XMLHttpRequest();
//           xhr.onload = () => {
//             resolve(xhr.response);
//           };
//           xhr.onerror = (e) => {
//             reject(new TypeError("Network request failed"));
//           };
//           xhr.responseType = "blob";
//           xhr.open("GET", uri, true);
//           xhr.send(null);
//         });
  
//         // Create a reference to the Firebase Storage path
//         const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);
  
//         // Upload the image to Firebase Storage
//         await uploadBytes(imageRef, blob);
  
//         // Get the download URL of the uploaded image
//         const downloadURL = await getDownloadURL(imageRef);
  
//         // Update the profile state with the new image URL
//         setProfile((prev) => ({ ...prev, imageUrl: downloadURL }));
  
//         // Save the updated profile to Firestore
//         await saveProfileToFirestore();
  
//         Alert.alert("Success", "Profile picture uploaded successfully!");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to upload image!");
//       console.log(storage)
//       console.error("Upload error:", error);
//     } finally {
//       setUploading(false);
//     }
//   };
  
//   // Save profile to Firestore
//   const saveProfileToFirestore = async () => {
//     try {
//       setLoading(true);
//       const docRef = doc(db, collectionName as string, id as string);
//       await setDoc(docRef, profile, { merge: true });
//       Alert.alert("Success", "Profile updated successfully!");
//     } catch (error) {
//       Alert.alert("Error", "Failed to update profile!");
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.topSection}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Text style={{ fontSize: 20, fontWeight: "bold" }}>Edit Profile</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Image
//               source={require("../../assets/images/Back.png")}
//               style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Profile Image Upload */}
//         <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
//           {profile.imageUrl ? (
//             <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
//           ) : (
//             <View style={styles.placeholder}>
//               <Text style={styles.placeholderText}>Upload</Text>
//             </View>
//           )}
//           {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="#000" />}
//         </TouchableOpacity>

//         {/* Display Name */}
//         <Text style={styles.label}>Display Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.name}
//           onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
//         />

//         {/* Display Email */}
//         <Text style={styles.label}>Display Email</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.email}
//           onChangeText={(text) => setProfile((prev) => ({ ...prev, email: text }))}
//         />

//         {/* Display password */}
//         <Text style={styles.label}>Change Password</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.password}
//           onChangeText={(text) => setProfile((prev) => ({ ...prev, password: text }))}
//           secureTextEntry
//         />

//         {/* Save Button */}
//         <TouchableOpacity onPress={saveProfileToFirestore} style={[styles.button, styles.saveButton]}>
//           <Text style={styles.saveButtonText}>Save</Text>
//         </TouchableOpacity>

//         {/* Logout Button */}
//         <TouchableOpacity style={styles.logoutButton}>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex:1,
//     padding: 20,
//     alignItems: "center",
//     backgroundColor:'#fff'
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
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
//   label: {
//     alignSelf: "flex-start",
//     fontSize: 16,
//     marginBottom: 5,
//     fontWeight: "600",
//   },
//   input: {
//     width: "100%",
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   button: {
//     padding: 15,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//     width: "100%",
//     marginBottom: 15,
//   },
//   saveButton: {
//     backgroundColor: "black",
//   },
//   saveButtonText: {
//     textAlign: "center",
//     color: "#fff",
//   },
//   logoutButton: {
//     backgroundColor: "#ff4444",
//     padding: 15,
//     borderRadius: 8,
//     width: "100%",
//   },
//   logoutText: {
//     textAlign: "center",
//     color: "#fff",
//     fontWeight: "600",
//   },
//   topSection: {
//     width: '100%',
//     height: '10%',
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
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
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
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
const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");

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