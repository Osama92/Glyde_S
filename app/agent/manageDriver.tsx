import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from "../firebase"; // Update this path based on your project structure
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import SearchableDropdown from "react-native-searchable-dropdown"; // Import the dropdown component

const db = getFirestore(app);

export default function ManageDriver() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transporters, setTransporters] = useState<any[]>([]); // State to store transporters
  const [loadingTransporters, setLoadingTransporters] = useState(false); // Loading state for transporters

  const [fontsLoaded] = useFonts({
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  // Fetch transporters from Firestore
  useEffect(() => {
    const fetchTransporters = async () => {
      setLoadingTransporters(true);
      try {
        const transportersQuery = query(
          collection(db, 'transporter'),
          where('loadingPoint', '==', 'Agbara') // Filter transporters with loadingPoint = 'agbara'
        );
        const querySnapshot = await getDocs(transportersQuery);
        const transportersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransporters(transportersList);
      } catch (error) {
        console.error('Error fetching transporters:', error);
        alert('Failed to fetch transporters.');
      } finally {
        setLoadingTransporters(false);
      }
    };

    fetchTransporters();
  }, []);

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
      //router.back();
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
    return <ActivityIndicator size="large" color="orange" style={styles.loading} />;
  }

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Capture</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/Back.png")}
            style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
          />
        </View>

        {/* Image Upload here */}
        <View style={styles.imageUploadContainer}>
          <Text style={styles.imageUploadText}>Insert Driver Photo here</Text>
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
        <View style={styles.imageUploadContainer}>
          <Text style={styles.imageUploadText}>Insert Licence here</Text>
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

        <TextInput
          placeholder="Vehicle No"
          value={vehicleNo}
          onChangeText={setVehicleNo}
          style={styles.input}
          placeholderTextColor='#000'
        />

        {/* Searchable Dropdown for Transporter */}
        {loadingTransporters ? (
          <ActivityIndicator size="small" color="orange" />
        ) : (
          <SearchableDropdown
            onTextChange={(text: string) => setTransporter(text)}
            onItemSelect={(item: any) => setTransporter(item.name)} 
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            items={transporters.map((transporter) => ({
              id: transporter.id,
              name: transporter.name,
            }))}
            placeholder={transporter ? transporter : 'Select Transporter'}
            placeholderTextColor="#000"
            resetValue={false}
            itemStyle={styles.item}
            underlineColorAndroid="transparent"
          />
        )}
        <TextInput
          placeholder="Driver Name"
          value={driverName}
          onChangeText={setDriverName}
          style={styles.input}
          placeholderTextColor='#000'
        />
        <TextInput
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor='#000'
        />

        {loading ? (
          <ActivityIndicator size="large" color="orange" />
        ) : (
          <TouchableOpacity onPress={saveToFirestore} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontFamily: 'Poppins',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Nunito',
    height: 50,
  },
  imageUploadContainer: {
    borderStyle: 'dashed',
    borderColor: 'lightgrey',
    width: '100%',
    height: 150,
    borderRadius: 5,
    borderWidth: 1.5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadText: {
    fontFamily: 'Poppins',
    color: 'grey',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'black',
    padding: 5,
    margin: 5,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Nunito',
    fontSize: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    
    marginBottom: 20,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontFamily: 'Nunito',
    height: 50,
    //backgroundColor: "#f9f9f9",
  },
  item: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  }
});