import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useFonts } from 'expo-font';


const { width, height } = Dimensions.get('window');

export default function GetStarted() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),  // Add your font file here
  });

  // Shared values for animation
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animated styles for the circular motion and opacity
  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Trigger the circular animation and navigate after 3 seconds
  useEffect(() => {
    // Start the scale animation with timing
    scale.value = withTiming(5, {
      duration: 3000,
      easing: Easing.out(Easing.exp),
    });

    // Fade out the initial screen
    opacity.value = withTiming(0, {
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
    });

    // Navigate to the next screen after 3 seconds
    setTimeout(() => {
      router.push('/credentials/signIn');
    }, 5000); // 3 seconds
  }, []);

  return (
    <View style={styles.container}>
      {/* Circular view that expands */}
      <Animated.View style={[styles.circle, circleStyle]} />
      <Text style={styles.text}>Let's get you started!</Text>

      {/* You can add additional buttons or components here if needed */}
      <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/credentials/signUp')}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  circle: {
    width: width * 1.5, // Ensuring the circle covers the entire screen when fully scaled
    height: width * 1.5, // Making the circle large enough
    backgroundColor: '#D99B43',
    borderRadius: width, // Circle shape
    position: 'absolute',
  },
  text: {
    fontFamily:'Poppins',
    fontSize: 24,
    color: '#ffffff',
    //fontWeight: 'bold',
    zIndex: 1, // Make sure text is above the circle
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#263238',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
