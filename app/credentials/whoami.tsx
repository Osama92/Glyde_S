import React from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useFonts } from "expo-font";

const { width } = Dimensions.get('screen');

const accounts = [
  { title: "Delivery Driver", image: require("../../assets/images/Driver.png") },
  { title: "Customer", image: require("../../assets/images/Customer.png") },
  { title: "Field Agent", image: require("../../assets/images/FieldAgent.png") },
  { title: "Transporter", image: require("../../assets/images/Transporter.png") },
];

export default function PreferredAccountScreen() {
  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Choose your preferred account</Text>

      <Carousel
        width={width}
        //height={300}
        data={accounts}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.accountTitle}>{item.title}</Text>
          </View>
        )}
      />

      {/* Footer Note */}
      <Text style={styles.note}>
        This preference can be changed in the profile area
      </Text>

      {/* Proceed Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: "#333",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins",
    textAlign: "center",
    color: "#000",
    marginTop: 60,
  },
  carouselItem: {
    width: width, 
    alignItems: "center",
    justifyContent: "center",
    
  },
  image: {
    width: width,
    height: 300,
    resizeMode: "contain",
 
    
  },
  accountTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    color: "#000",
    marginTop: 20
  },
  note: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: "#666",
    //marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: "#fff",
  },
});
