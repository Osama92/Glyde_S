import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, Linking, Platform, RefreshControl, Dimensions, BackHandler, AppState, AppStateStatus } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useLocalSearchParams } from 'expo-router';
import { doc, collection, onSnapshot, updateDoc, query, where, writeBatch, getDocs, Timestamp, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

const { width: screenWidth } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type DeliveryStatus = 'Pending' | 'Ongoing' | 'Delivered' | 'Cancelled';

type MaterialItem = {
  name: string;
  quantity: number;
  weight: number;
};

type Delivery = {
  id: string;
  customer: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  statusId: number;
  status?: DeliveryStatus;
  deliveryNumber?: string;
  podImageUrl?: string;
  eta?: string;
  distance?: string;
  materials?: MaterialItem[];
  deliveredAt?: string;
  sequence?: number;
  attemptCount?: number;
};

type Shipment = {
  id: string;
  statusId: number;
  deliveries: Delivery[];
  transporter?: string;
  vehicleNo?: string;
  tonnage?: string;
  route?: string;
  createdAt?: string;
};

type DriverProfile = {
  name: string;
  phoneNumber: string;
  profileImage?: string;
  vehicleNo?: string;
};

type LocationData = {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string;
};

const DriverDashboard = () => {
  const { transporterName } = useLocalSearchParams<{ transporterName: string }>();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [pastShipments, setPastShipments] = useState<Shipment[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showPODModal, setShowPODModal] = useState(false);
  const [podImage, setPodImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  const [deliveryToConfirm, setDeliveryToConfirm] = useState<Delivery | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [podModalBlocked, setPodModalBlocked] = useState(false);
  const shipmentUnsubscribeRef = useRef<() => void>();
  const deliveriesUnsubscribeRef = useRef<() => void>();
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [appState, setAppState] = useState(AppState.currentState);
  const [cancellationReason, setCancellationReason] = useState('');


  // Notification listener
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotificationMessage(notification.request.content.body);
      setNotificationModalVisible(true);
    });

    return () => subscription.remove();
  }, []);


