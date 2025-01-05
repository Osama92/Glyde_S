import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ShipmentDetail() {
  const { shipmentId } = useLocalSearchParams(); // Fetch params from route
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generated Shipment</Text>
      {shipmentId ? (
        <Text style={styles.shipmentId}>Shipment ID: {shipmentId}</Text>
      ) : (
        <Text style={styles.error}>No shipment ID provided.</Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shipmentId: {
    fontSize: 18,
    color: 'orange',
    marginBottom: 30,
  },
  error: {
    fontSize: 18,
    color: 'red',
    marginBottom: 30,
  },
  backButton: {
    padding: 15,
    backgroundColor: 'orange',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
