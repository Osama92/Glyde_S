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

  const handleSave = async () => {
    if (!selectedCollection) {
      Alert.alert('Error', 'Please select a collection');
      return;
    }

    if (selectedCollection === 'deliverydriver' && (!phoneNumber || !name || !assignedVanNo || !transporter || !password)) {
      Alert.alert('Error', 'All fields are required for Delivery Driver');
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
        onItemSelect={(item) => setSelectedCollection(item.id)}
        items={collections}
        placeholder={selectedCollection ? collections.find(c => c.id === selectedCollection)?.name : 'Select Collection'}
      />

      {selectedCollection === 'deliverydriver' && (
        <>
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
        </>
      )}

      <Button title="Save User" onPress={handleSave} />
    </View>
  );
};

export default AddUserScreen;
