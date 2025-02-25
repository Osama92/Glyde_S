import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { app } from '../firebase';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedCollection) {
      Alert.alert('Error', 'Please select a collection');
      return;
    }

    if (
      selectedCollection === 'deliverydriver' &&
      (!phoneNumber || !name || !assignedVanNo || !transporter || !password)
    ) {
      Alert.alert('Error', 'All fields are required for Delivery Driver');
      return;
    }

    if (selectedCollection === 'customer' && (!phoneNumber || !name || !password)) {
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
    } else if (selectedCollection === 'customer') {
      Object.assign(userData, {
        phoneNumber: phoneNumber,
        name: name,
        password: password,
      });
    }

    setIsLoading(true); // Show loading indicator
    try {
      await setDoc(doc(db, selectedCollection, uid), userData);
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
      console.error(error);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Select Collection</Text>
        <SearchableDropdown
          onItemSelect={(item) => setSelectedCollection(item.id)}
          items={collections}
          placeholder={selectedCollection ? collections.find((c) => c.id === selectedCollection)?.name : 'Select Category..'}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemTextStyle={styles.dropdownItemText}
          placeholderTextStyle={styles.placeholderText}
          placeholderTextColor={'#000'}
        />

        {selectedCollection === 'deliverydriver' && (
          <>
            <Text style={styles.label}>Assigned Van No</Text>
            <TextInput
              value={assignedVanNo}
              onChangeText={setAssignedVanNo}
              style={styles.input}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>Transporter</Text>
            <TextInput
              value={transporter}
              onChangeText={setTransporter}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </>
        )}

        {selectedCollection === 'customer' && (
          <>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : (
          <Button title="Save User" onPress={handleSave} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  loader: {
    marginTop: 20,
  },
});

export default AddUserScreen;