import React from 'react';
import { View, Text,StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

export default function O_screen3() {
  const router = useRouter();
  // Load the custom font using the require statement
  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),  // Add your font file here
  });

  // Show an activity indicator while the font is loading
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263238" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <Image source={require('../../assets/images/paid.png')} resizeMode='contain' style={styles.gifStyle}/>
   
       <Text style={styles.customFont1}>Earn on deliveries</Text>
       <Text style={styles.customFont2}>Streamline your delivery process by monitoring shipments, generating professional invoices, and ensuring timely payments.</Text>

       <View style={styles.paginationContainer}>
        <View style={styles.pagination1}></View>
        <View style={styles.pagination2}></View>
        <View style={styles.pagination3}></View>
       </View>

       <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding/getStarted')}>
        <Text style={styles.customFont3}>Get Started</Text>
       </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  customFont1: {
    fontFamily: 'Poppins',
    fontSize: 24,
    color: 'black',
  },
  customFont2: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: 'black',
    textAlign:'center',
    padding:10
  },
  customFont3: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: 'white',
    textAlign:'center',
    padding:10
  },
  gifStyle: {
    width: 300,
    height: 250,
    marginRight:40
  },
  paginationContainer: {
    flexDirection:'row',
    width: '80%',
    height: 20,
    justifyContent: 'center',
    alignItems:'center'

  },
  pagination1: {
    width: 8,
    height: 20,
    backgroundColor:'lightgrey',
    margin:8,
    borderRadius: 20
  },
  pagination2: {
    width: 8,
    height: 20,
    backgroundColor:'lightgrey',
    margin:8,
    borderRadius: 20
  },
  pagination3: {
    width: 8,
    height: 20,
    backgroundColor:'#263238',
    margin:8,
    borderRadius: 20
  },
  button: {
    width: '80%',
    height: 60,
    backgroundColor: '#263238',
    borderRadius: 10,
    marginTop: 40,
    justifyContent: 'center'

  
  }
});
