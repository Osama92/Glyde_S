// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system"; // Import FileSystem to read the image file
// import { Button, Card, Title } from "react-native-paper";

// const InvoiceScreen = () => {
//   const [billerName, setBillerName] = useState("Glyde Systems Services");
//   const [billTo, setBillTo] = useState("FMCG Distribution Ltd");
//   const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
//   const [items, setItems] = useState([{ description: "", quantity: "", unitPrice: "" }]);
//   const [logoUri, setLogoUri] = useState(null);
//   const [logoBase64, setLogoBase64] = useState(null); // Store base64-encoded image
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Generate a random invoice number
//   function generateInvoiceNumber() {
//     const randomNumber = Math.floor(Math.random() * 10000);
//     return `INV-${new Date().getFullYear()}-${randomNumber}`;
//   }

//   // Pick logo from the device's library and convert it to base64
//   const pickLogo = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       alert("Sorry, we need camera roll permissions to select a logo.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       const uri: any = result.assets[0].uri;
//       setLogoUri(uri);

//       // Convert the image to base64
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       setLogoBase64(`data:image/jpeg;base64,${base64}`); // Use the correct MIME type (e.g., image/jpeg)
//     }
//   };

//   const addItem = () => {
//     setItems([...items, { description: "", quantity: "", unitPrice: "" }]);
//   };

//   const handleItemChange = (text, index, field) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = text;
//     setItems(updatedItems);
//   };

//   const calculateTotal = () => {
//     return items.reduce((total, item: any) => {
//       return total + (item.quantity * item.unitPrice || 0);
//     }, 0);
//   };

//   const generateInvoiceHTML = () => {
//     const itemsHTML = items
//       .map(
//         (item: any, index) => `
//         <tr>
//           <td>${index + 1}</td>
//           <td>${item.description}</td>
//           <td>${item.quantity}</td>
//           <td>₦${item.unitPrice}</td>
//           <td>₦${item.quantity * item.unitPrice}</td>
//         </tr>
//       `
//       )
//       .join("");

//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; position: relative; overflow: hidden; }
//             .invoice { width: 100%; max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
//             .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
//             .logo { width: 100px; height: auto; float: right; }
//             .biller-info { flex: 1; margin-right: 20px; }
//             .invoice-info { text-align: right; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
//             .total { text-align: right; font-weight: bold; margin-top: 20px; }
//             .watermark { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0; }
//             .watermark-text { font-size: 40px; transform: rotate(-45deg); color: #ccc; position: absolute; }
//             .watermark-1 { top: 10%; left: 10%; }
//             .watermark-2 { top: 30%; left: 50%; }
//             .watermark-3 { top: 50%; left: 20%; }
//             .watermark-4 { top: 70%; left: 60%; }
//             .watermark-5 { top: 90%; left: 30%; }
//           </style>
//         </head>
//         <body>
//           <div class="watermark">
//             <div class="watermark-text watermark-1">Gooat</div>
//             <div class="watermark-text watermark-2">Gooat</div>
//             <div class="watermark-text watermark-3">Gooat</div>
//             <div class="watermark-text watermark-4">Gooat</div>
//             <div class="watermark-text watermark-5">Gooat</div>
//           </div>
//           <div class="invoice">
//             <div class="header">
//               <div class="biller-info">
//                 <h2>${billerName}</h2>
//                 <p>No 56 Obayan Street, Akoka</p>
//                 <p>Yaba, Lagos State</p>
//                 <p>Nigeria</p>
//                 <h3>BILL TO</h3>
//                 <p>${billTo}</p>
//                 <p>No.1, Cocoa Industries Road</p>
//                 <p>Ogba, Ikeja</p>
//                 <p>Lagos state, Nigeria.</p>
//               </div>
//               <div class="invoice-info">
//                 ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
//                 <h2>INVOICE #${invoiceNumber}</h2>
//                 <p>Date: ${new Date().toLocaleDateString()}</p>
//               </div>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Description</th>
//                   <th>Quantity</th>
//                   <th>Unit Price</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHTML}
//               </tbody>
//             </table>
//             <div class="total">Total: ₦${calculateTotal()}</div>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const { uri } = await Print.printToFileAsync({
//         html: generateInvoiceHTML(),
//       });
//       console.log("PDF generated at:", uri);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Invoice" });
//       } else {
//         console.log("Sharing is not available on this platform.");
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Content>
//           <Title>Create Invoice</Title>
//           <Button mode="contained" onPress={pickLogo} style={styles.button}>
//             Select Logo
//           </Button>
//           {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
//           <TextInput
//             style={styles.input}
//             placeholder="Biller Name"
//             value={billerName}
//             onChangeText={setBillerName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Bill To"
//             value={billTo}
//             onChangeText={setBillTo}
//           />
//           {items.map((item, index) => (
//             <View key={index} style={styles.itemRow}>
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Description"
//                 value={item.description}
//                 onChangeText={(text) => handleItemChange(text, index, "description")}
//               />
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Quantity"
//                 value={item.quantity}
//                 onChangeText={(text) => handleItemChange(text, index, "quantity")}
//                 keyboardType="numeric"
//               />
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Unit Price"
//                 value={item.unitPrice}
//                 onChangeText={(text) => handleItemChange(text, index, "unitPrice")}
//                 keyboardType="numeric"
//               />
//             </View>
//           ))}
//           <Button mode="contained" onPress={addItem} style={styles.button}>
//             Add Item
//           </Button>
//           <Button
//             mode="contained"
//             onPress={generatePDF}
//             style={styles.generateButton}
//             disabled={isGenerating}
//           >
//             {isGenerating ? <ActivityIndicator color="#fff" /> : "Generate PDF"}
//           </Button>
//         </Card.Content>
//       </Card>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   card: {
//     marginBottom: 20,
//   },
//   input: {
//     marginBottom: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//   },
//   itemRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   itemInput: {
//     flex: 1,
//     marginRight: 5,
//   },
//   button: {
//     marginTop: 10,
//     backgroundColor: "#6200ee",
//   },
//   generateButton: {
//     marginTop: 20,
//     backgroundColor: "#03dac6",
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 10,
//   },
// });

