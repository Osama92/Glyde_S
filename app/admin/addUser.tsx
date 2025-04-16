import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { app } from '../firebase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

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
  const [loadingPoint, setLoadingPoint] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transporters, setTransporters] = useState<{ id: string; name: string }[]>([]);
  const [loadingPoints, setLoadingPoints] = useState<{ id: string; name: string }[]>([]);
  const [availableVans, setAvailableVans] = useState<{ id: string; name: string }[]>([]);
  const [fetchingTransporters, setFetchingTransporters] = useState(false);
  const [fetchingLoadingPoints, setFetchingLoadingPoints] = useState(false);
  const [fetchingVans, setFetchingVans] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const { height } = Dimensions.get('window');
  const isSmallDevice = height < 700;

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch available vans when transporter changes
  useEffect(() => {
    const fetchAvailableVans = async () => {
      if (!transporter || selectedCollection !== 'deliverydriver') return;
      
      setFetchingVans(true);
      try {
        // First, get all assigned van numbers from delivery drivers
        const deliveryDriversRef = collection(db, 'deliverydriver');
        const deliveryDriversSnapshot = await getDocs(deliveryDriversRef);
        const assignedVanNumbers = deliveryDriversSnapshot.docs
          .map(doc => doc.data().AssignedVanNo)
          .filter(vanNo => vanNo);

        // Then, get all vehicle numbers from the selected transporter
        const transporterDocRef = doc(db, 'transporter', transporter);
        const transporterDoc = await getDocs(collection(transporterDocRef, 'VehicleNo'));
        
        // Filter out vans that are already assigned
        const availableVansData = transporterDoc.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().number || doc.id,
          }))
          .filter(van => !assignedVanNumbers.includes(van.id));

        setAvailableVans(availableVansData);
      } catch (error) {
        console.error('Error fetching available vans:', error);
        showAlert('Error', 'Failed to fetch available vans');
      } finally {
        setFetchingVans(false);
      }
    };

    fetchAvailableVans();
  }, [transporter, selectedCollection]);

  // Fetch data based on selected collection
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedCollection === 'deliverydriver' || selectedCollection === 'transporter') {
          setFetchingTransporters(true);
          const transporterRef = collection(db, 'transporter');
          const transporterSnapshot = await getDocs(transporterRef);
          const transporterData = transporterSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || `Transporter ${doc.id.substring(0, 4)}`,
          }));
          setTransporters(transporterData);
        }
        
        if (['fieldagent', 'transporter', 'customer'].includes(selectedCollection || '')) {
          setFetchingLoadingPoints(true);
          const loadingPointRef = collection(db, 'originPoint');
          const loadingPointSnapshot = await getDocs(loadingPointRef);
          const loadingPointData = loadingPointSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || `Loading Point ${doc.id.substring(0, 4)}`,
          }));
          setLoadingPoints(loadingPointData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Error', 'Failed to fetch required data');
      } finally {
        setFetchingTransporters(false);
        setFetchingLoadingPoints(false);
      }
    };

    if (selectedCollection) {
      fetchData();
    }
  }, [selectedCollection]);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCollection) {
      newErrors.collection = 'Please select a collection';
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (selectedCollection === 'deliverydriver') {
      if (!assignedVanNo) newErrors.assignedVanNo = 'Van number is required';
      if (!transporter) newErrors.transporter = 'Transporter is required';
    }

    if (['fieldagent', 'transporter', 'customer'].includes(selectedCollection || '') && !loadingPoint) {
      newErrors.loadingPoint = 'Loading point is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !selectedCollection) return;

    const uid = `${phoneNumber}_${name}`.replace(/\s+/g, '_');
    const userData: Record<string, any> = { 
      uid,
      phoneNumber,
      name,
      password,
      createdAt: new Date().toISOString()
    };

    // Collection-specific fields
    if (selectedCollection === 'deliverydriver') {
      userData.AssignedVanNo = assignedVanNo;
      userData.Transporter = transporter;
    } else if (['fieldagent', 'transporter', 'customer'].includes(selectedCollection)) {
      userData.LoadingPoint = loadingPoint;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, selectedCollection, uid), userData);
      showAlert('Success', 'User added successfully');
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      showAlert('Error', 'Failed to add user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCollection(null);
    setAssignedVanNo('');
    setPhoneNumber('');
    setName('');
    setTransporter('');
    setLoadingPoint('');
    setPassword('');
    setErrors({});
  };

  const renderLoadingPointDropdown = () => {
    if (!['fieldagent', 'transporter', 'customer'].includes(selectedCollection || '')) {
      return null;
    }

    return (
      <>
        <Text style={styles.label}>Loading Point</Text>
        {fetchingLoadingPoints ? (
          <ActivityIndicator size="small" color="#FFA500" />
        ) : (
          <>
            <SearchableDropdown
              onItemSelect={(item) => {
                setLoadingPoint(item.id);
                setErrors(prev => ({ ...prev, loadingPoint: '' }));
              }}
              containerStyle={[
                styles.dropdownContainer,
                errors.loadingPoint && styles.inputError
              ]}
              textInputStyle={styles.dropdownTextInput}
              itemStyle={styles.dropdownItem}
              itemTextStyle={styles.dropdownItemText}
              itemsContainerStyle={[
                styles.dropdownItemsContainer,
                isSmallDevice && { maxHeight: 150 }
              ]}
              items={loadingPoints}
              defaultIndex={-1}
              resetValue={false}
              underlineColorAndroid="transparent"
              placeholder={loadingPoint 
                ? loadingPoints.find(c => c.id === loadingPoint)?.name || 'Loading Point Selected'
                : 'Select Loading Point'}
              placeholderTextColor="#999"
              searchPlaceholder="Search loading points..."
              nestedScrollEnabled={true}
              onRemoveItem={() => setLoadingPoint('')}
            />
            {errors.loadingPoint && <Text style={styles.errorText}>{errors.loadingPoint}</Text>}
          </>
        )}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: keyboardOffset + 20 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New User</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Select Access Level</Text>
          <SearchableDropdown
            onItemSelect={(item) => {
              setSelectedCollection(item.id);
              setErrors(prev => ({ ...prev, collection: '' }));
            }}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownTextInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={[
              styles.dropdownItemsContainer,
              isSmallDevice && { maxHeight: 150 }
            ]}
            items={collections}
            defaultIndex={-1}
            resetValue={false}
            underlineColorAndroid="transparent"
            placeholder={selectedCollection 
              ? collections.find(c => c.id === selectedCollection)?.name 
              : 'Select User Type'}
            placeholderTextColor="#999"
            searchPlaceholder="Search user types..."
            nestedScrollEnabled={true}
            onRemoveItem={() => setSelectedCollection(null)}
          />
          {errors.collection && <Text style={styles.errorText}>{errors.collection}</Text>}

          {/* Delivery Driver Specific Fields */}
          {selectedCollection === 'deliverydriver' && (
            <>
              <Text style={styles.label}>Transporter</Text>
              {fetchingTransporters ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <>
                  <SearchableDropdown
                    onItemSelect={(item) => {
                      setTransporter(item.id);
                      setErrors(prev => ({ ...prev, transporter: '' }));
                      setAssignedVanNo('');
                    }}
                    containerStyle={[
                      styles.dropdownContainer,
                      errors.transporter && styles.inputError
                    ]}
                    textInputStyle={styles.dropdownTextInput}
                    itemStyle={styles.dropdownItem}
                    itemTextStyle={styles.dropdownItemText}
                    itemsContainerStyle={[
                      styles.dropdownItemsContainer,
                      isSmallDevice && { maxHeight: 150 }
                    ]}
                    items={transporters}
                    defaultIndex={-1}
                    resetValue={false}
                    underlineColorAndroid="transparent"
                    placeholder={transporter 
                      ? transporters.find(c => c.id === transporter)?.name 
                      : 'Select Transporter'}
                    placeholderTextColor="#999"
                    searchPlaceholder="Search transporters..."
                    nestedScrollEnabled={true}
                    onRemoveItem={() => setTransporter('')}
                  />
                  {errors.transporter && <Text style={styles.errorText}>{errors.transporter}</Text>}

                  <Text style={styles.label}>Assigned Van Number</Text>
                  {fetchingVans ? (
                    <ActivityIndicator size="small" color="#FFA500" />
                  ) : (
                    <>
                      <SearchableDropdown
                        onItemSelect={(item) => {
                          setAssignedVanNo(item.id);
                          setErrors(prev => ({ ...prev, assignedVanNo: '' }));
                        }}
                        containerStyle={[
                          styles.dropdownContainer,
                          errors.assignedVanNo && styles.inputError
                        ]}
                        textInputStyle={styles.dropdownTextInput}
                        itemStyle={styles.dropdownItem}
                        itemTextStyle={styles.dropdownItemText}
                        itemsContainerStyle={[
                          styles.dropdownItemsContainer,
                          isSmallDevice && { maxHeight: 150 }
                        ]}
                        items={availableVans}
                        defaultIndex={-1}
                        resetValue={false}
                        underlineColorAndroid="transparent"
                        placeholder={transporter 
                          ? "Select Van Number" 
                          : "Select Transporter first"}
                        placeholderTextColor="#999"
                        searchPlaceholder="Search van numbers..."
                        nestedScrollEnabled={true}
                        onRemoveItem={() => setAssignedVanNo('')}
                        disabled={!transporter}
                      />
                      {errors.assignedVanNo && <Text style={styles.errorText}>{errors.assignedVanNo}</Text>}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Loading Point Dropdown (for fieldagent, transporter, customer) */}
          {renderLoadingPointDropdown()}

          {/* Common Fields */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setErrors(prev => ({ ...prev, phoneNumber: '' }));
            }}
            keyboardType="phone-pad"
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="Enter Phone Number"
            placeholderTextColor="#999"
            returnKeyType="next"
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

          <Text style={styles.label}>
            {selectedCollection === 'customer' ? 'Customer Name' : 
             selectedCollection === 'transporter' ? 'Transporter Name' : 
             selectedCollection === 'fieldagent' ? 'Agent Name' : 'Name'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors(prev => ({ ...prev, name: '' }));
            }}
            style={[styles.input, errors.name && styles.inputError]}
            placeholder={
              selectedCollection === 'customer' ? 'Enter Customer Name' : 
              selectedCollection === 'transporter' ? 'Enter Transporter Name' : 
              selectedCollection === 'fieldagent' ? 'Enter Agent Name' : 'Enter Name'
            }
            placeholderTextColor="#999"
            returnKeyType="next"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Enter Password"
            placeholderTextColor="#999"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {isLoading ? (
            <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
          ) : (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>Save User</Text>
              <Ionicons name="save-outline" size={20} color="#FFF" style={styles.saveIcon} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: { 
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    paddingBottom: 40,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2C3E50',
    textAlign: 'center',
    flex: 1,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#34495E',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5DBE1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: '#FFF',
    fontSize: 14,
    color: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -5,
  },
  loader: { 
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
    marginRight: 8,
  },
  saveIcon: {
    marginTop: 2,
  },
  // Dropdown styles
  dropdownContainer: {
    padding: 0,
    marginBottom: 5,
  },
  dropdownTextInput: {
    borderWidth: 1,
    borderColor: '#D5DBE1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
    fontSize: 14,
    color: '#2C3E50',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DBE1',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5DBE1',
    marginTop: 5,
  },
});

export default AddUserScreen;