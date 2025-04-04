// utils/geocode.ts
import axios from 'axios';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

export const getLGAFromCoords = async (lat: number, lng: number, customerId?: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: 'AIzaSyB2eJbCGeuoY2t6mvf8SjiYk0QPrevGKi0', // Replace with your actual API key
          result_type: 'administrative_area_level_2'
        }
      }
    );

    // Extract LGA from results
    const lga = response.data.results[0]?.address_components[0]?.long_name || null;
    
    // Cache the LGA in Firestore if customerId provided
    if (lga && customerId) {
      await updateDoc(doc(db, "customer", customerId), {
        lga
      });
    }

    return lga;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const extractLGAFromAddress = (address: string): string | null => {
  // Try to extract LGA from common address patterns
  const patterns = [
    /,\s*([^,]+?)\s*(?:LGA|Local Government Area)\b/i,
    /,\s*([^,]+?),\s*Lagos/i,
    /(Eti-Osa|Ikeja|Kosofe|Agege|Alimosho)/i
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
};