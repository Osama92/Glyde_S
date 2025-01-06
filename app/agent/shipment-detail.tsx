import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ShipmentDetail() {
  const { shipmentId } = useLocalSearchParams(); // Fetch params from route
  const router = useRouter();

  return (
    <View style={styles.container}>
        <View style={styles.topSection}>
                
                <TouchableOpacity onPress={() => router.push('/credentials/signIn')}>
                  <Text style={{fontSize:20}}>Go to delivery Creation</Text>
                </TouchableOpacity>
                <Image
                  source={require('../../assets/images/Arrow.png')}
                  style={{ width: 30, resizeMode: 'contain', marginLeft:10 }}
                />
              </View>
      <Text style={styles.title}>Shipment Created</Text>
      <Image
                  source={require('../../assets/images/relaxDriver.png')}
                  style={{ width: 300, height:300, resizeMode: 'contain', alignSelf:'center'}}
                />
      {shipmentId ? (
        <>
        <Text style={{fontSize:15, color: 'black', alignSelf:'center', marginBottom:10}}>Shipment Number</Text>
        <Text style={styles.shipmentId}>{shipmentId}</Text>
        </>
      ) : (
        <Text style={styles.error}>No shipment ID provided.</Text>
      )}
      {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shipmentId: {
    fontSize: 25,
    color: 'orange',
    marginBottom: 30,
    alignSelf: 'center',
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
  topSection: {
    width: "100%",
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
