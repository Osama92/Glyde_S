// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { app } from "../firebase";
// import { getFirestore, collection, addDoc } from "firebase/firestore";
// import * as Font from "expo-font";




// const db = getFirestore(app);

// export default function DriverOnboarding() {
//   const [fontsLoaded, setFontsLoaded] = useState(false);
//   const [vehicleNo, setVehicleNo] = useState("");
//   const [transporter, setTransporter] = useState("");
//   const [driver, setDriver] = useState("");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [driverImage, setDriverImage] = useState(null);
//   const [licenseImage, setLicenseImage] = useState(null);

//   const loadFonts = () => {
//     return Font.loadAsync({
//       Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
//       Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
//     });
//   };

//   const pickImage = async (setImage) => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       Alert.alert("Permission required", "Camera roll access is required to select images.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
//     if (!result.canceled) {
//       setImage(result.uri);
//     }
//   };

//   const takePicture = async (setImage) => {
//     const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
//     if (!permissionResult.granted) {
//       Alert.alert("Permission required", "Camera access is required to take pictures.");
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync();
//     if (!result.canceled) {
//       setImage(result.uri);
//     }
//   };

//   const saveData = async () => {
//     if (!vehicleNo || !transporter || !driver || !mobileNumber || !driverImage || !licenseImage) {
//       Alert.alert("Error", "All fields and images are required.");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "DriverOnBoarding"), {
//         vehicleNo,
//         transporter,
//         driver,
//         mobileNumber,
//         driverImage,
//         licenseImage,
//         createdAt: new Date(),
//       });
//       Alert.alert("Success", "Driver onboarded successfully!");
//       setVehicleNo("");
//       setTransporter("");
//       setDriver("");
//       setMobileNumber("");
//       setDriverImage(null);
//       setLicenseImage(null);
//     } catch (error) {
//       console.error("Error saving to Firestore:", error);
//       Alert.alert("Error", "Failed to onboard driver.");
//     }
//   };

//   if (!fontsLoaded) {
//     return <AppLoading startAsync={loadFonts} onFinish={() => setFontsLoaded(true)} onError={console.warn} />;
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Driver Onboarding</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Vehicle No"
//         value={vehicleNo}
//         onChangeText={setVehicleNo}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Transporter"
//         value={transporter}
//         onChangeText={setTransporter}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Driver"
//         value={driver}
//         onChangeText={setDriver}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Mobile Number"
//         keyboardType="phone-pad"
//         value={mobileNumber}
//         onChangeText={setMobileNumber}
//       />

//       <Text style={styles.label}>Driver's Picture:</Text>
//       {driverImage && <Image source={{ uri: driverImage }} style={styles.image} />}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.button} onPress={() => takePicture(setDriverImage)}>
//           <Text style={styles.buttonText}>Take Picture</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={() => pickImage(setDriverImage)}>
//           <Text style={styles.buttonText}>Upload Picture</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.label}>Driver's License:</Text>
//       {licenseImage && <Image source={{ uri: licenseImage }} style={styles.image} />}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.button} onPress={() => takePicture(setLicenseImage)}>
//           <Text style={styles.buttonText}>Take Picture</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={() => pickImage(setLicenseImage)}>
//           <Text style={styles.buttonText}>Upload Picture</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.saveButton} onPress={saveData}>
//         <Text style={styles.saveButtonText}>Save</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontFamily: "MontserratBold",
//     fontSize: 24,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     fontFamily: "Montserrat",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   label: {
//     fontFamily: "Montserrat",
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   image: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   button: {
//     flex: 1,
//     backgroundColor: "#007BFF",
//     padding: 12,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   buttonText: {
//     fontFamily: "Montserrat",
//     color: "#fff",
//     textAlign: "center",
//   },
//   saveButton: {
//     backgroundColor: "#28A745",
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   saveButtonText: {
//     fontFamily: "MontserratBold",
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 18,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc,getFirestore } from 'firebase/firestore';
import { app } from "../firebase"; // Update this path based on your project structure
import { useFonts } from 'expo-font';

const db = getFirestore(app);

export default function ManageDriver() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
      Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
      Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Fix for accessing the `uri` property
    }
  };

  const takePhoto = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Fix for accessing the `uri` property
    }
  };

  const saveToFirestore = async () => {
    if (!vehicleNo || !transporter || !driverName || !mobileNumber || !driverPhoto || !licencePhoto) {
      alert('Please fill all fields and upload all photos');
      return;
    }

    setLoading(true);

    try {
      const docId = `${transporter}-${vehicleNo}`; // Customize document ID logic if needed
      await setDoc(doc(db, 'DriverOnBoarding', docId), {
        vehicleNo,
        transporter,
        driverName,
        mobileNumber,
        driverPhoto,
        licencePhoto,
      });
      alert('Data saved successfully!');
      setVehicleNo('');
      setTransporter('');
      setDriverName('');
      setMobileNumber('');
      setDriverPhoto(null);
      setLicencePhoto(null);
    } catch (error) {
      console.error('Error saving data to Firestore:', error);
      alert('Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Driver Onboarding</Text>

      <TextInput
        placeholder="Vehicle No"
        value={vehicleNo}
        onChangeText={setVehicleNo}
        style={styles.input}
      />
      <TextInput
        placeholder="Transporter"
        value={transporter}
        onChangeText={setTransporter}
        style={styles.input}
      />
      <TextInput
        placeholder="Driver Name"
        value={driverName}
        onChangeText={setDriverName}
        style={styles.input}
      />
      <TextInput
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <View style={styles.imageSection}>
        <Text style={styles.label}>Driver Photo</Text>
        <View style={styles.imageActions}>
          <TouchableOpacity onPress={() => takePhoto(setDriverPhoto)} style={styles.button}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(setDriverPhoto)} style={styles.button}>
            <Text style={styles.buttonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        {driverPhoto && <Image source={{ uri: driverPhoto }} style={styles.image} />}
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Driver Licence</Text>
        <View style={styles.imageActions}>
          <TouchableOpacity onPress={() => takePhoto(setLicencePhoto)} style={styles.button}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(setLicencePhoto)} style={styles.button}>
            <Text style={styles.buttonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        {licencePhoto && <Image source={{ uri: licencePhoto }} style={styles.image} />}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity onPress={saveToFirestore} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'MontserratExtraBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'Montserrat',
  },
  imageSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'MontserratExtraBold',
    marginBottom: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Montserrat',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'MontserratExtraBold',
    fontSize: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
