import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from "../firebase";






const db = getFirestore(app);

// Define types for items in dropdowns
interface DropdownItem {
  id: string;
  name: string;
}

export default function CreateShipment() {
  const [transporters, setTransporters] = useState<DropdownItem[]>([]);
  const [vehicleNumbers, setVehicleNumbers] = useState<{ transporter: string; vehicleNo: string }[]>([]);
  const [filteredVehicleNumbers, setFilteredVehicleNumbers] = useState<DropdownItem[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<DropdownItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch all Transporters and Vehicle Numbers from Firestore
    const fetchTransportersAndVehicles = async () => {
      setLoading(true);
      try {
        const transporterSet = new Set<string>();
        const vehicleNoData: { transporter: string; vehicleNo: string }[] = [];
        const snapshot = await getDocs(collection(db, 'DriverOnBoarding'));

        snapshot.forEach((doc) => {
          const [transporter, vehicleNo] = doc.id.split('-');
          if (transporter && vehicleNo) {
            transporterSet.add(transporter);
            vehicleNoData.push({ transporter, vehicleNo });
          }
        });

        setTransporters(Array.from(transporterSet).map((item) => ({ id: item, name: item })));
        setVehicleNumbers(vehicleNoData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportersAndVehicles();
  }, []);

  // Filter vehicle numbers based on selected transporter
  useEffect(() => {
    if (selectedTransporter) {
      const filtered = vehicleNumbers.filter(
        (item) => item.transporter === selectedTransporter.name
      );
      setFilteredVehicleNumbers(
        filtered.map((item) => ({ id: item.vehicleNo, name: item.vehicleNo }))
      );
    } else {
      setFilteredVehicleNumbers([]);
    }
  }, [selectedTransporter, vehicleNumbers]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Onboarding Filter</Text>

      <Text style={styles.label}>Select Transporter</Text>
      <SearchableDropdown
        items={transporters}
        onItemSelect={(item: DropdownItem) => setSelectedTransporter(item)}
        placeholder="Select a Transporter"
        containerStyle={styles.dropdownContainer}
        textInputStyle={styles.input}
        itemStyle={styles.item}
        itemTextStyle={styles.itemText}
      />

      {selectedTransporter && (
        <>
          <Text style={styles.label}>Select Vehicle No</Text>
          <SearchableDropdown
            items={filteredVehicleNumbers}
            onItemSelect={(item: DropdownItem) => alert(`Selected Vehicle: ${item.name}`)} // Replace with your logic
            placeholder="Select a Vehicle No"
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.input}
            itemStyle={styles.item}
            itemTextStyle={styles.itemText}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  item: {
    padding: 10,
    marginTop: 2,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
