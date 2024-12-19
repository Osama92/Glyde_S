import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function O_screen1() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
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
      router.push('/onboarding/o_Screen2'); // Navigate to the next screen
    }, 300);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263238" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image source={require('../../assets/images/BoxImg.png')} resizeMode="contain" style={styles.gifStyle} />
      <Text style={styles.customFont1}>Logistics that works</Text>
      <Text style={styles.customFont2}>Experience fast and hassle-free pick-up and delivery to your destination</Text>

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
    backgroundColor: '#F7F8FA',
  },
  customFont1: {
    fontFamily: 'Poppins',
    fontSize: 24,
    color: 'black',
    marginBottom: 10,
  },
  customFont2: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  gifStyle: {
    width: 200,
    height: 250,
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pagination1: {
    width: 8,
    height: 20,
    backgroundColor: '#263238',
    margin: 8,
    borderRadius: 20,
  },
  pagination2: {
    width: 8,
    height: 20,
    backgroundColor: 'lightgrey',
    margin: 8,
    borderRadius: 20,
  },
  pagination3: {
    width: 8,
    height: 20,
    backgroundColor: 'lightgrey',
    margin: 8,
    borderRadius: 20,
  },
  button: {
    width: '80%',
    height: 60,
    backgroundColor: '#263238',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customFont3: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: 'white',
  },
});
