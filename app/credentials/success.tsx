import React, { useEffect } from 'react';
import { View, Text,StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function Success() {
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

      <Text style={styles.customFont1}>Welclome to Glyde.</Text>
      
      <Image source={require('../../assets/images/Care.png')} resizeMode='cover' style={styles.gifStyle}/>
   
       
       <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.customFont3}>Let's Go!</Text>
       </TouchableOpacity>

    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customFont1: {
    fontFamily: 'Poppins',
    fontSize: 40,
    color: 'black',
  },
  customFont2: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: 'black',
    padding:10,
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
