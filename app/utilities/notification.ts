import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { collection, getDocs, getFirestore, doc, setDoc, serverTimestamp, where, query } from "firebase/firestore";
import { app } from "../firebase";

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Function to send push notification via Expo server
export const sendPushNotification = async (expoPushToken: string, title: string, body: string, data?: any) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Function to get customer's push token from Firestore
export const getDeliveryDriverPushToken = async (phoneNumber: string) => {
  try {
    const db = getFirestore(app);
    const q = query(
      collection(db, "deliverydriver"),
      where("phoneNumber", "==", phoneNumber)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().expoPushToken;
    }
    return null;
  } catch (error) {
    console.error("Error getting customer push token:", error);
    return null;
  }
};