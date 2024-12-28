import React, { useState, useRef } from 'react';
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
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential} from 'firebase/auth';
import { app } from '../firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

type SignUpProps = {};

export default function SignUp({}: SignUpProps) {

  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const recaptchaVerifier = useRef<any>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);

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

  const dismissKeyboard = (): void => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  const auth = getAuth(app);
  const db = getFirestore(app);

  const sendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number.');
      return;
    }

    try {
      // Check if the phone number already exists
    const usersCollection = collection(db, 'users'); // Replace 'users' with your Firestore collection name
    const phoneQuery = query(usersCollection, where('phone', '==', phoneNumber));
    const querySnapshot = await getDocs(phoneQuery);

    if (!querySnapshot.empty) {
      Alert.alert('Duplicate Phone Number', 'This phone number is already registered.');
      return;
    }
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber}`, recaptchaVerifier.current);
    //   const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber}`);
      setVerificationId(confirmationResult.verificationId);
      setIsOtpStep(true);
      Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      Alert.alert('Success', 'OTP verified successfully!');
      // Navigate to the next screen or perform the desired action
      router.push('/credentials/whoami');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      
        

          {/* Add reCAPTCHA modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

        <Animated.View style={[styles.heroSection, animatedContainerStyle]}>
        <View style={styles.topSection}>
        
        <TouchableOpacity onPress={() => router.push('/credentials/signIn')}>
          <Text style={styles.customFont2}>Go to sign in</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/Arrow.png')}
          style={{ width: 30, resizeMode: 'contain' }}
        />
      </View>
          <Image source={require('../../assets/images/SignUp.png')} resizeMode='contain' style={{width:'25%', height:'25%', marginLeft:10}}/>
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
                keyboardType='phone-pad'
                maxLength={isOtpStep ? 6 : 14}
                textAlign="center"
                returnKeyType="done"
                value={isOtpStep ? otp : phoneNumber}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChangeText={(text: string) =>
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
            <TouchableOpacity
            style={styles.submitButton}
            onPress={isOtpStep ? verifyOtp : sendOtp}
          >
            <Text style={styles.submitButtonText}>
              {isOtpStep ? 'Verify OTP' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
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
    height: '40%',
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
    marginTop: 20,
    width: '50%'
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Nunito',
    fontSize: 18,
    textAlign: 'center',
  },
});
