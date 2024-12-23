// import React from "react";
// import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import { useFonts } from "expo-font";

// const { width } = Dimensions.get('screen');

// const accounts = [
//   { title: "Delivery Driver", image: require("../../assets/images/Driver.png"), index: 0 },
//   { title: "Customer", image: require("../../assets/images/Customer.png"), index: 1 },
//   { title: "Field Agent", image: require("../../assets/images/FieldAgent.png"), index: 2 },
//   { title: "Transporter", image: require("../../assets/images/Transporter.png"), index: 3 },
// ];

// export default function Whoami() {
//   const [fontsLoaded] = useFonts({
//     Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
//     Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
//   });

//   if (!fontsLoaded) return null;

//   return (
//     <View style={styles.container}>
      
//       <Text style={styles.title}>Choose your preferred account</Text>

//       <Carousel
//         width={width}
//         data={accounts}
//         scrollAnimationDuration={500}
//         onSnapToItem={(item) => console.log('current index:', item)}
//         renderItem={({ item }) => (
//           <View style={styles.carouselItem}>
//             <Image source={item.image} style={styles.image} />
//             <Text style={styles.accountTitle}>{item.title}</Text>
//           </View>
//         )}
//       />

//       {/* Footer Note */}
//       <Text style={styles.note}>
//         This preference can be changed in the profile area
//       </Text>

//       {/* Proceed Button */}
//       <TouchableOpacity style={styles.button}>
//         <Text style={styles.buttonText}>Proceed</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   header: {
//     fontSize: 16,
//     fontFamily: "Poppins",
//     color: "#333",
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontFamily: "Poppins",
//     textAlign: "center",
//     color: "#000",
//     marginTop: 60,
//   },
//   carouselItem: {
//     width: width, 
//     alignItems: "center",
//     justifyContent: "center",
    
//   },
//   image: {
//     width: width,
//     height: 300,
//     resizeMode: "contain",
 
    
//   },
//   accountTitle: {
//     fontSize: 20,
//     fontFamily: "Poppins",
//     color: "#000",
//     marginTop: 20
//   },
//   note: {
//     fontSize: 14,
//     fontFamily: "Nunito",
//     color: "#666",
//     //marginTop: 20,
//     textAlign: "center",
//     paddingHorizontal: 20,
//   },
//   button: {
//     marginTop: 20,
//     marginBottom: 30,
//     backgroundColor: "#000",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontFamily: "Nunito",
//     color: "#fff",
//   },
// });
// This Works ooo 😁

import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

const { width } = Dimensions.get('screen');

const accounts = [
  { title: "Delivery Driver", image: require("../../assets/images/Driver.png"), index: 0 },
  { title: "Customer", image: require("../../assets/images/Customer.png"), index: 1 },
  { title: "Field Agent", image: require("../../assets/images/FieldAgent.png"), index: 2 },
  { title: "Transporter", image: require("../../assets/images/Transporter.png"), index: 3 },
];

export default function Whoami() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Bold.ttf'),
    Nunito: require('../../assets/fonts/Nunito-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleProceed = () => {
    const selectedAccount = accounts[selectedIndex];
    router.push({
      pathname: "/credentials/details",
      params: { title: selectedAccount.title },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your preferred account</Text>

      <Carousel
        width={width}
        data={accounts}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setSelectedIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.accountTitle}>{item.title}</Text>
          </View>
        )}
      />

      <Text style={styles.note}>
        This preference can be changed in the profile area
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
    marginTop: 20,
  },
  note: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: "#666",
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