// export default InvoiceScreen;




// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system"; // Import FileSystem to read the image file
// import { Button, Card, Title } from "react-native-paper";

// const InvoiceScreen = () => {
//   const [billerName, setBillerName] = useState("Glyde Systems Services");
//   const [billTo, setBillTo] = useState("FMCG Distribution Ltd");
//   const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
//   const [items, setItems] = useState([{ truckType: "", quantity: "", unitPrice: "" }]);
//   const [logoUri, setLogoUri] = useState(null);
//   const [logoBase64, setLogoBase64] = useState(null); // Store base64-encoded image
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Generate a random invoice number
//   function generateInvoiceNumber() {
//     const randomNumber = Math.floor(Math.random() * 10000);
//     return `INV-${new Date().getFullYear()}-${randomNumber}`;
//   }

//   // Pick logo from the device's library and convert it to base64
//   const pickLogo = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       alert("Sorry, we need camera roll permissions to select a logo.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       const uri: any = result.assets[0].uri;
//       setLogoUri(uri);

//       // Convert the image to base64
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       setLogoBase64(`data:image/jpeg;base64,${base64}`); // Use the correct MIME type (e.g., image/jpeg)
//     }
//   };

//   const addItem = () => {
//     setItems([...items, { truckType: "", quantity: "", unitPrice: "" }]);
//   };

//   const handleItemChange = (text, index, field) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = text;
//     setItems(updatedItems);
//   };

//   const calculateTotal = () => {
//     return items.reduce((total, item: any) => {
//       return total + (item.quantity * item.unitPrice || 0);
//     }, 0);
//   };

//   const generateInvoiceHTML = () => {
//     const itemsHTML = items
//       .map(
//         (item: any, index) => `
//         <tr>
//           <td>${index + 1}</td>
//           <td>${item.description}</td>
//           <td>${item.quantity}</td>
//           <td>₦${item.unitPrice}</td>
//           <td>₦${item.quantity * item.unitPrice}</td>
//         </tr>
//       `
//       )
//       .join("");

