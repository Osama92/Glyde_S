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
//       />

//       {/* Display Email */}
//       <Text style={styles.label}>Display Email</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.email}
//         onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
//       />

//       {/* Display password */}
//       <Text style={styles.label}>Change Password</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.password}
//         onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
//       />

//       {/* Save Button */}
//       <TouchableOpacity onPress={saveProfileToFirestore} style={[styles.button, styles.saveButton]}>
//         <Text style={styles.saveButtonText}>Save</Text>
//       </TouchableOpacity>

         
//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton}>
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


import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { app } from "../firebase";

const db = getFirestore(app);

const collections = [
  { id: 'deliverydriver', name: 'Delivery Driver' },
  { id: 'customer', name: 'Customer' },
  { id: 'transporter', name: 'Transporter' },
  { id: 'fieldagent', name: 'Field Agent' },
];

const AddUserScreen: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [assignedVanNo, setAssignedVanNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [transporter, setTransporter] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [route, setRoute] = useState('');

  const handleSave = async () => {
    if (!selectedCollection) {
      Alert.alert('Error', 'Please select a collection');
      return;
    }

    if (selectedCollection === 'deliverydriver' && (!phoneNumber || !name || !assignedVanNo || !transporter || !password)) {
      Alert.alert('Error', 'All fields are required for Delivery Driver');
      return;
    }

    if (selectedCollection === 'customer' && (!name || !email || !password || !phoneNumber || !route)) {
      Alert.alert('Error', 'All fields are required for Customer');
      return;
    }

    const uid = `${phoneNumber}_${name}`;
    const userData: Record<string, any> = { uid };

    if (selectedCollection === 'deliverydriver') {
      Object.assign(userData, {
        AssignedVanNo: assignedVanNo,
        phoneNumber: phoneNumber,
        name: name,
        Transporter: transporter,
        password: password,
      });
    }

    if (selectedCollection === 'customer') {
      Object.assign(userData, {
        name: name,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        route: route,
      });
    }

    try {
      await setDoc(doc(db, selectedCollection, uid), userData);
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
      console.error(error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Select Collection</Text>
      <SearchableDropdown
        onItemSelect={(item) => {
          console.log('Selected Collection:', item.id);
          setSelectedCollection(item.id);
        }}
        items={collections}
        placeholder={selectedCollection ? collections.find(c => c.id === selectedCollection)?.name : 'Select Collection'}
      />

      {selectedCollection === 'deliverydriver' && (
        <View>
          <Text>Assigned Van No</Text>
          <TextInput value={assignedVanNo} onChangeText={setAssignedVanNo} style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Phone Number</Text>
          <TextInput value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Name</Text>
          <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Transporter</Text>
          <TextInput value={transporter} onChangeText={setTransporter} style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10 }} />
        </View>
      )}

      {selectedCollection === 'customer' && (
        <View>
          <Text>Name</Text>
          <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Email</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Phone Number</Text>
          <TextInput value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={{ borderWidth: 1, marginBottom: 10 }} />

          <Text>Route</Text>
          <TextInput value={route} onChangeText={setRoute} style={{ borderWidth: 1, marginBottom: 10 }} />
        </View>
      )}

      <Button title="Save User" onPress={handleSave} />
    </View>
  );
};

export default AddUserScreen;