useEffect(() => {
  let isMounted = true;
  let locationSubscription: Location.LocationSubscription | null = null;
  let appStateSubscription: any = null;

  const startLocationTracking = async () => {
    try {
      console.log('Attempting to start location tracking...');
      
      // Check location services
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable device location services to continue',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for delivery tracking',
          [{ text: 'OK', onPress: () => Linking.openSettings() }]
        );
        return false;
      }

      // Start background location updates
      console.log('Starting location updates...');
      await Location.startLocationUpdatesAsync('driverLocation', {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50,
        timeInterval: 10000,
        foregroundService: {
          notificationTitle: 'Delivery Tracking Active',
          notificationBody: 'Tracking your location for deliveries',
          notificationColor: '#FF6347',
        },
        showsBackgroundLocationIndicator: true,
      });

      // Get initial position
      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      if (isMounted) {
        setCurrentLocation({
          latitude: initialPosition.coords.latitude,
          longitude: initialPosition.coords.longitude,
          speed: initialPosition.coords.speed ?? undefined,
          timestamp: new Date().toISOString(),
        });
      }

      // Set up continuous updates
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
          timeInterval: 10000,
        },
        (location) => {
          if (isMounted) {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed ?? undefined,
              timestamp: new Date().toISOString(),
            });
            updateDriverLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed ?? undefined,
            });
          }
        }
      );

      console.log('Location tracking started successfully');
      return true;

    } catch (error: any) {
      console.error('Location tracking error:', error);
      if (isMounted) {
        Alert.alert(
          'Location Error',
          error.message || 'Failed to start location tracking'
        );
      }
      return false;
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
    if (nextAppState === 'active' && isMounted) {
      console.log('App became active, starting location tracking...');
      await startLocationTracking();
    }
  };

  // Initialize
  const initializeLocationTracking = async () => {
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Start immediately if app is active
    if (appState === 'active') {
      const success = await startLocationTracking();
      if (!success && isMounted) {
        setLoading(false); // Unblock UI if location fails
      }
    } else {
      console.log('App not in foreground, waiting to start tracking...');
    }
  };

  initializeLocationTracking();

  return () => {
    isMounted = false;
    if (appStateSubscription) appStateSubscription.remove();
    if (locationSubscription) locationSubscription.remove();
    
    Location.stopLocationUpdatesAsync('driverLocation')
      .then(() => console.log('Location tracking stopped'))
      .catch(err => console.warn('Error stopping location:', err));
  };
}, []);

  // Handle back button when POD modal is open
  useEffect(() => {
    const backAction = () => {
      if (showPODModal && podModalBlocked) {
        Alert.alert('Hold on!', 'You need to upload POD before exiting', [
          { text: 'OK', onPress: () => null }
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [showPODModal, podModalBlocked]);

  const updateDriverLocation = async (location: LocationData) => {
    if (!phoneNumber) return;
    
    try {
      const driversRef = collection(db, 'deliverydriver');
      const q = query(driversRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const driverDoc = querySnapshot.docs[0];
        const updateData: any = {
          latitude: location.latitude,
          longitude: location.longitude,
          lastUpdated: Timestamp.now(),
        };
        
        // Only include speed if available (convert from m/s to km/h)
        if (location.speed !== undefined) {
          updateData.speed = Math.round(location.speed * 3.6); // Convert to km/h
        }
        
        await updateDoc(doc(db, 'deliverydriver', driverDoc.id), updateData);
        
        // Also update ETA for current delivery if needed
        if (selectedDelivery?.status === 'Ongoing') {
          updateDeliveryETA(selectedDelivery);
        }
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  };

  const cleanupDriverData = async () => {
    if (!phoneNumber) return;
    
    try {
      const driversRef = collection(db, 'deliverydriver');
      const q = query(driversRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const driverDoc = querySnapshot.docs[0];
        const data = driverDoc.data();
        
        // Check for old fields
        if (data.Latitude || data.Longitude) {
          await updateDoc(doc(db, 'deliverydriver', driverDoc.id), {
            latitude: data.Latitude || data.latitude,
            longitude: data.Longitude || data.longitude,
            Latitude: deleteField(),
            Longitude: deleteField(),
          });
        }
      }
    } catch (error) {
      console.error('Error cleaning up driver data:', error);
    }
  };

  // Initialize and get driver info
  useEffect(() => {
    const initialize = async () => {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Notifications permission is needed for updates');
      }

      const storedPhone = await AsyncStorage.getItem('phoneNumber');
      setPhoneNumber(storedPhone);

      if (storedPhone) {
        await cleanupDriverData();
        const driversRef = collection(db, 'deliverydriver');
        const q = query(driversRef, where('phoneNumber', '==', storedPhone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const driverData = querySnapshot.docs[0].data();
          setDriverProfile({
            name: driverData.name || 'Driver',
            phoneNumber: storedPhone,
            profileImage: driverData.profileImage,
            vehicleNo: driverData.vehicleNo
          });
        }
      }
    };

    initialize();
  }, []);

  // Real-time shipment status listener
  useEffect(() => {
    if (!phoneNumber) {
      console.log('Phone number not available yet');
      return;
    }
  
    console.log('Setting up listener for phone:', phoneNumber);
    
    const shipmentsRef = collection(db, 'Shipment');
    const q = query(
      shipmentsRef,
      where('mobileNumber', '==', phoneNumber),
      where('statusId', 'in', [1, 2, 3])
    );
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log('Query snapshot received with', querySnapshot.size, 'docs');
      
      if (querySnapshot.empty) {
        console.log('No matching shipments found');
        setShipment(null);
        return;
      }
  
      const shipmentDoc = querySnapshot.docs[0];
      const newData = shipmentDoc.data();
      
  
      if (newData.statusId === 2) {
        
        
        try {
          // Load deliveries
          const deliveriesRef = collection(db, 'Shipment', shipmentDoc.id, 'deliveries');
          const deliveriesSnapshot = await getDocs(deliveriesRef);
          
          const deliveries = deliveriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            status: getStatusText(doc.data().statusId)
          })) as Delivery[];
  
          // Update state
          setShipment({
            id: shipmentDoc.id,
            statusId: newData.statusId,
            ...newData,
            deliveries
          });
  
          // Show notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '📦 New Shipment!',
              body: `You have ${deliveries.length} deliveries to accept`,
              data: { shipmentId: shipmentDoc.id },
            },
            trigger: null,
          });
  
          // Show modal
          setShowAssignmentModal(true);
        } catch (error) {
          console.error('Error handling assignment:', error);
        }
      } else {
        // For other status changes, just update the data
        setShipment(prev => ({
          ...prev!,
          ...newData
        }));
      }
    });
  
    return unsubscribe;
  }, [phoneNumber]);

  // Real-time deliveries listener
  useEffect(() => {
    if (!shipment?.id) return;

    // Clean up previous listeners
    if (deliveriesUnsubscribeRef.current) {
      deliveriesUnsubscribeRef.current();
    }

    const deliveriesRef = collection(db, 'Shipment', shipment.id, 'deliveries');
    deliveriesUnsubscribeRef.current = onSnapshot(deliveriesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const delivery = change.doc.data() as Delivery;
          
          // Check if delivery status changed to 4 (Delivered)
          if (delivery.statusId === 4) {
            setSelectedDelivery(delivery);
            setPodModalBlocked(true);
            setShowPODModal(true);
          }
        }
      });
    });

    return () => {
      if (deliveriesUnsubscribeRef.current) {
        deliveriesUnsubscribeRef.current();
      }
    };
  }, [shipment?.id]);

  // Load shipments and deliveries
  const loadShipments = useCallback(async () => {
    try {
      if (!phoneNumber) {
        console.log('Waiting for phone number...');
        return;
      }
  
      setLoading(true);
      setRefreshing(true);
  
      const shipmentsRef = collection(db, 'Shipment');
      
      // Always load past shipments regardless of current shipment
      const pastShipmentsQuery = query(
        shipmentsRef,
        where('mobileNumber', '==', phoneNumber),
        where('statusId', 'in', [4, 5]) // Completed or Cancelled
      );
      const pastShipmentsSnapshot = await getDocs(pastShipmentsQuery);
      setPastShipments(pastShipmentsSnapshot.docs.map(doc => ({
        ...(doc.data() as Omit<Shipment, 'id'>),
        id: doc.id,
      })));
  
      // Load current shipment if exists
      const currentShipmentQuery = query(
        shipmentsRef,
        where('mobileNumber', '==', phoneNumber),
        where('statusId', 'in', [2, 3]) // Assigned or Ongoing
      );
      const currentShipmentSnapshot = await getDocs(currentShipmentQuery);
  
      if (currentShipmentSnapshot.empty) {
        console.log('No current shipments found');
        setShipment(null);
        return;
      }
  
      const shipmentDoc = currentShipmentSnapshot.docs[0];
      const deliveriesRef = collection(db, 'Shipment', shipmentDoc.id, 'deliveries');
      const deliveriesSnapshot = await getDocs(deliveriesRef);
  
      let deliveries = deliveriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        coordinates: doc.data().coordinates || { latitude: 0, longitude: 0 },
        status: getStatusText(doc.data().statusId)
      })) as Delivery[];
  
      if (deliveries.length > 1 && currentLocation) {
        deliveries = await optimizeDeliverySequence(deliveries, currentLocation);
      }
  
      setShipment({
        id: shipmentDoc.id,
        statusId: shipmentDoc.data().statusId,
        ...shipmentDoc.data(),
        deliveries
      });
  
      console.log('Data load successful');
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load shipments');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [phoneNumber, currentLocation]);

  useEffect(() => {
    if (phoneNumber && currentLocation && !initialLoadComplete) {
      console.log('All required data available, triggering load');
      loadShipments();
    }
  }, [phoneNumber, currentLocation, initialLoadComplete, loadShipments]);

  const getStatusText = (statusId: number): DeliveryStatus => {
    switch(statusId) {
      case 1: return 'Pending';
      case 2: return 'Pending';
      case 3: return 'Ongoing';
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Pending';
    }
  };

  const optimizeDeliverySequence = async (deliveries: Delivery[], origin: {latitude: number, longitude: number}) => {
    try {
      const destinations = deliveries
        .filter(d => d.statusId !== 4)
        .map(d => `${d.coordinates.latitude},${d.coordinates.longitude}`)
        .join('|');
  
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      if (response.data.status === 'OK') {
        const elements = response.data.rows[0].elements;
        
        return deliveries.map((delivery, index) => {
          if (index < elements.length && delivery.statusId !== 4) {
            return {
              ...delivery,
              distance: elements[index].distance?.text || 'N/A',
              eta: elements[index].duration?.text || 'N/A',
              sequence: index + 1
            };
          }
          return delivery;
        }).sort((a, b) => {
          if (a.statusId === 4) return 1;
          if (b.statusId === 4) return -1;
          return (a.sequence || 0) - (b.sequence || 0);
        });
      } else {
        console.warn('Google Maps API response:', response.data.status);
        return deliveries.map(d => ({
          ...d,
          distance: 'N/A',
          eta: 'N/A'
        }));
      }
    } catch (error) {
      console.error('Error optimizing delivery sequence:', error);
      return deliveries.map(d => ({
        ...d,
        distance: 'N/A',
        eta: 'N/A'
      }));
    }
  };
  

  const updateDeliveryETA = async (delivery: Delivery) => {
    if (!shipment || !currentLocation) return;
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${delivery.coordinates.latitude},${delivery.coordinates.longitude}&key=${GOOGLE_MAPS_API_KEY}&departure_time=now&traffic_model=best_guess`
      );
  
      let eta = 'Calculating...';
      let distance = 'Calculating...';
      let currentSpeed = currentLocation.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : 'N/A';
      
      if (response.data.status === 'OK' && response.data.routes?.[0]?.legs?.[0]) {
        const leg = response.data.routes[0].legs[0];
        eta = leg.duration_in_traffic?.text || leg.duration.text;
        distance = leg.distance.text;
        
        // Update with traffic data if available
        await updateDoc(doc(db, 'Shipment', shipment.id, 'deliveries', delivery.id), {
          eta,
          distance,
          currentSpeed,
          statusId: 3,
          lastLocationUpdate: new Date().toISOString(),
        });
      } else {
        console.warn('No route found:', response.data);
        // Fallback to simple distance calculation if API fails
        const simpleDistance = calculateSimpleDistance(
          currentLocation,
          delivery.coordinates
        );
        distance = `${simpleDistance.toFixed(1)} km`;
      }
  
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Delivery Started',
          body: `ETA to ${delivery.customer}: ${eta}`,
        },
        trigger: null,
      });
  
      await loadShipments();
    } catch (error: any) {
      console.error('ETA update error:', error);
      // Don't show alert for every error to avoid annoying the driver
    }
  };
  
  // Simple distance calculation fallback
  const calculateSimpleDistance = (loc1: {latitude: number, longitude: number}, loc2: {latitude: number, longitude: number}) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const onRefresh = useCallback(() => {
    loadShipments();
  }, [loadShipments]);

  const handleAssignmentResponse = async (accepted: boolean) => {
    if (!shipment) return;
  
    try {
      const newStatus = accepted ? 3 : 1; // 3 = Accepted, 1 = Available
      const batch = writeBatch(db);
  
      // Update shipment status
      const shipmentRef = doc(db, 'Shipment', shipment.id);
      batch.update(shipmentRef, { statusId: newStatus });
  
      if (accepted) {
        // Update all deliveries to ongoing (statusId 3)
        shipment.deliveries.forEach(delivery => {
          const deliveryRef = doc(db, 'Shipment', shipment.id, 'deliveries', delivery.id);
          batch.update(deliveryRef, { statusId: 3 });
        });
      

      // Set the first delivery as selected
      if (shipment.deliveries.length > 0) {
        setSelectedDelivery({
          ...shipment.deliveries[0],
          status: 'Ongoing'
        });
      }
    }
    
  
      await batch.commit();
  
      // Send appropriate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: accepted ? 'Shipment Accepted' : 'Shipment Declined',
          body: accepted 
            ? `You've accepted shipment ${shipment.id}`
            : `You've declined shipment ${shipment.id}`,
        },
        trigger: null,
      });
  
      setShowAssignmentModal(false);
      await loadShipments();
    } catch (error) {
      console.error('Assignment error:', error);
      Alert.alert('Error', 'Failed to update shipment status');
    }
  };


  const openGoogleMaps = (delivery: Delivery) => {
    const { latitude, longitude } = delivery.coordinates;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url!).then(supported => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`);
      }
    }).catch(err => {
      Alert.alert('Error', 'Could not open Google Maps');
      console.error('Error opening maps:', err);
    });
  };

  const capturePOD = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to capture POD');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const compressed = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      setPodImage(compressed.uri);
      setPodModalBlocked(false); // Allow exiting after capture
    }
  };

  const uploadPOD = async () => {

    if (!podImage) {
      Alert.alert('Error', 'Please capture POD image first');
      return;
    }

    if (!selectedDelivery || !selectedDelivery.deliveryNumber) {
      Alert.alert('Error', 'No delivery selected for POD upload');
      return;
    }
  
    setUploading(true);
    
    try {
      console.log('Starting POD upload process...');
      console.log('Image URI:', podImage);
  
      // 1. Validate image URI
      if (!podImage.startsWith('file://') && !podImage.startsWith('http')) {
        throw new Error(`Invalid image URI format: ${podImage}`);
      }
  
      // 2. Fetch the image file
      console.log('Fetching image file...');
      const response = await fetch(podImage);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
  
      // 3. Convert to blob
      console.log('Converting to blob...');
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
  
      // 4. Create storage reference with proper file extension
      const fileExtension = podImage.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `POD_${shipment?.id}_${selectedDelivery?.deliveryNumber || 'unknown-delivery'}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `proof-of-delivery/${filename}`);
      console.log('Storage reference created:', filename);
  
      // 5. Upload with timeout
      console.log('Starting upload...');
      const uploadTask = uploadBytes(storageRef, blob);
      
      // Add timeout (30 seconds)
      const timeoutId = setTimeout(() => {
        throw new Error('Upload timed out after 30 seconds');
      }, 30000);

      await uploadTask;
      clearTimeout(timeoutId);
      console.log('Upload completed successfully');
  
      // 6. Get download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL);
  
      // 7. Update Firestore
      console.log('Updating Firestore document...');
      if (!shipment) {
        console.error('Shipment is null. Cannot update document.');
        return;
      }
      await updateDoc(doc(db, 'Shipment', shipment.id, 'deliveries', selectedDelivery.deliveryNumber), {
        podImageUrl: downloadURL,
        statusId: 4,
        deliveredAt: new Date().toISOString(),
      });
  
      // 8. Check if all deliveries are complete
      const deliveriesRef = collection(db, 'Shipment', shipment.id, 'deliveries');
      const deliveriesSnapshot = await getDocs(deliveriesRef);
      const allDelivered = deliveriesSnapshot.docs.every(doc => doc.data().statusId === 4);
      
      if (allDelivered) {
        await updateDoc(doc(db, 'Shipment', shipment.id), { statusId: 4 });
      }
  
      // Success
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Delivery Completed',
          body: `POD uploaded for ${selectedDelivery.customer}`,
        },
        trigger: null,
      });
  
      setShowPODModal(false);
      setPodImage(null);
      setSelectedDelivery(null);
      setPodModalBlocked(false);
      await loadShipments();
  
    } catch (error:any) {
      console.error('POD upload failed:', error);
      Alert.alert(
        'Upload Failed', 
        error.message || 'Failed to upload POD. Please check your connection and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not delivered yet';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const startDelivery = (delivery: Delivery) => {
    setDeliveryToConfirm(delivery);
    setShowDeliveryConfirmation(true);
    setSelectedDelivery(delivery);
  };

  const confirmDelivery = async () => {
    if (!deliveryToConfirm) return;
    await updateDeliveryETA(deliveryToConfirm);
    setShowDeliveryConfirmation(false);
    setDeliveryToConfirm(null);
  };

  const cancelDelivery = async () => {
    if (!deliveryToConfirm || !shipment) return;
    
    try {
      await updateDoc(doc(db, 'Shipment', shipment.id, 'deliveries', deliveryToConfirm.id), {
        statusId: 5,
        cancelledAt: new Date().toISOString(),
        cancellationReason: cancellationReason || "Driver cancelled",
      });

      // Send notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Delivery Cancelled',
          body: `Cancelled delivery to ${deliveryToConfirm.customer}`,
        },
        trigger: null,
      });

      await loadShipments();
      Alert.alert('Delivery Cancelled', 'The delivery has been marked as cancelled');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel delivery');
      console.error(error);
    } finally {
      setShowCancelConfirmation(false);
      setDeliveryToConfirm(null);
    }
  };

  const reattemptDelivery = async (delivery: Delivery) => {
    if (!shipment) return;

    const maxAttempts = 3;
  if ((delivery.attemptCount ?? 0) >= maxAttempts) {
    Alert.alert('Limit Reached', 'Maximum reattempts reached for this delivery');
    return;
  }
    
    try {
      await updateDoc(doc(db, 'Shipment', shipment.id, 'deliveries', delivery.id), {
        statusId: 3, // Set back to Ongoing
        cancelledAt: deleteField(), // Remove cancellation timestamp
        cancellationReason: deleteField(), // Remove cancellation reason
        attemptCount: (delivery.attemptCount || 0) + 1,
      });
  
      await loadShipments();
      Alert.alert(
        'Delivery Reattempt', 
        `Delivery to ${delivery.customer} has been marked for reattempt`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reattempt delivery');
      console.error(error);
    }
  };

  const renderMaterialItems = (materials: MaterialItem[]) => {
    return materials.map((item, index) => (
      <View key={index} style={styles.materialItem}>
        <Text style={styles.materialName}>{item.name}</Text>
        <Text style={styles.materialDetail}>Qty: {item.quantity}</Text>
        {/* <Text style={styles.materialDetail}>Weight: {item.weight}kg</Text> */}
      </View>
    ));
  };


  const renderDeliveryActions = (delivery: Delivery, index: number) => {
    const isSmallScreen = Dimensions.get('window').width <= 375; // iPhone SE width
  
    if (delivery.status === 'Delivered') {
      return (
        <TouchableOpacity 
          style={styles.deliveredButton}
          onPress={() => {
            setSelectedDelivery(delivery);
            setPodImage(delivery.podImageUrl || null);
            setShowPODModal(true);
          }}
        >
          <MaterialIcons name="photo" size={20} color="#2196F3" />
          <Text style={styles.deliveredButtonText}>View POD</Text>
        </TouchableOpacity>
      );
    }
    if (delivery.status === 'Cancelled') {
      return (
        <TouchableOpacity
          style={styles.reattemptButton}
          onPress={() => reattemptDelivery(delivery)}
        >
          <MaterialIcons name="refresh" size={16} color="white" />
          <Text style={styles.reattemptButtonText}>Reattempt</Text>
        </TouchableOpacity>
      );
    }
  
    return (
      <View style={styles.deliveryActionContainer}>
        {/* Delivery stepper - only show if multiple deliveries */}
        {shipment?.deliveries && shipment.deliveries.length >= 1 && (
          <View style={[
            styles.deliveryStepper,
            isSmallScreen && styles.deliveryStepperSmall
          ]}>
            {!isSmallScreen && (
              <TouchableOpacity 
                disabled={index === 0}
                onPress={() => setSelectedDelivery(shipment.deliveries[index - 1])}
                style={[
                  styles.stepperButton,
                  index === 0 && styles.stepperButtonDisabled
                ]}
              >
                <MaterialIcons 
                  name="chevron-left" 
                  size={20} 
                  color={index === 0 ? '#ccc' : '#FF6347'} 
                />
              </TouchableOpacity>
            )}
            
            <Text style={[
              styles.stepperText,
              isSmallScreen && styles.stepperTextSmall
            ]}>
              {isSmallScreen ? `${index + 1}/${shipment.deliveries.length}` : `Delivery ${index + 1} of ${shipment.deliveries.length}`}
            </Text>
            
            {!isSmallScreen && (
              <TouchableOpacity 
                disabled={index === shipment.deliveries.length - 1}
                onPress={() => setSelectedDelivery(shipment.deliveries[index + 1])}
                style={[
                  styles.stepperButton,
                  index === shipment.deliveries.length - 1 && styles.stepperButtonDisabled
                ]}
              >
                <MaterialIcons 
                  name="chevron-right" 
                  size={20} 
                  color={index === shipment.deliveries.length - 1 ? '#ccc' : '#FF6347'} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
  
        {/* Action buttons - always visible */}
        <View style={[
          styles.deliveryActionButtons,
          isSmallScreen && styles.deliveryActionButtonsSmall
        ]}>
          {delivery.status === 'Ongoing' && (
            <>
            <TouchableOpacity 
              style={[
                styles.startDeliveryButton,
                isSmallScreen && styles.startDeliveryButtonSmall
              ]}
              onPress={() => startDelivery(delivery)}
            >
              <MaterialIcons name="play-arrow" size={16} color="white" />
              {!isSmallScreen && (
                <Text style={styles.startDeliveryButtonText}>Start</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
            style={[
              styles.cancelDeliveryButton,
              isSmallScreen && styles.cancelDeliveryButtonSmall
            ]}
            onPress={() => {
              setDeliveryToConfirm(delivery);
              setShowCancelConfirmation(true);
            }}
          >
            <MaterialIcons name="close" size={16} color="white" />
            {!isSmallScreen && (
              <Text style={styles.cancelDeliveryButtonText}>Cancel</Text>
            )}
          </TouchableOpacity>
          </>
          )}
          
          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={() => openGoogleMaps(delivery)}
          >
            <MaterialIcons 
              name="directions" 
              size={isSmallScreen ? 20 : 24} 
              color="#FF6347" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAnalytics = () => {
    if (!pastShipments.length) return null;

    const deliveredCount = pastShipments.filter(s => s.statusId === 4).length;
    const cancelledCount = pastShipments.filter(s => s.statusId === 5).length;
    const totalShipments = deliveredCount + cancelledCount;
    const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

    const barData = [
      { value: deliveredCount, label: 'Delivered', frontColor: '#4CAF50' },
      { value: cancelledCount, label: 'Cancelled', frontColor: '#F44336' }
    ];

    const pieData = [
      { value: deliveredCount, color: '#4CAF50', text: 'Delivered' },
      { value: cancelledCount, color: '#F44336', text: 'Cancelled' }
    ];

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>Delivery Analytics</Text>
        
        <View style={styles.analyticsSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalShipments}</Text>
            <Text style={styles.summaryLabel}>Total Shipments</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{deliveredCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{successRate}%</Text>
            <Text style={styles.summaryLabel}>Success Rate</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Completed vs Cancelled</Text>
          <BarChart
            barWidth={80}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="lightgray"
            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            width={screenWidth - 40}
            yAxisTextStyle={{ color: '#666' }}
            xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
            showReferenceLine1
            referenceLine1Position={Math.max(deliveredCount, cancelledCount) + 1}
            referenceLine1Config={{
              color: 'gray',
              dashWidth: 2,
              dashGap: 3,
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Delivery Ratio</Text>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={50}
            extraRadius={10}
            innerCircleColor={'#f5f5f5'}
            centerLabelComponent={() => (
              <View style={styles.pieCenterLabelContainer}>
                <Text style={styles.pieCenterLabel}>{successRate}%</Text>
                <Text style={styles.pieCenterSubLabel}>Success</Text>
              </View>
            )}
            focusOnPress
            showText
            textColor="black"
            textSize={12}
          />
        </View>
      </View>
    );
  };

  const renderDeliveryItem = (delivery: Delivery, index: number) => (
    <View 
      key={delivery.id} 
      style={[
        styles.deliveryItem,
        delivery.status === 'Delivered' && styles.completedDeliveryItem,
        delivery.status === 'Ongoing' && styles.activeDeliveryItem,
        delivery.status === 'Cancelled' && styles.cancelledDeliveryItem
      ]}
    >
      <View style={styles.deliveryNumberContainer}>
        <Text style={styles.deliveryNumber}>{index + 1}</Text>
        {delivery.status === 'Ongoing' && (
          <View style={styles.activeIndicator} />
        )}
      </View>
      
      <View style={styles.deliveryInfo}>
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
          <Text style={[
            styles.deliveryStatus, 
            delivery.status === 'Delivered' && styles.statusDelivered,
            delivery.status === 'Ongoing' && styles.statusOngoing,
            delivery.status === 'Cancelled' && styles.statusCancelled
          ]}>
            {delivery.status}
          </Text>
        </View>
        
        
        <Text style={styles.deliveryAddress}>{delivery.address}</Text>
        
        {delivery.materials && delivery.materials.length > 0 && (
          <View style={styles.materialsContainer}>
            {renderMaterialItems(delivery.materials)}
          </View>
        )}
        
        <View style={styles.deliveryMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.metaText}>{delivery.eta || 'Calculating...'}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="directions-car" size={16} color="#666" />
            <Text style={styles.metaText}>{delivery.distance || 'N/A'}</Text>
          </View>
        </View>
        
        {delivery.status === 'Delivered' && delivery.deliveredAt && (
          <View style={styles.deliveredContainer}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.deliveredText}>
              Delivered: {formatDate(delivery.deliveredAt)}
            </Text>
          </View>
        )}
      </View>
      
      {renderDeliveryActions(delivery, index)}
      
    </View>
  );

  // Replace your loading state check with this
if (loading && !initialLoadComplete) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6347" />
      {!phoneNumber ? (
        <Text style={styles.loadingText}>Loading profile...</Text>
      ) : locationPermissionStatus === 'denied' ? (
        <Text style={styles.loadingText}>Waiting for location permission...</Text>
      ) : !currentLocation ? (
        <View style={styles.locationLoading}>
          <Text style={styles.loadingText}>Getting location...</Text>
          <Text style={styles.loadingSubtext}>
            Make sure location services are enabled
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setInitialLoadComplete(false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading shipments...</Text>
      )}
    </View>
  );
}

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6347']}
          tintColor="#FF6347"
        />
      }
    >
      {/* Header with driver profile */}
      <View style={styles.header}>
        {driverProfile?.profileImage ? (
          <Image source={{ uri: driverProfile.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <MaterialIcons name="person" size={32} color="white" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.driverName}>{driverProfile?.name || 'Driver'}</Text>
          <Text style={styles.driverPhone}>{phoneNumber}</Text>
          {driverProfile?.vehicleNo && (
            <Text style={styles.driverVehicle}>{driverProfile.vehicleNo}</Text>
          )}
        </View>
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current Shipment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History & Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <>
          {/* Shipment info */}
          {shipment ? (
            <>
              <View style={styles.shipmentInfo}>
                <Text style={styles.shipmentTitle}>Current Shipment</Text>
                <View style={styles.shipmentDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="local-shipping" size={20} color="#FF6347" />
                    <Text style={styles.detailText}>{shipment.transporter}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="directions-bus" size={20} color="#FF6347" />
                    <Text style={styles.detailText}>{shipment.vehicleNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="scale" size={20} color="#FF6347" />
                    <Text style={styles.detailText}>{shipment.tonnage}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={20} color="#FF6347" />
                    <Text style={styles.detailText}>{shipment.route}</Text>
                  </View>
                </View>
              </View>

              {/* Deliveries list */}
              <View style={styles.deliveriesSection}>
                <Text style={styles.sectionTitle}>
                  Delivery Sequence ({shipment.deliveries.length})
                </Text>
                
                {shipment.deliveries.map((delivery, index) => 
                  renderDeliveryItem(delivery, index)
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-shipping" size={48} color="#FF6347" />
              <Text style={styles.emptyText}>No active shipments assigned</Text>
              <Text style={styles.emptySubtext}>You'll see your deliveries here when assigned</Text>
            </View>
          )}
        </>
      ) : (
        <>
          {/* History and Analytics */}
          {renderAnalytics()}
          
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Past Shipments</Text>
            {pastShipments.length > 0 ? (
              pastShipments.map(shipment => (
                <View key={shipment.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTransporter}>{shipment.transporter}</Text>
                    <Text style={[
                      styles.historyStatus,
                      shipment.statusId === 4 ? styles.statusDelivered : styles.statusCancelled
                    ]}>
                      {shipment.statusId === 4 ? 'Completed' : 'Cancelled'}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {shipment.createdAt ? formatDate(shipment.createdAt) : 'Unknown date'}
                  </Text>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyDetail}>{shipment.vehicleNo}</Text>
                    <Text style={styles.historyDetail}>{shipment.tonnage}</Text>
                    <Text style={styles.historyDetail}>{shipment.route}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="history" size={48} color="#FF6347" />
                <Text style={styles.emptyText}>No past shipments found</Text>
              </View>
            )}
          </View>
        </>
      )}

            {/* Shipment Assignment Modal */}
      <Modal visible={showAssignmentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Shipment Assigned</Text>
            <Text style={styles.modalText}>
              You have been assigned a new shipment with {shipment?.deliveries.length} deliveries.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.declineButton]}
                onPress={() => handleAssignmentResponse(false)}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={() => handleAssignmentResponse(true)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Confirmation Modal */}
      <Modal visible={showDeliveryConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start Delivery</Text>
            <Text style={styles.modalText}>
              Are you ready to start delivery to {deliveryToConfirm?.customer}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.declineButton]}
                onPress={() => {
                  setShowDeliveryConfirmation(false);
                  setShowCancelConfirmation(true);
                }}
              >
                <Text style={styles.declineButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={confirmDelivery}
              >
                <Text style={styles.acceptButtonText}>Start Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      {/* Cancel Confirmation Modal */}
<Modal visible={showCancelConfirmation} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Cancel Delivery</Text>
      <Text style={styles.modalText}>
        Are you sure you want to cancel delivery to {deliveryToConfirm?.customer}?
      </Text>
      
      {/* Add the Picker here */}
      <Text style={styles.pickerLabel}>Select cancellation reason:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cancellationReason}
          onValueChange={(itemValue) => setCancellationReason(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select reason..." value="" />
          <Picker.Item label="Customer not available" value="Customer not available" />
          <Picker.Item label="Address issue" value="Address issue" />
          <Picker.Item label="Vehicle problem" value="Vehicle problem" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.declineButton]}
          onPress={() => {
            setCancellationReason(''); // Reset reason when going back
            setShowCancelConfirmation(false);
          }}
        >
          <Text style={styles.declineButtonText}>Go Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            if (!cancellationReason) {
              Alert.alert('Reason Required', 'Please select a cancellation reason');
              return;
            }
            cancelDelivery();
          }}
          disabled={!cancellationReason}
        >
          <Text style={styles.cancelButtonText}>Confirm Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
  {/* POD Capture Modal */}
<Modal visible={showPODModal} transparent animationType="slide">
  <View style={styles.podModalContainer}>
    <View style={styles.podHeader}>
      <TouchableOpacity 
        onPress={() => {
          if (!podModalBlocked) {
            setShowPODModal(false);
            setPodImage(null);
          } else {
            Alert.alert(
              'POD Required',
              'You must upload proof of delivery before exiting',
              [{ text: 'OK' }]
            );
          }
        }}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#FF6347" />
      </TouchableOpacity>
      <Text style={styles.podTitle}>Proof of Delivery</Text>
      <View style={{ width: 24 }} /> 
    </View>
    
    <Text style={styles.podSubtitle}>
      Delivery #{selectedDelivery?.deliveryNumber || ''} - {selectedDelivery?.customer || ''}
    </Text>
    
    <View style={styles.podImageContainer}>
      {selectedDelivery?.podImageUrl ? (
        <Image 
          source={{ uri: selectedDelivery.podImageUrl }} 
          style={styles.podImage}
          resizeMode="contain"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      ) : podImage ? (
        <Image 
          source={{ uri: podImage }} 
          style={styles.podImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.podPlaceholder}>
          <MaterialIcons name="photo-camera" size={48} color="#FF6347" />
          <Text style={styles.podPlaceholderText}>No image captured</Text>
        </View>
      )}
    </View>
    
    <View style={styles.podButtons}>
      {!selectedDelivery?.podImageUrl ? (
        <>
          <TouchableOpacity
            style={[styles.podButton, styles.captureButton]}
            onPress={capturePOD}
            disabled={uploading}
          >
            <Text style={styles.captureButtonText}>
              {podImage ? 'Retake Photo' : 'Take Photo'}
            </Text>
          </TouchableOpacity>
          
          {podImage && (
            <TouchableOpacity
              style={[styles.podButton, styles.uploadButton]}
              onPress={uploadPOD}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload POD</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.uploadCompleteContainer}>
          <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.uploadCompleteText}>POD Uploaded Successfully</Text>
        </View>
      )}
    </View>
  </View>
</Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  deliveryActionContainer: {
    //width: '100%',
    marginTop: 8,
  },
  deliveryStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deliveryStepperSmall: {
    marginBottom: 6,
  },
  stepperButton: {
    padding: 6,
    marginHorizontal: 4,
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  stepperTextSmall: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  deliveryActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryActionButtonsSmall: {
    justifyContent: 'center',
  },
  startDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  startDeliveryButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
  },
  modalNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  startDeliveryButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  navigateButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  deliverySelector: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  selectorTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  deliveryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  activeDeliveryTab: {
    backgroundColor: '#FF6347',
  },
  deliveryTabText: {
    color: '#333',
  },
  activeDeliveryTabText: {
    color: 'white',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#FF6347',
    marginTop: 2,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6347',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  shipmentInfo: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  shipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  shipmentDetails: {
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  deliveriesSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  completedDeliveryItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activeDeliveryItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  deliveryNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  deliveryNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6347',
    borderWidth: 2,
    borderColor: 'white',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deliveryStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  statusDelivered: {
    backgroundColor: '#e8f5e9',
    color: '#4CAF50',
  },
  statusOngoing: {
    backgroundColor: '#fff3e0',
    color: '#FF9800',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
    color: '#F44336',
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  materialsContainer: {
    marginBottom: 8,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  materialName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  materialDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  deliveryMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deliveredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveredText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  deliveryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  acceptButton: {
    backgroundColor: '#FF6347',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  declineButtonText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  podTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  podSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  podImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  podPlaceholder: {
    alignItems: 'center',
  },
  podPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  podButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  captureButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  uploadButton: {
    backgroundColor: '#FF6347',
  },
  captureButtonText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analyticsContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  analyticsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  pieCenterLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pieCenterSubLabel: {
    fontSize: 12,
    color: '#666',
  },
  historyContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTransporter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
  },
  historyDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  notificationModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  notificationButton: {
    backgroundColor: '#FF6347',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveredButtonText: {
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 12,
  },
  cancelledDeliveryItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    opacity: 0.7,
  },
  podHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
 
  locationLoading: {
    alignItems: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6347',
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  podModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  podImageContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    overflow: 'hidden', // Add this to ensure image stays within bounds
  },
  uploadCompleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginTop: 10,
    flex: 1,
  },
  uploadCompleteText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  cancelDeliveryButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
  },
  cancelDeliveryButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  reattemptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center'
  },
  reattemptButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default DriverDashboard;