//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; position: relative; overflow: hidden; }
//             .invoice { width: 100%; max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
//             .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
//             .logo { width: 100px; height: auto; float: right; }
//             .biller-info { flex: 1; margin-right: 20px; }
//             .invoice-info { text-align: right; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
//             .total { text-align: right; font-weight: bold; margin-top: 20px; }
//             .watermark { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0; }
//             .watermark-text { font-size: 40px; transform: rotate(-45deg); color: #ccc; position: absolute; }
//             .watermark-1 { top: 10%; left: 10%; }
//             .watermark-2 { top: 30%; left: 50%; }
//             .watermark-3 { top: 50%; left: 20%; }
//             .watermark-4 { top: 70%; left: 60%; }
//             .watermark-5 { top: 90%; left: 30%; }
//             .terms { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
//             .terms h2 { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
//             .terms p { font-size: 14px; margin-bottom: 10px; }
//             .invoice-total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; }
//           </style>
//         </head>
//         <body>
//           <div class="watermark">
//             <div class="watermark-text watermark-1">Gooat</div>
//             <div class="watermark-text watermark-2">Gooat</div>
//             <div class="watermark-text watermark-3">Gooat</div>
//             <div class="watermark-text watermark-4">Gooat</div>
//             <div class="watermark-text watermark-5">Gooat</div>
//           </div>
//           <div class="invoice">
//             <div class="header">
//               <div class="biller-info">
//                 <h2>${billerName}</h2>
//                 <p>No 56 Obayan Street, Akoka</p>
//                 <p>Yaba, Lagos State</p>
//                 <p>Nigeria</p>
//                 <h3>BILL TO</h3>
//                 <p>${billTo}</p>
//                 <p>No.1, Cocoa Industries Road</p>
//                 <p>Ogba, Ikeja</p>
//                 <p>Lagos state, Nigeria.</p>
//               </div>
//               <div class="invoice-info">
//                 ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
//                 <h2>INVOICE #${invoiceNumber}</h2>
//                 <p>Date: ${new Date().toLocaleDateString()}</p>
//               </div>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Truck Type</th>
//                   <th>Description</th>
//                   <th>Unit Price</th>
//                   <th>Number of Customer</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHTML}
//               </tbody>
//             </table>
//             <div class="invoice-total">Total: ₦${calculateTotal()}</div>
//             <div class="terms">
//               <h2>TERMS & CONDITIONS</h2>
//               <p>Please pay to ${billerName} accounts.</p>
//               <p>Bank Name: Parallex Bank</p>
//               <p>Account name: Glyde Systems Services LTD</p>
//               <p>Account Number: 1000209551</p>
//               <p>OR</p>
//               <p>Bank name: Providus bank</p>
//               <p>Account Name: Glyde systems services</p>
//               <p>Account Number: 1305569043</p>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const { uri } = await Print.printToFileAsync({
//         html: generateInvoiceHTML(),
//       });
//       console.log("PDF generated at:", uri);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Invoice" });
//       } else {
//         console.log("Sharing is not available on this platform.");
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Content>
//           <Title>Create Invoice</Title>
//           <Button mode="contained" onPress={pickLogo} style={styles.button}>
//             Select Logo
//           </Button>
//           {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
//           <TextInput
//             style={styles.input}
//             placeholder="Biller Name"
//             value={billerName}
//             onChangeText={setBillerName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Bill To"
//             value={billTo}
//             onChangeText={setBillTo}
//           />
//           {items.map((item, index) => (
//             <View key={index} style={styles.itemRow}>
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Truck Type"
//                 value={item.truckType}
//                 onChangeText={(text) => handleItemChange(text, index, "Truck Type")}
//               />
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Route Description"
//                 value={item.quantity}
//                 onChangeText={(text) => handleItemChange(text, index, "quantity")}
//                 keyboardType="numeric"
//               />
//               <TextInput
//                 style={[styles.input, styles.itemInput]}
//                 placeholder="Unit Price"
//                 value={item.unitPrice}
//                 onChangeText={(text) => handleItemChange(text, index, "unitPrice")}
//                 keyboardType="numeric"
//               />
//             </View>
//           ))}
//           <Button mode="contained" onPress={addItem} style={styles.button}>
//             Add Item
//           </Button>
//           <Button
//             mode="contained"
//             onPress={generatePDF}
//             style={styles.generateButton}
//             disabled={isGenerating}
//           >
//             {isGenerating ? <ActivityIndicator color="#fff" /> : "Generate PDF"}
//           </Button>
//         </Card.Content>
//       </Card>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   card: {
//     marginBottom: 20,
//   },
//   input: {
//     marginBottom: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//   },
//   itemRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   itemInput: {
//     flex: 1,
//     marginRight: 5,
//   },
//   button: {
//     marginTop: 10,
//     backgroundColor: "#6200ee",
//   },
//   generateButton: {
//     marginTop: 20,
//     backgroundColor: "#03dac6",
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 10,
//   },
// });

// export default InvoiceScreen;



import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Import FileSystem to read the image file
import { Button, Card, Title } from "react-native-paper";

