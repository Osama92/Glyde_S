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




// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useFonts } from 'expo-font';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// export default function SignUp() {
//   const router = useRouter();
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [isInputFocused, setIsInputFocused] = useState(false);

//   const [fontsLoaded] = useFonts({
//     Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
//     Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
//   });

//   // Animation for the input container when keyboard is active
//   const translateY = useSharedValue(0);

//   const animatedContainerStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { translateY: withTiming(isInputFocused ? -100 : 0, { duration: 300 }) },
//       ],
//     };
//   });

//   // Dismiss keyboard when tapping anywhere
//   const dismissKeyboard = () => {
//     Keyboard.dismiss();
//     setIsInputFocused(false);
//   };

//   return (
//     <TouchableWithoutFeedback onPress={dismissKeyboard}>
//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <View style={styles.topSection}>
//           <TouchableOpacity onPress={() => router.push('/signin')}>
//             <Text style={styles.customFont2}>Go to sign in</Text>
//           </TouchableOpacity>
//           <Image
//             source={require('../../assets/images/Arrow.png')}
//             style={{ width: 30, resizeMode: 'contain' }}
//           />
//         </View>

//         <Animated.View style={[styles.heroSection, animatedContainerStyle]}>
//           <Text style={styles.customFont1}>Sign Up</Text>
//           <Text style={styles.customFont3}>Let’s get you on board!</Text>
//           <View style={styles.phoneEntry}>
//             <Text style={{ paddingBottom: 30, fontFamily:'Nunito' }}>Enter Mobile Number</Text>
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.phoneInput}
//                 keyboardType="numeric"
//                 maxLength={11}
//                 textAlign="center"
//                 returnKeyType="done"
//                 value={phoneNumber}
//                 onFocus={() => setIsInputFocused(true)}
//                 onBlur={() => setIsInputFocused(false)}
//                 onChangeText={(text) => setPhoneNumber(text)}
//                 placeholder="Your phone number"
//                 placeholderTextColor="#aaa"
//               />
//               {phoneNumber.length > 0 && (
//                 <TouchableOpacity
//                   style={styles.clearIcon}
//                   onPress={() => setPhoneNumber('')}
//                 >
//                   <Text style={styles.clearText}>✕</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </Animated.View>
//       </KeyboardAvoidingView>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   customFont1: {
//     fontFamily: 'Poppins',
//     fontSize: 54,
//     color: 'black',
//     marginBottom: 10,
//     paddingLeft: 30,
//   },
//   customFont2: {
//     fontFamily: 'Nunito',
//     fontSize: 16,
//     color: 'black',
//     textAlign: 'center',
//     paddingRight: 10,
//   },
//   customFont3: {
//     fontFamily: 'Nunito',
//     fontSize: 20,
//     color: 'black',
//     paddingLeft: 30,
//   },
//   topSection: {
//     width: '100%',
//     height: '20%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingRight: 30,
//   },
//   heroSection: {
//     height: '80%',
//     width: '100%',
//   },
//   phoneEntry: {
//     flexDirection: 'column',
//     width: '100%',
//     height: '30%',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     fontFamily: 'Nunito',
//     marginTop: 20,
//   },
//   phoneInput: {
//     height: 50,
//     width: '80%',
//     backgroundColor: '#f3f3f3',
//     borderRadius: 10,
//     fontSize: 20,
//     paddingHorizontal: 10,
//     fontFamily: 'Nunito',
//     color: '#000',
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   clearIcon: {
//     position: 'absolute',
//     right: 20,
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   clearText: {
//     fontSize: 18,
//     color: '#aaa',
//   },
// });

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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getAuth, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { app } from '../firebase'; // Make sure this points to your firebaseConfig file

export default function SignUp() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [isOtpStep, setIsOtpStep] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
  });

  const translateY = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isInputFocused ? -100 : 0, { duration: 300 }) },
      ],
    };
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  const auth = getAuth(app);

  // Function to send OTP
  const sendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number.');
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber}`);
      setConfirmation(confirmationResult);
      setIsOtpStep(true);
      Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP sent to your phone.');
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(confirmation.verificationId, otp);
      await signInWithCredential(auth, credential);
      Alert.alert('Success', 'OTP verified successfully!');
      router.push('/dashboard'); // Navigate to the dashboard
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    }
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
          <Text style={styles.customFont3}>
            {isOtpStep ? 'Verify OTP' : 'Let’s get you on board!'}
          </Text>
          <View style={styles.phoneEntry}>
            <Text style={{ paddingBottom: 30 }}>
              {isOtpStep ? 'Enter OTP' : 'Enter Mobile Number'}
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.phoneInput}
                keyboardType="numeric"
                maxLength={isOtpStep ? 6 : 11}
                textAlign="center"
                returnKeyType="done"
                value={isOtpStep ? otp : phoneNumber}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChangeText={(text) =>
                  isOtpStep ? setOtp(text) : setPhoneNumber(text)
                }
                placeholder={isOtpStep ? 'Enter OTP' : 'Your phone number'}
                placeholderTextColor="#aaa"
              />
              {(isOtpStep ? otp : phoneNumber).length > 0 && (
                <TouchableOpacity
                  style={styles.clearIcon}
                  onPress={() => (isOtpStep ? setOtp('') : setPhoneNumber(''))}
                >
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={isOtpStep ? verifyOtp : sendOtp}
          >
            <Text style={styles.submitButtonText}>
              {isOtpStep ? 'Verify OTP' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
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
    fontSize: 18,
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
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Nunito',
    fontSize: 18,
    textAlign: 'center',
  },
});
