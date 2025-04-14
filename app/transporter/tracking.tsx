import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useLocalSearchParams, router } from 'expo-router';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { debounce } from 'lodash';
import { getDistance, getSpeed } from 'geolib';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Custom Marker Component with Animation
const VehicleMarker = React.memo(({ vehicle, speed, selected }: { vehicle: any, speed: number, selected: boolean }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected) {
      // Pulse animation for selected vehicle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      ).start();
    } else {
      pulseValue.stopAnimation();
      pulseValue.setValue(0);
    }
  }, [selected]);

  const getMarkerColor = () => {
    if (speed === 0) return '#FF5722'; // Stopped
    if (speed < 30) return '#FFC107'; // Slow
    if (speed < 70) return '#4CAF50'; // Normal
    return '#F44336'; // Speeding
  };

  return (
    <View>
      <Animated.View style={{
        transform: [{ scale: scaleValue }],
        opacity: pulseValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }}>
        <View style={[styles.markerContainer, { 
          backgroundColor: getMarkerColor(),
          borderColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
        }]}>
          <Image 
            source={require('../../assets/images/truck.png')}
            resizeMode="contain" 
            style={[styles.vehicleIcon, {
              tintColor: '#FFFFFF',
              transform: [{ rotate: `${speed > 5 ? Math.sin(Date.now()/300) * 10 : 0}deg` }]
            }]}
          />
          <View style={styles.speedBadge}>
            <Text style={styles.speedBadgeText}>{speed.toFixed(0)}</Text>
          </View>
        </View>
        <View style={[styles.markerArrow, { 
          borderBottomColor: getMarkerColor(),
          borderTopColor: selected ? '#FFFFFF' : 'transparent'
        }]} />
      </Animated.View>
      {selected && (
        <View style={styles.markerLabel}>
          <Text style={styles.markerLabelText}>{vehicle.AssignedVanNo}</Text>
        </View>
      )}
    </View>
  );
});

const VehicleTrackerScreen = () => {
  const { transporterName } = useLocalSearchParams<{ transporterName: string }>();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [tracking, setTracking] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<any>(null);
  const lastPosition = useRef<any>(null);
  const updateInterval = useRef<NodeJS.Timeout>();

  // Optimized Firebase data fetching with debounce
  const fetchVehicles = useCallback(debounce(async () => {
    try {
      const q = query(
        collection(db, 'deliverydriver'),
        where('Transporter', '==', transporterName)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedVehicles: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.AssignedVanNo && (data.Latitude || data.latitude)) {
            loadedVehicles.push({
              id: doc.id,
              ...data,
              latitude: data.Latitude || data.latitude,
              longitude: data.Longitude || data.longitude,
              name: data.name || 'Driver',
              phoneNumber: data.phoneNumber || ''
            });
          }
        });
        setVehicles(loadedVehicles);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  }, 500), [transporterName]);

  // Calculate speed and update position efficiently
  const updateVehiclePosition = useCallback((newPosition: any) => {
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString());
    
    if (lastPosition.current) {
      const distance = getDistance(
        { latitude: lastPosition.current.latitude, longitude: lastPosition.current.longitude },
        { latitude: newPosition.latitude, longitude: newPosition.longitude }
      );
      const timeDiff = (now.getTime() - lastPosition.current.timestamp) / 1000;
      const calculatedSpeed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0;
      
      // Smooth speed calculation
      setSpeed(prev => (prev * 0.7) + (calculatedSpeed * 0.3));
    }
    
    lastPosition.current = {
      ...newPosition,
      timestamp: now.getTime()
    };
    
    setCurrentLocation(newPosition);
    setRouteCoordinates(prev => [...prev.slice(-50), newPosition]);
    
    // Efficient map following with debounce
    debouncedAnimateMap(newPosition);
  }, []);

  const debouncedAnimateMap = useCallback(debounce((position: any) => {
    mapRef.current?.animateToRegion({
      latitude: position.latitude,
      longitude: position.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }, 500);
  }, 1000), []);

  // Start/stop tracking with optimized location updates
//   const toggleTracking = async () => {
//     if (tracking) {
//       if (locationSubscription.current) {
//         locationSubscription.current.remove();
//       }
//       if (updateInterval.current) {
//         clearInterval(updateInterval.current);
//       }
//       setTracking(false);
//       return;
//     }

//     if (!selectedVehicle) {
//       alert('Please select a vehicle first');
//       return;
//     }

//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       alert('Permission to access location was denied');
//       return;
//     }

//     setTracking(true);
//     setRouteCoordinates([]);