const InvoiceScreen = () => {
  const [billerName, setBillerName] = useState("Glyde Systems Services");
  const [billerAddress, setBillerAddress] = useState("No 56 Obayan Street, Akoka, Yaba, Lagos State, Nigeria");
  const [billTo, setBillTo] = useState("FMCG Distribution Ltd");
  const [billToAddress, setBillToAddress] = useState("No.1, Cocoa Industries Road, Ogba, Ikeja, Lagos state, Nigeria.");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [truckType, setTruckType] = useState("20T");
  const [description, setDescription] = useState("FFF 117 XC - Delivery to Abuja from Ajao");
  const [unitPrice, setUnitPrice] = useState("1549352.00");
  const [numberOfCustomers, setNumberOfCustomers] = useState("1");
  const [numberOfLocations, setNumberOfLocations] = useState("1");
  const [serviceCharge, setServiceCharge] = useState("5000.00");
  const [vat, setVat] = useState("375.00");
  const [bankName, setBankName] = useState("Parallex Bank");
  const [accountName, setAccountName] = useState("Glyde Systems Services LTD");
  const [accountNumber, setAccountNumber] = useState("1000209551");
  const [logoUri, setLogoUri] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null); // Store base64-encoded image
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a random invoice number
  function generateInvoiceNumber() {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `INV-${new Date().getFullYear()}-${randomNumber}`;
  }

  // Pick logo from the device's library and convert it to base64
  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to select a logo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri: any = result.assets[0].uri;
      setLogoUri(uri);

      // Convert the image to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLogoBase64(`data:image/jpeg;base64,${base64}`); // Use the correct MIME type (e.g., image/jpeg)
    }
  };

  const calculateTotal = () => {
    const total = parseFloat(unitPrice) * parseFloat(numberOfCustomers);
    return total.toFixed(2);
  };

  const generateInvoiceHTML = () => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; position: relative; overflow: hidden; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .logo { width: 100px; height: auto; float: right; }
            .biller-info { flex: 1; margin-right: 20px; }
            .invoice-info { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .watermark { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0; }
            .watermark-text { font-size: 40px; transform: rotate(-45deg); color: #ccc; position: absolute; }
            .watermark-1 { top: 10%; left: 10%; }
            .watermark-2 { top: 30%; left: 50%; }
            .watermark-3 { top: 50%; left: 20%; }
            .watermark-4 { top: 70%; left: 60%; }
            .watermark-5 { top: 90%; left: 30%; }
            .terms { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
            .terms h2 { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .terms p { font-size: 14px; margin-bottom: 10px; }
            .invoice-total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="watermark">
            <div class="watermark-text watermark-1">Gooat</div>
            <div class="watermark-text watermark-2">Gooat</div>
            <div class="watermark-text watermark-3">Gooat</div>
            <div class="watermark-text watermark-4">Gooat</div>
            <div class="watermark-text watermark-5">Gooat</div>
          </div>
          <div class="invoice">
            <div class="header">
              <div class="biller-info">
                <h2>${billerName}</h2>
                <p>${billerAddress}</p>
                <h3>BILL TO</h3>
                <p>${billTo}</p>
                <p>${billToAddress}</p>
              </div>
              <div class="invoice-info">
                ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
                <h2>INVOICE #${invoiceNumber}</h2>
                <p>Date: ${date}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Truck Type</th>
                  <th>Description</th>
                  <th>Unit Price</th>
                  <th>Number of Customers</th>
                  <th>Number of Locations</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${date}</td>
                  <td>${truckType}</td>
                  <td>${description}</td>
                  <td>₦${unitPrice}</td>
                  <td>${numberOfCustomers}</td>
                  <td>${numberOfLocations}</td>
                  <td>₦${calculateTotal()}</td>
                </tr>
              </tbody>
            </table>
            <div class="invoice-total">Total: ₦${calculateTotal()}</div>
            <div class="terms">
              <h2>TERMS & CONDITIONS</h2>
              <p>Please pay to ${accountName} accounts.</p>
              <p>Bank Name: ${bankName}</p>
              <p>Account name: ${accountName}</p>
              <p>Account Number: ${accountNumber}</p>
              <p>Service Charge: ₦${serviceCharge}</p>
              <p>VAT 7.5% Service Charge: ₦${vat}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateInvoiceHTML(),
      });
      console.log("PDF generated at:", uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Invoice" });
      } else {
        console.log("Sharing is not available on this platform.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Create Invoice</Title>
          <Button mode="contained" onPress={pickLogo} style={styles.button}>
            Select Logo
          </Button>
          {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
          <TextInput
            style={styles.input}
            placeholder="Biller Name"
            value={billerName}
            onChangeText={setBillerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Biller Address"
            value={billerAddress}
            onChangeText={setBillerAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Bill To"
            value={billTo}
            onChangeText={setBillTo}
          />
          <TextInput
            style={styles.input}
            placeholder="Bill To Address"
            value={billToAddress}
            onChangeText={setBillToAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Date"
            value={date}
            onChangeText={setDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Truck Type"
            value={truckType}
            onChangeText={setTruckType}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Unit Price"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Customers"
            value={numberOfCustomers}
            onChangeText={setNumberOfCustomers}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Locations"
            value={numberOfLocations}
            onChangeText={setNumberOfLocations}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Service Charge"
            value={serviceCharge}
            onChangeText={setServiceCharge}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="VAT 7.5% Service Charge"
            value={vat}
            onChangeText={setVat}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Name"
            value={accountName}
            onChangeText={setAccountName}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
          <Button
            mode="contained"
            onPress={generatePDF}
            style={styles.generateButton}
            disabled={isGenerating}
          >
            {isGenerating ? <ActivityIndicator color="#fff" /> : "Generate PDF"}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200ee",
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: "#03dac6",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default InvoiceScreen;