import React, { useEffect } from 'react';
import { View, Text,StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function O_screen2() {
  const router = useRouter();
  // Load the custom font using the require statement
  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),  // Add your font file here
  });

  const translateX = useSharedValue(0); // Animation value for horizontal slide

  useEffect(() => {
    // Animate screen appearance
    translateX.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    // Animate screen exit
    translateX.value = withTiming(-500, { duration: 300 });

    setTimeout(() => {
      router.push('/onboarding/o_Screen3'); // Navigate to the next screen
    }, 300);
  };

  // Show an activity indicator while the font is loading
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263238" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      
      <Image source={require('../../assets/images/Tracking.png')} resizeMode='cover' style={styles.gifStyle}/>
   
       <Text style={styles.customFont1}>Real-time Tracking</Text>
       <Text style={styles.customFont2}>Monitor your deliveries seamlessly from the comfort of your home all the way to their final destination</Text>

       <View style={styles.paginationContainer}>
        <View style={styles.pagination1}></View>
        <View style={styles.pagination2}></View>
        <View style={styles.pagination3}></View>
       </View>

       <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.customFont3}>Next</Text>
       </TouchableOpacity>

    </Animated.View>
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
    backgroundColor:'#263238',
    margin:8,
    borderRadius: 20
  },
  pagination3: {
    width: 8,
    height: 20,
    backgroundColor:'lightgrey',
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
