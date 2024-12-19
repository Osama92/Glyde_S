// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useFonts } from 'expo-font';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// export default function SignUp() {
//   const router = useRouter();

//   const [fontsLoaded] = useFonts({
//     Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
//     Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
//   });

  

//   return (
    
//       <View style={styles.container}>
//         <View style={styles.topSection}>
//             <TouchableOpacity>
//             <Text style={styles.customFont2}>Go to sign in</Text>
//             </TouchableOpacity>
//             <Image source={require('../../assets/images/Arrow.png')} style={{width: 30, resizeMode:'contain'}}/>
//         </View>

//         <View style={styles.heroSection}>
//             <Text style={styles.customFont1}>Sign Up</Text>
//             <Text style={styles.customFont3}>Let’s get you on board!</Text>
//             <View style={styles.phoneEntry}>
//                 <Text style={{paddingBottom:30}}>Enter Mobile Number</Text>
//                 <TextInput style={styles.phoneInput} keyboardType='numeric' maxLength={11} textAlign='center' returnKeyType='done'/>
//             </View>

//         </View>
        
//       </View>

   
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection:'column'
//   },
//   customFont1: {
//     fontFamily: 'Poppins',
//     fontSize: 54,
//     color: 'black',
//     marginBottom: 10,
//     paddingLeft: 30
//   },
//   customFont2: {
//     fontFamily: 'Nunito',
//     fontSize: 16,
//     color: 'black',
//     textAlign: 'center',
//     paddingRight:10
//   },
//   customFont3: {
//     fontFamily: 'Nunito',
//     fontSize: 20,
//     color: 'black',
//     paddingLeft:30
//   },
//   topSection: {
//     width: '100%',
//     height: '20%',
//     // position: 'absolute',
//     // top: 50,
//     flexDirection:'row',
//     alignItems:'center',
//     justifyContent:'flex-end',
//     paddingRight: 30
//   },
//   heroSection: {
//     height:'80%',
//     width: '100%',
//   },
//   phoneEntry: {
//     flexDirection:'column',
//     width:'100%',
//     height: '30%',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     fontFamily: 'Nunito',
//     marginTop:20
//   },
//   phoneInput: {
//     height:50,
//     width: '80%',
//     backgroundColor: '#f3f3f3'

//   }
//   });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function SignUp() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
  });

  // Animation for the input container when keyboard is active
  const translateY = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isInputFocused ? -100 : 0, { duration: 300 }) },
      ],
    };
  });

  // Dismiss keyboard when tapping anywhere
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={styles.customFont2}>Go to sign in</Text>
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/Arrow.png')}
            style={{ width: 30, resizeMode: 'contain' }}
          />
        </View>

        <Animated.View style={[styles.heroSection, animatedContainerStyle]}>
          <Text style={styles.customFont1}>Sign Up</Text>
          <Text style={styles.customFont3}>Let’s get you on board!</Text>
          <View style={styles.phoneEntry}>
            <Text style={{ paddingBottom: 30, fontFamily:'Nunito' }}>Enter Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.phoneInput}
                keyboardType="numeric"
                maxLength={11}
                textAlign="center"
                returnKeyType="done"
                value={phoneNumber}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChangeText={(text) => setPhoneNumber(text)}
                placeholder="Your phone number"
                placeholderTextColor="#aaa"
              />
              {phoneNumber.length > 0 && (
                <TouchableOpacity
                  style={styles.clearIcon}
                  onPress={() => setPhoneNumber('')}
                >
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customFont1: {
    fontFamily: 'Poppins',
    fontSize: 54,
    color: 'black',
    marginBottom: 10,
    paddingLeft: 30,
  },
  customFont2: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    paddingRight: 10,
  },
  customFont3: {
    fontFamily: 'Nunito',
    fontSize: 20,
    color: 'black',
    paddingLeft: 30,
  },
  topSection: {
    width: '100%',
    height: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 30,
  },
  heroSection: {
    height: '80%',
    width: '100%',
  },
  phoneEntry: {
    flexDirection: 'column',
    width: '100%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    fontFamily: 'Nunito',
    marginTop: 20,
  },
  phoneInput: {
    height: 50,
    width: '80%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    fontSize: 20,
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clearIcon: {
    position: 'absolute',
    right: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 18,
    color: '#aaa',
  },
});
