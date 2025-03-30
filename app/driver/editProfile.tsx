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
//   KeyboardAvoidingView
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

//   useEffect(() => {
//     fetchPhoneNumberAndProfile();
//   }, []);

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

// const handleImageUpload = async () => {
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
//         <ActivityIndicator size="large" color="orange" />
//       </View>
//     );
//   }

//   return (
    
//     <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.topSection}>
//                     <TouchableOpacity onPress={() => router.back()}>
//                       <Text style={{ fontSize: 20, fontWeight: "bold" }}>Edit Profile</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => router.back()}>
//                     <Image
//                       source={require("../../assets/images/Back.png")}
//                       style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//                     />
//                     </TouchableOpacity>
//                   </View>

//       {/* Profile Image Upload */}
//       <TouchableOpacity onPress={handleImageUpload} style={styles.imageContainer}>
//         {profile.imageUrl ? (
//           <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
//         ) : (
//           <View style={styles.placeholder}>
//             <Text style={styles.placeholderText}>Upload</Text>
//           </View>
//         )}
//         {uploading && <ActivityIndicator style={styles.imageLoader} size="small" color="orange" />}
//       </TouchableOpacity>

//       {/* Display Name */}
//       <Text style={styles.label}>Display Name</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.name}
//         onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
//         spellCheck={false}
//         autoCorrect={false}
//       />

//       {/* Display Email */}
//       <Text style={styles.label}>Display Email</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.email}
//         onChangeText={(text) => setProfile((prev) => ({ ...prev, email: text }))}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />

//       {/* Display password */}
//       <Text style={styles.label}>Change Password</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.password}
//         onChangeText={(text) => setProfile((prev) => ({ ...prev, password: text }))}
//         spellCheck={false}
//         autoCorrect={false}
//       />

//       {/* Save Button */}
//       <TouchableOpacity onPress={saveProfileToFirestore} style={[styles.button, styles.saveButton]}>
//         <Text style={styles.saveButtonText}>Save</Text>
//       </TouchableOpacity>

         
//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton} onPress={()=>router.push('/credentials/signIn')}>
//         <Text style={styles.logoutText}>Log Out</Text>
//       </TouchableOpacity>
      
//     </ScrollView>
    
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
//     locationButton: {
//     backgroundColor: "#007AFF",
//     alignItems:'center'
//   },
//   locationButtonText: {
//     color: "#fff",
//     fontWeight: "600",
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
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { collectionName, id } = useLocalSearchParams();

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
  
        const imageRef = ref(storage, `profile_pictures/${profile.phoneNumber}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        setProfile((prev) => ({ ...prev, imageUrl: downloadURL }));
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
        <ActivityIndicator size="large" color="#F38301" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} /> 
        </View>

        
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleImageUpload}>
            {profile.imageUrl ? (
              <Image 
                source={{ uri: profile.imageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#888" />
              </View>
            )}
            <View style={styles.editIcon}>
              <MaterialIcons name="edit" size={18} color="white" />
            </View>
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        
        <View style={styles.formContainer}>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
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
          </View>

          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={profile.password}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, password: text }))}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons 
                  name={isPasswordVisible ? "eye-off" : "eye"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
          </View>

            <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#f5f5f5' }]}>
              <TextInput
                style={[styles.input, { color: '#666' }]}
                value={profile.phoneNumber}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={saveProfileToFirestore} 
          style={styles.saveButton}
        >
          <LinearGradient
            colors={['#F38301', '#F8A34D']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>

        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => router.push('/credentials/signIn')}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#F38301',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F38301',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#F38301',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#F38301',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;