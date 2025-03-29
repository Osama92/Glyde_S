import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  DocumentData
} from 'firebase/firestore';
import StepIndicator from 'react-native-step-indicator';
import { app } from '../firebase';
import { router } from 'expo-router';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Initialize Firestore
const db = getFirestore(app);

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Type definitions
type Delivery = {
  id: string;
  deliveryNumber: string;
  statusId: number;
  vehicleNo: string;
  driverName: string;
  eta?: string;
  shipmentId: string;
};

type UserData = {
  name: string;
  imageUrl?: string;
  uid: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
};

const collections = ['deliveryDriver', 'customer', 'fieldAgent', 'transporter'] as const;
const labels = ['Loaded', 'Dispatched', 'In-Transit', 'Delivered'] as const;

const GOOGLE_MAPS_API_KEY = 'AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w';

export default function Dashboard() {
  // State with TypeScript types
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Delivery | null>(null);

  // Filter deliveries with proper typing
  const pendingDeliveries = deliveries.filter(d => d.statusId < 4);
  const completedDeliveries = deliveries.filter(d => d.statusId === 4);

  // Responsive step indicator configuration
  const customStyles = {
    stepIndicatorSize: isSmallDevice ? 20 : 25,
    currentStepIndicatorSize: isSmallDevice ? 25 : 30,
    separatorStrokeWidth: 1,
    currentStepStrokeWidth: 2,
    stepStrokeCurrentColor: '#F6984C',
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: '#F6984C',
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: '#F6984C',
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: '#F6984C',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: isSmallDevice ? 9 : 11,
    currentStepIndicatorLabelFontSize: isSmallDevice ? 9 : 11,
    stepIndicatorLabelCurrentColor: '#F6984C',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#aaaaaa',
    labelColor: '#999999',
    labelSize: isSmallDevice ? 9 : 11,
    currentStepLabelColor: '#F6984C',
    separatorStrokeUnfinishedWidth: 1,
    separatorStrokeFinishedWidth: 1
  };

  // Reverse geocoding function with proper typing
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(url);
      
      if (response.data.status === 'OK' && response.data.results[0]) {
        return response.data.results[0].formatted_address;
      }
      return 'Address not available';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Location unknown';
    }
  };

  // Fetch user details with proper typing
  const fetchUserDetails = useCallback(async (): Promise<void> => {
    try {
      const phoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (!phoneNumber) {
        Alert.alert('Error', 'No phone number found');
        return;
      }

      for (const colName of collections) {
        const userQuery = query(collection(db, colName), where('phoneNumber', '==', phoneNumber));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data() as UserData;
          setDisplayName(userDoc.name || 'User');
          
          // Fix for iOS image loading - add cache busting if needed
          const imageUrl = userDoc.imageUrl ? 
            `${userDoc.imageUrl}?${new Date().getTime()}` : 
            null;
            
          setProfileImage(imageUrl);
          
          setCollectionName(colName);
          setId(encodeURIComponent(userDoc.uid));

          if (userDoc.location) {
            const address = await reverseGeocode(userDoc.location.latitude, userDoc.location.longitude);
            setLocationLabel(address);
          } else {
            setLocationLabel('Location not set');
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  }, []);

  // Fetch delivery details with proper typing
  const fetchDeliveryDetails = useCallback(async (): Promise<void> => {
    if (!displayName) return;

    try {
      const shipmentQuery = query(collection(db, 'Shipment'));
      const shipmentSnapshot = await getDocs(shipmentQuery);
      const allDeliveries: Delivery[] = [];

      for (const shipmentDoc of shipmentSnapshot.docs) {
        const shipmentData = shipmentDoc.data();
        const deliveriesRef = collection(db, 'Shipment', shipmentDoc.id, 'deliveries');
        const deliveriesQuery = query(deliveriesRef, where('customer', '==', displayName));
        const deliveriesSnapshot = await getDocs(deliveriesQuery);

        deliveriesSnapshot.forEach(doc => {
          const deliveryData = doc.data();
          allDeliveries.push({
            id: doc.id,
            deliveryNumber: deliveryData.deliveryNumber || 'N/A',
            statusId: deliveryData.statusId || 0,
            vehicleNo: shipmentData.vehicleNo || 'Unknown',
            driverName: shipmentData.driverName || 'Unknown',
            eta: deliveryData.eta,
            shipmentId: shipmentDoc.id
          });
        });
      }

      setDeliveries(allDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      Alert.alert('Error', 'Failed to load deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [displayName]);

  // Mark delivery as received
  const markAsReceived = useCallback(async (delivery: Delivery): Promise<void> => {
    try {
      const deliveryRef = doc(db, 'Shipment', delivery.shipmentId, 'deliveries', delivery.id);
      await updateDoc(deliveryRef, {
        statusId: 4,
        deliveredAt: new Date().toISOString()
      });

      setDeliveries(prev => 
        prev.map(d => 
          d.id === delivery.id ? { ...d, statusId: 4 } : d
        )
      );
    } catch (error) {
      console.error('Error marking delivery:', error);
      Alert.alert('Error', 'Failed to update delivery status');
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUserDetails(), fetchDeliveryDetails()]);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [fetchUserDetails, fetchDeliveryDetails]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchUserDetails();
        await fetchDeliveryDetails();
      } catch (error) {
        console.error('Initial load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchUserDetails, fetchDeliveryDetails]);

  // Delivery Card Component
  const DeliveryCard = React.memo(({ item, isPending }: { item: Delivery, isPending: boolean }) => {
    const handlePress = () => {
      setSelectedItem(item);
      setModalVisible(true);
    };

    return (
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryNumber}>Delivery #{item.deliveryNumber}</Text>
          <View style={styles.vehicleInfo}>
            <MaterialIcons name="local-shipping" size={isSmallDevice ? 16 : 20} color="#F6984C" />
            <Text style={styles.vehicleText}>{item.vehicleNo}</Text>
          </View>
        </View>

        <View style={styles.driverInfo}>
          <Ionicons name="person-circle-outline" size={isSmallDevice ? 14 : 16} color="#666" />
          <Text style={styles.driverText}>{item.driverName}</Text>
        </View>

        <Text style={styles.etaText}>
          {item.eta ? `Estimated arrival: ${item.eta}` : 'Arrival time pending'}
        </Text>

        <View style={styles.stepContainer}>
          <StepIndicator
            customStyles={customStyles}
            currentPosition={item.statusId}
            labels={labels.slice()}
            stepCount={4}
            direction="horizontal"
          />
        </View>

        {isPending && item.statusId >= 3 && (
          <TouchableOpacity style={styles.deliveryButton} onPress={handlePress}>
            <Text style={styles.deliveryButtonText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  });

  // Confirmation Modal
  const ConfirmationModal = () => (
    <Modal
      transparent
      visible={modalVisible}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Delivery</Text>
          <Text style={styles.modalText}>
            Are you sure you've received delivery #{selectedItem?.deliveryNumber}?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                if (selectedItem) {
                  markAsReceived(selectedItem);
                }
                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F6984C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={profileImage ? 
              { uri: profileImage, cache: Platform.OS === 'ios' ? 'reload' : 'default' } : 
              require('../../assets/images/icon.png')}
            style={styles.profileImage}
            onError={() => setProfileImage(null)}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Hi, {displayName}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/customer/editProfile?collectionName=${collectionName}&id=${id}`)}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationSection}>
          <Ionicons name="location-sharp" size={isSmallDevice ? 16 : 20} color="#F6984C" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel || 'Loading location...'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/customer/completed')}
        >
          <Ionicons name="time-outline" size={isSmallDevice ? 20 : 24} color="#F6984C" />
          <Text style={styles.actionText}>Delivery History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={isSmallDevice ? 20 : 24} color="#F6984C" />
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery List */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#F6984C']}
            tintColor="#F6984C"
          />
        }
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Active Deliveries</Text>

        {pendingDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={isSmallDevice ? 40 : 50} color="#ddd" />
            <Text style={styles.emptyText}>No pending deliveries</Text>
          </View>
        ) : (
          <FlatList
            data={pendingDeliveries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DeliveryCard item={item} isPending={true} />}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
          />
        )}

        <ConfirmationModal />
      </ScrollView>
    </SafeAreaView>
  );
}

// Responsive styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 15 : 20,
  },
  scrollContent: {
    paddingBottom: isSmallDevice ? 15 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallDevice ? 15 : 20,
    paddingBottom: isSmallDevice ? 5 : 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  profileImage: {
    width: isSmallDevice ? 40 : 50,
    height: isSmallDevice ? 40 : 50,
    borderRadius: isSmallDevice ? 20 : 25,
    marginRight: isSmallDevice ? 10 : 15,
    borderWidth: 2,
    borderColor: '#F6984C',
  },
  profileInfo: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  greeting: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#333',
  },
  editProfileText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#F6984C',
    marginTop: 2,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 152, 76, 0.1)',
    paddingHorizontal: isSmallDevice ? 8 : 12,
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: 20,
    maxWidth: '50%',
  },
  locationText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#F6984C',
    marginLeft: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: isSmallDevice ? 10 : 20,
    paddingBottom: isSmallDevice ? 10 : 15,
  },
  actionButton: {
    alignItems: 'center',
    padding: isSmallDevice ? 8 : 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    width: '45%',
  },
  actionText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#666',
    marginTop: isSmallDevice ? 2 : 5,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: isSmallDevice ? 10 : 15,
    marginTop: isSmallDevice ? 5 : 10,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 15,
    marginBottom: isSmallDevice ? 10 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: isSmallDevice ? 180 : 200,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 5 : 10,
  },
  deliveryNumber: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#333',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#666',
    marginLeft: 5,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 5 : 10,
  },
  driverText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#666',
    marginLeft: 5,
  },
  etaText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: isSmallDevice ? 10 : 15,
  },
  stepContainer: {
    marginVertical: isSmallDevice ? 10 : 15,
    paddingHorizontal: 5,
  },
  deliveryButton: {
    backgroundColor: '#F6984C',
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: isSmallDevice ? 5 : 10,
  },
  deliveryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: isSmallDevice ? 14 : 16,
  },
  listContent: {
    paddingBottom: isSmallDevice ? 10 : 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 20 : 40,
  },
  emptyText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#999',
    marginTop: isSmallDevice ? 5 : 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isSmallDevice ? 15 : 20,
    width: isSmallDevice ? '90%' : '85%',
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: isSmallDevice ? 8 : 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 15 : 20,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#F6984C',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: isSmallDevice ? 14 : 16,
  },
});