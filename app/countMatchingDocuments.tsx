import { collection, getDocs, getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { app } from "./firebase"; // Replace with your Firebase config path

const db = getFirestore(app);

/**
 * Listens for changes in the DriverOnBoarding collection and counts documents
 * where the text before "-" in the doc ID matches the given ShippingPoint.
 *
 * @param {string} shippingPoint - The ShippingPoint to match.
 * @param {(count: number) => void} callback - Function to handle the count updates.
 */
const countMatchingDocuments = (shippingPoint: string, callback: (count: number) => void) => {
  const driverCollection = collection(db, "DriverOnBoarding");

  // Real-time listener
  const unsubscribe = onSnapshot(driverCollection, (snapshot) => {
    let count = 0;

    snapshot.forEach((doc) => {
      const docId = doc.id; // Get the document ID
      const prefix = docId.split("-")[0]; // Extract text before "-"

      if (prefix === shippingPoint) {
        count++;
      }
    });

    // Pass the count to the callback
    callback(count);
  });

  return unsubscribe; // Return the unsubscribe function to stop listening when needed
};

export default countMatchingDocuments;
