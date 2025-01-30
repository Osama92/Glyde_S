// import * as Location from "expo-location";

// type LocationType = {
//   latitude: number;
//   longitude: number;
// } | null;

// const getCurrentLocation = async (): Promise<LocationType> => {
//   try {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       console.log("Permission to access location was denied");
//       return null;
//     }

//     const location = await Location.getCurrentPositionAsync({});
//     return {
//       latitude: location?.coords.latitude ?? 0,
//       longitude: location?.coords.longitude ?? 0,
//     };
//   } catch (error) {
//     console.error("Error getting location:", error);
//     return null;
//   }
// };

// export default getCurrentLocation;

import * as Location from "expo-location";

type LocationType = {
  latitude: number;
  longitude: number;
  district?: string;
} | null;

const getCurrentLocation = async (): Promise<LocationType> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get district/locality
    const address = await Location.reverseGeocodeAsync({ latitude, longitude });

    return {
      latitude,
      longitude,
      district: address[0]?.subregion || address[0]?.city || "Unknown District",
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
};

export default getCurrentLocation;
