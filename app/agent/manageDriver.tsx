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
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from "../firebase"; 
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import SearchableDropdown from "react-native-searchable-dropdown"; 
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const db = getFirestore(app);
const storage = getStorage(app, "gs://glyde-f716b.firebasestorage.app");

export default function ManageDriver() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [fontsLoaded] = useFonts({
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    const fetchTransporters = async () => {
      setLoadingTransporters(true);
      try {
        const transportersQuery = query(
          collection(db, 'transporter'),
          where('loadingPoint', '==', 'Agbara')
        );
        const querySnapshot = await getDocs(transportersQuery);
        const transportersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransporters(transportersList);
      } catch (error) {
        console.error('Error fetching transporters:', error);
        Alert.alert('Error', 'Failed to fetch transporters.');
      } finally {
        setLoadingTransporters(false);
      }
    };

    fetchTransporters();
  }, []);

  const fetchVehicles = async (transporterId: string) => {
    try {
      const vehiclesQuery = query(collection(db, 'transporter', transporterId, 'VehicleNo'));
      const querySnapshot = await getDocs(vehiclesQuery);
      const vehiclesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Alert.alert('Error', 'Failed to fetch vehicles.');
    }
  };

  const uploadImageToStorage = async (uri: string, folder: string) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create unique filename with timestamp
      const filename = `${folder}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `DriverOnboarding/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>, type: 'driver' | 'licence') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadUrl = await uploadImageToStorage(result.assets[0].uri, type);
        setImage(uploadUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const takePhoto = async (setImage: React.Dispatch<React.SetStateAction<string | null>>, type: 'driver' | 'licence') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadUrl = await uploadImageToStorage(result.assets[0].uri, type);
        setImage(uploadUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const saveToFirestore = async () => {
    if (!vehicleNo || !transporter || !driverName || !mobileNumber || !driverPhoto || !licencePhoto) {
      Alert.alert('Error', 'Please fill all fields and upload all photos');
      return;
    }

    setLoading(true);

    try {
      const docId = `${transporter}-${vehicleNo}}`;
      await setDoc(doc(db, 'DriverOnBoarding', docId), {
        vehicleNo,
        tonnage: selectedVehicle?.tonnage || '',
        tons: selectedVehicle?.tons || 0,
        transporter,
        driverName,
        mobileNumber,
        driverPhoto,
        licencePhoto,
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Driver onboarding data saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving data to Firestore:', error);
      Alert.alert('Error', 'Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVehicleNo('');
    setTransporter('');
    setDriverName('');
    setMobileNumber('');
    setDriverPhoto(null);
    setLicencePhoto(null);
    setSelectedVehicle(null);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps={'handled'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver Onboarding</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Image Upload Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Photo</Text>
          <View style={styles.imageUploadContainer}>
            {driverPhoto ? (
              <Image source={{ uri: driverPhoto }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={40} color="#aaa" />
              </View>
            )}
            <View style={styles.imageActions}>
              <TouchableOpacity 
                onPress={() => takePhoto(setDriverPhoto, 'driver')} 
                style={styles.imageButton}
                disabled={uploading}
              >
                <Ionicons name="camera" size={20} color="#4A90E2" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => pickImage(setDriverPhoto, 'driver')} 
                style={styles.imageButton}
                disabled={uploading}
              >
                <Ionicons name="image" size={20} color="#4A90E2" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            {uploading && <ActivityIndicator size="small" color="#4A90E2" style={styles.uploadIndicator} />}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Licence</Text>
          <View style={styles.imageUploadContainer}>
            {licencePhoto ? (
              <Image source={{ uri: licencePhoto }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="card-membership" size={40} color="#aaa" />
              </View>
            )}
            <View style={styles.imageActions}>
              <TouchableOpacity 
                onPress={() => takePhoto(setLicencePhoto, 'licence')} 
                style={styles.imageButton}
                disabled={uploading}
              >
                <Ionicons name="camera" size={20} color="#4A90E2" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => pickImage(setLicencePhoto, 'licence')} 
                style={styles.imageButton}
                disabled={uploading}
              >
                <Ionicons name="image" size={20} color="#4A90E2" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          
          {loadingTransporters ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <SearchableDropdown
              onTextChange={(text: string) => setTransporter(text)}
              onItemSelect={(item: any) => {
                setTransporter(item.name);
                fetchVehicles(item.id);
              }}
              containerStyle={styles.dropdownContainer}
              textInputStyle={styles.dropdownInput}
              items={transporters.map((transporter) => ({
                id: transporter.id,
                name: transporter.name,
              }))}
              placeholder="Select Transporter"
              placeholderTextColor="#888"
              resetValue={false}
              itemStyle={styles.dropdownItem}
              underlineColorAndroid="transparent"
            />
          )}

          <SearchableDropdown
            onTextChange={(text: string) => setVehicleNo(text)}
            onItemSelect={(item: any) => {
              setVehicleNo(item.id);
              setSelectedVehicle(item);
            }}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            items={vehicles.map((vehicle) => ({
              id: vehicle.id,
              name: vehicle.id,
              ...vehicle,
            }))}
            placeholder="Select Vehicle No"
            placeholderTextColor="#888"
            resetValue={false}
            itemStyle={styles.dropdownItem}
            underlineColorAndroid="transparent"
          />

          {selectedVehicle && (
            <>
              <TextInput
                placeholder="Tonnage"
                value={selectedVehicle.tonnage || ''}
                style={styles.input}
                placeholderTextColor="#888"
                editable={false}
              />
              <TextInput
                placeholder="Tons"
                value={selectedVehicle.tons?.toString() || ''}
                style={styles.input}
                placeholderTextColor="#888"
                editable={false}
              />
            </>
          )}

          <TextInput
            placeholder="Driver Name"
            value={driverName}
            onChangeText={setDriverName}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#888"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={saveToFirestore} 
          style={styles.saveButton}
          disabled={loading || uploading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Driver</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  section: {
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  imageButtonText: {
    marginLeft: 5,
    color: '#4A90E2',
    fontWeight: '500',
  },
  uploadIndicator: {
    marginTop: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Nunito',
    color: '#333',
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    marginTop: 2,
    backgroundColor: "#f9f9f9",
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Nunito',
    color: '#333',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
  },
});