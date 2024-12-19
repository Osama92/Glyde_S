import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// Keep the splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  // Shared values for animations
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animated style for the splash image
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(scale.value, { duration: 1000, easing: Easing.out(Easing.exp) }) }],
      opacity: withTiming(opacity.value, { duration: 500 }),
    };
  });

  useEffect(() => {
    // Start the scale animation
    scale.value = 1.5;

    setTimeout(async () => {
      // Fade out the splash screen before navigating
      opacity.value = 0;

      setTimeout(async () => {
        await SplashScreen.hideAsync();
        router.push('/onboarding/o_screen1');  // Navigate to the start screen with a delay
      }, 500);  // Adding delay for fade-out
    }, 2000);  // Simulate loading time
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.ImageStyle, animatedStyle]}  // Apply the animated style
        resizeMode="contain"
        source={require('../assets/images/Glyde.png')}
      />
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
  ImageStyle: {
    width: 80,
    height: 50,
  },
});