//     // Optimized location tracking with reduced updates
//     locationSubscription.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.BestForNavigation,
//         timeInterval: 5000,  // Reduced update frequency
//         distanceInterval: 10,
//       },
//       (location) => {
//         updateVehiclePosition({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           speed: location.coords.speed || 0
//         });
//       }
//     );
//   };

  // Initialize and clean up
  useEffect(() => {
    const unsubscribe = fetchVehicles();
    return () => {
      if (unsubscribe) unsubscribe();
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [fetchVehicles]);

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.AssignedVanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1A237E', '#3F51B5']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fleet Tracker Pro</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Interactive Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 6.5244,
          longitude: 3.3792,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={false}
        showsTraffic={true}
        showsBuildings={true}
        loadingEnabled={true}
        toolbarEnabled={true}
        mapPadding={{ top: 80, right: 20, bottom: 200, left: 20 }}
      >
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            coordinate={{
              latitude: vehicle.latitude,
              longitude: vehicle.longitude
            }}
            onPress={() => setSelectedVehicle(vehicle)}
          >
            <VehicleMarker 
              vehicle={vehicle} 
              speed={vehicle.speed || 1} 
              selected={selectedVehicle?.id === vehicle.id}
            />
          </Marker>
        ))}

        {tracking && currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            }}
          >
            <VehicleMarker 
              vehicle={selectedVehicle} 
              speed={speed} 
              selected={true}
            />
          </Marker>
        )}

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#3F51B5"
            strokeWidth={4}
            strokeColors={['#7F0000', '#00000000']}
          />
        )}
      </MapView>

      {/* Vehicle Info Card */}
      {selectedVehicle && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="local-shipping" size={24} color="#FFF" />
            <Text style={styles.infoTitle}>{selectedVehicle.AssignedVanNo}</Text>
            <View style={styles.infoStatus}>
              <View style={[
                styles.statusIndicator,
                speed === 0 && styles.statusStopped,
                speed > 0 && speed < 30 && styles.statusSlow,
                speed >= 30 && speed < 70 && styles.statusNormal,
                speed >= 70 && styles.statusSpeeding
              ]} />
              <Text style={styles.statusText}>
                {speed === 0 ? 'Stopped' : 
                 speed < 30 ? 'Moving Slow' : 
                 speed < 70 ? 'Moving' : 'Speeding'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Driver</Text>
              <Text style={styles.infoValue}>{selectedVehicle.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Speed</Text>
              <Text style={styles.infoValue}>{speed.toFixed(1)} km/h</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Transporter</Text>
              <Text style={styles.infoValue}>{selectedVehicle.Transporter}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Update</Text>
              <Text style={styles.infoValue}>{lastUpdate || 'N/A'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search and Control Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.controlPanel}
        keyboardVerticalOffset={20}
      >
        <View style={styles.searchContainer}>
          <SearchableDropdown
            onTextChange={setSearchQuery}
            onItemSelect={(item: any) => {
              setSelectedVehicle(item);
              mapRef.current?.animateToRegion({
                latitude: item.latitude,
                longitude: item.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }, 500);
            }}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.searchInput}
            items={filteredVehicles.map(v => ({
              ...v,
              name: `${v.AssignedVanNo} - ${v.name}`
            }))}
            placeholder="Search vehicle..."
            placeholderTextColor="#999"
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={styles.dropdownItemsContainer}
            resetValue={false}
            underlineColorAndroid="transparent"
          />
        </View>
        
        {/* <TouchableOpacity 
          style={[
            styles.controlButton,
            tracking && styles.stopButton,
            !selectedVehicle && styles.disabledButton
          ]}
          onPress={toggleTracking}
          disabled={!selectedVehicle}
        >
          <MaterialIcons 
            name={tracking ? 'stop' : 'play-arrow'} 
            size={24} 
            color="#FFF" 
          />
          <Text style={styles.controlButtonText}>
            {tracking ? 'STOP TRACKING' : 'START TRACKING'}
          </Text>
        </TouchableOpacity> */}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  vehicleIcon: {
    width: 24,
    height: 24,
  },
  speedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 3,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  speedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -2,
  },
  markerLabel: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  markerLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  infoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusStopped: {
    backgroundColor: '#FF5722',
  },
  statusSlow: {
    backgroundColor: '#FFC107',
  },
  statusNormal: {
    backgroundColor: '#4CAF50',
  },
  statusSpeeding: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  dropdownContainer: {
    padding: 0,
  },
  searchInput: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    color: '#333',
    fontSize: 16,
  },
  dropdownItem: {
    padding: 12,
    marginTop: 2,
    backgroundColor: '#FFF',
    borderColor: '#EEE',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    marginTop: 5,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F51B5',
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
    opacity: 0.7,
  },
  controlButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default VehicleTrackerScreen;