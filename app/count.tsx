import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { collection, query, where, onSnapshot, getFirestore } from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust the import path to your Firebase configuration

const db = getFirestore(app);

const CheckLoadingPointOccurrences = ({ searchValue }) => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  // Function to fetch data
  const fetchData = () => {
    try {
      // console.log("Searching for LoadingPoint:", searchValue);

      // Create a query to check if the `LoadingPoint` field matches the `searchValue`
      const q = query(collection(db, "DriverOnBoarding"), where("LoadingPoint", "==", searchValue));

      // Set up a real-time listener using onSnapshot
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        // Log the query results for debugging
        console.log("Query results:", querySnapshot.docs.map(doc => doc.data()));

        // Get the count of documents that match the query
        setCount(querySnapshot.size);
      

        // Stop loading once data is fetched
        setLoading(false);
      });

      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    } catch (error) {
      console.error("Error checking LoadingPoint occurrences: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when the component mounts or searchValue changes
    const unsubscribe = fetchData();

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [searchValue]);

  // Function to manually refresh data
  const handleRefresh = () => {
    setLoading(true); // Show loading indicator
    fetchData(); // Fetch data again
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="orange" />
      </View>
    );
  }

  return (
    <>
      
      <TouchableOpacity onPress={handleRefresh}>
      <Text style={styles.text}>
        {String(count).padStart(2, '0')}
      </Text>
      </TouchableOpacity>
    </>
  );
};

export default CheckLoadingPointOccurrences;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    textAlign: "left",
  },
  refreshButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});