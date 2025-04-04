import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, setDoc, getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import axios from 'axios';
import OriginPointSelector from '../utilities/originPointSelector';
import StateSelector from '../utilities/stateSelector';
import LGASelector from '../utilities/lgaSelector';

// Load Nigerian states data
import statesData from '../nigerian-states.json';

// Initialize Firestore
const db = getFirestore(app);

// Truck types data
const truckTypes = [
  { id: '1', name: 'Bus 3 tons', tonnage: 0.8 },
  { id: '2', name: 'Truck 5 tons', tonnage: 4000 },
  { id: '3', name: 'Truck 10 tons', tonnage: 9000 },
  { id: '4', name: 'Truck 15 tons', tonnage: 14000 },
  { id: '5', name: 'Truck 20 tons', tonnage: 19000 },
  { id: '6', name: 'Truck 30 tons', tonnage: 28000 },
];

// Google Maps API Config
const GOOGLE_API_KEY = 'AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0'; // Replace with your actual API key

export default function CreateRoute() {
  const [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Bold.ttf"),
    Nunito: require("../../assets/fonts/Nunito-Regular.ttf"),
  });
  
  const router = useRouter();
  
  // Form state
  const [originPoints, setOriginPoints] = useState<any[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedLGA, setSelectedLGA] = useState<any>(null);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [distance, setDistance] = useState<string>('');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [freightCost, setFreightCost] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [calculatingDistance, setCalculatingDistance] = useState<boolean>(false);
  const [fetchingOrigins, setFetchingOrigins] = useState<boolean>(true);
  
  // Derived data
  const [lgas, setLgas] = useState<any[]>([]);
  const [routeDescription, setRouteDescription] = useState<string>('');

  // Fetch origin points from Firestore
  useEffect(() => {
    const fetchOriginPoints = async () => {
      try {
        setFetchingOrigins(true);
        const querySnapshot = await getDocs(collection(db, 'originPoint'));
        const points = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          latitude: doc.data().latitude,
          longitude: doc.data().longitude,
          ...doc.data()
        }));
        setOriginPoints(points);
      } catch (error) {
        console.error('Error fetching origin points:', error);
        Alert.alert('Error', 'Failed to load origin points');
      } finally {
        setFetchingOrigins(false);
      }
    };

    fetchOriginPoints();
  }, []);

  // Update LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      const stateLgas = statesData[selectedState.name as keyof typeof statesData] || [];
      setLgas(stateLgas.map(lga => ({ id: lga, name: lga })));
      setSelectedLGA(null);
      setDistance('');
      setRouteDescription('');
    }
  }, [selectedState]);

  // Calculate distance when both origin and destination are selected
  useEffect(() => {
    if (selectedOrigin && selectedLGA) {
      setRouteDescription(`${selectedOrigin.name} to ${selectedLGA.name}`);
      calculateDistance(selectedOrigin, selectedLGA.name);
    }
  }, [selectedOrigin, selectedLGA]);

  // Calculate distance using Google Distance Matrix API
  const calculateDistance = async (origin: any, destination: string) => {
    if (!origin.latitude || !origin.longitude) {
      Alert.alert('Error', 'Origin coordinates not available');
      return;
    }

    setCalculatingDistance(true);
    setDistance('Calculating...');
    
    try {
      const originCoords = `${origin.latitude},${origin.longitude}`;
      // Note: For LGAs we'd ideally have coordinates, but using the name as destination
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric` +
        `&origins=${originCoords}` +
        `&destinations=${encodeURIComponent(destination + ', Nigeria')}` +
        `&key=${GOOGLE_API_KEY}`
      );

      if (response.data.status === 'OK') {
        const result = response.data.rows[0].elements[0];
        if (result.status === 'OK') {
          setDistance(`${result.distance.text}`);
          setDistanceMeters(result.distance.value);
        } else {
          throw new Error(result.status);
        }
      } else {
        throw new Error(response.data.status);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      Alert.alert('Error', 'Could not calculate distance');
      setDistance('N/A');
      setDistanceMeters(0);
    } finally {
      setCalculatingDistance(false);
    }
  };

const saveRoute = async () => {
    if (!selectedOrigin || !selectedState || !selectedLGA || !selectedTruck || !freightCost) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
  
    // Validate freight cost is a valid number
    const costValue = parseFloat(freightCost);
    if (isNaN(costValue)) {
      Alert.alert('Error', 'Please enter a valid freight cost');
      return;
    }
  
    setLoading(true);
    try {
      console.log('Creating route with data:', {
        origin: selectedOrigin.name,
        destination: selectedLGA.name,
        truckType: selectedTruck,
        freightCost: costValue
      });
  
      const routeData = {
        origin: selectedOrigin.name,
        originId: selectedOrigin.id,
        originCoordinates: {
          latitude: selectedOrigin.latitude,
          longitude: selectedOrigin.longitude
        },
        destination: selectedLGA.name,
        state: selectedState.name,
        lga: selectedLGA.name,
        truckType: selectedTruck, // Changed from selectedTruck.name
        tonnage: truckTypes.find(t => t.name === selectedTruck)?.tonnage || 0,
        distance: distance,
        distanceMeters: distanceMeters,
        freightCost: costValue,
        description: routeDescription,
        createdAt: new Date().toISOString(),
      };
  
      // Generate a unique ID for the route
      const routeId = `${selectedOrigin.id}_${selectedState.name.replace(/\s+/g, '_')}_${selectedLGA.name.replace(/\s+/g, '_')}_${Date.now()}`;
      
      console.log('Saving to Firestore with ID:', routeId);
      console.log('Full route data:', routeData);
  
      await setDoc(doc(db, 'routes', routeId), routeData);
      
      Alert.alert('Success', 'Route created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error saving route:', error);
      Alert.alert(
        'Error', 
        `Failed to save route: ${error.message}`,
        [{ text: 'OK', onPress: () => console.log('Error acknowledged') }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Route</Text>
        </View>

        {/* Origin Point Selection */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Select Origin Point</Text> */}
          {fetchingOrigins ? (
            <ActivityIndicator size="small" color="orange" />
          ) : (
            <OriginPointSelector 
                originPoints={originPoints}
                selectedOrigin={selectedOrigin}
                setSelectedOrigin={setSelectedOrigin}
            />
          )}
        </View>

        {/* State Selection */}
        <View style={styles.section}>
           <StateSelector state={Object.keys(statesData).map(state => ({ id: state, name: state }))}
                          selectedState={selectedState} 
                          setSelectedState={setSelectedState}/>
        </View>

        {/* LGA Selection (only enabled when state is selected) */}
        <View style={styles.section}>
          <LGASelector lga={lgas} 
                       selectedLGA={selectedLGA} 
                       setSelectedLGA={setSelectedLGA}/>
        </View>

        {/* Route Description */}
        {routeDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Description</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{routeDescription}</Text>
            </View>
          </View>
        )}

        {/* Distance */}
        {distance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <View style={styles.readOnlyField}>
              {calculatingDistance ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="orange" style={{ marginRight: 10 }} />
                  <Text>Calculating...</Text>
                </View>
              ) : (
                <Text style={styles.readOnlyText}>{distance}</Text>
              )}
            </View>
          </View>
        )}

        {/* Truck Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Truck Type</Text>
          <SearchableDropdown
            onItemSelect={(item: any) => setSelectedTruck(item.name)}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            items={truckTypes}
            placeholdercolor={'#999'}
            placeholder={selectedTruck ? truckTypes?.find((c) => c.name === selectedTruck)?.name : 'Choose a truck type'}
            resetValue={false}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Freight Cost */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Freight Cost (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount in Naira"
            keyboardType="numeric"
            value={freightCost}
            onChangeText={setFreightCost}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (loading || calculatingDistance) && styles.disabledButton
          ]}
          onPress={saveRoute}
          disabled={loading || calculatingDistance}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Create Route</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  dropdownContainer: {
    padding: 0,
  },
  dropdownInput: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFF',
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#888',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  dropdownItemText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  readOnlyField: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  readOnlyText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFF',
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  saveButton: {
    backgroundColor: 'orange',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A0C4F8',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
});