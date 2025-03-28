// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system"; // Import FileSystem to read the image file
// import { Button, Card, Title } from "react-native-paper";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const InvoiceScreen = () => {
//   const [billerName, setBillerName] = useState("");
//   const [billerAddress, setBillerAddress] = useState("");
//   const [billTo, setBillTo] = useState("");
//   const [billToAddress, setBillToAddress] = useState("");
//   const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
//   const [shipmentNo, setShipmentNo] = useState("");
//   const [date, setDate] = useState(new Date().toLocaleDateString());
//   const [truckType, setTruckType] = useState("");
//   const [description, setDescription] = useState("");
//   const [unitPrice, setUnitPrice] = useState("");
//   const [numberOfCustomers, setNumberOfCustomers] = useState("");
//   const [numberOfLocations, setNumberOfLocations] = useState("");
//   const [serviceCharge, setServiceCharge] = useState("");
//   const [vat, setVat] = useState("0.00");
//   const [bankName, setBankName] = useState("");
//   const [accountName, setAccountName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [logoUri, setLogoUri] = useState(null);
//   const [logoBase64, setLogoBase64] = useState(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [items, setItems] = useState([{ id: Date.now(), ShipmentNo: "", TruckType: "", Route: "", FreightCost: "", ServiceCharge: "",Total:"", VAT:"" }]);
  
  
  
  
  
//   const calculateGrandTotals = () => {
//     let subtotal = 0;
//     let totalVat = 0;

//     items.forEach(item => {
//       subtotal += parseFloat(item.Total) || 0;
//       totalVat += parseFloat(item.VAT) || 0;
//     });

//     return {
//       subtotal: subtotal.toFixed(2),
//       totalVat: totalVat.toFixed(2),
//       grandTotal: (subtotal + totalVat).toFixed(2)
//     };
//   };
  
  
  
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

//   const calculateTotal = () => {
//     const total = parseFloat(unitPrice) * parseFloat(numberOfCustomers);
//     return total.toFixed(2);
//   };

//   const calculateVAT = () => {
//     const total = parseFloat(calculateTotal());
//     const vatAmount = (total * 7.5) / 100;
//     setVat(vatAmount.toFixed(2));
//   };

//   const addItem = () => {
//     setItems([...items, {id: Date.now(), ShipmentNo: "", TruckType: "", Route: "", FreightCost: "", ServiceCharge: "",Total:"", VAT:"" }]);
//   };

//   const removeItem = (id) => {
//     if (items.length > 1) {
//       setItems(items.filter(item => item.id !== id));
//     }
//   };

//   const handleItemChange = (text, index, field) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = text;
//     setItems(updatedItems);
//   };

//   useEffect(() => {
//     const loadSavedData = async () => {
//       try {
//         const savedBillerName = await AsyncStorage.getItem("billerName");
//         const savedBillerAddress = await AsyncStorage.getItem("billerAddress");
//         const savedBankName = await AsyncStorage.getItem("bankName");
//         const savedAccountName = await AsyncStorage.getItem("accountName");
//         const savedAccountNumber = await AsyncStorage.getItem("accountNumber");

//         if (savedBillerName) setBillerName(savedBillerName);
//         if (savedBillerAddress) setBillerAddress(savedBillerAddress);
//         if (savedBankName) setBankName(savedBankName);
//         if (savedAccountName) setAccountName(savedAccountName);
//         if (savedAccountNumber) setAccountNumber(savedAccountNumber);
//       } catch (error) {
//         console.error("Error loading saved data:", error);
//       }
//     };

//     loadSavedData();
//   }, []);

//   useEffect(() => {
//     const saveData = async () => {
//       try {
//         await AsyncStorage.setItem("billerName", billerName);
//         await AsyncStorage.setItem("billerAddress", billerAddress);
//         await AsyncStorage.setItem("bankName", bankName);
//         await AsyncStorage.setItem("accountName", accountName);
//         await AsyncStorage.setItem("accountNumber", accountNumber);
//       } catch (error) {
//         console.error("Error saving data:", error);
//       }
//     };

//     saveData();
//   }, [billerName, billerAddress, bankName, accountName, accountNumber]);

//   const generateInvoiceHTML = () => {
//     const { subtotal, totalVat, grandTotal } = calculateGrandTotals();
//     const itemsHTML = items
//       .map(
//         (item: any, index) => `
//         <tr>
//           <td>${index + 1}</td>
//           <td>${item.ShipmentNo}</td>
//           <td>${item.Route}</td>
//           <td>${item.TruckType}</td>
//           <td>₦${item.FreightCost}</td>
//           <td>₦${item.ServiceCharge}</td>
//           <td>₦${item.FreightCost * 0.075}</td>
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
//                 <p>${billerAddress}</p>
//                 <h3>BILL TO</h3>
//                 <p>${billTo}</p>
//                 <p>${billToAddress}</p>
//               </div>
//               <div class="invoice-info">
//                 ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
//                 <h2>INVOICE #${invoiceNumber}</h2>
//                 <p>Date: ${date}</p>
//               </div>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Shipment No</th>
//                   <th>Route</th>
//                   <th>Truck Type</th>
//                   <th>Freight Cost</th>
//                   <th>Service Charge</th>
//                   <th>VAT</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHTML}
//               </tbody>
//             </table>
//             <div class="invoice-total">
//             <p>Subtotal: ₦${subtotal}</p>
//             <p>VAT 7.5%: ₦${totalVat}</p>
//             <p>Total: ₦${grandTotal}</p>
//             </div>
//             <div class="invoice-total">VAT 7.5%: ₦${calculateVAT()}</div>
//             <div class="terms">
//               <h2>TERMS & CONDITIONS</h2>
//               <p>Please pay to ${accountName} accounts.</p>
//               <p>Bank Name: ${bankName}</p>
//               <p>Account name: ${accountName}</p>
//               <p>Account Number: ${accountNumber}</p>
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
      
//       // Create a new filename with the invoice number
//       const newUri = `${FileSystem.documentDirectory}${invoiceNumber}.pdf`;
      
//       // Rename the file
//       await FileSystem.moveAsync({
//         from: uri,
//         to: newUri
//       });

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(newUri, { 
//           mimeType: "application/pdf", 
//           dialogTitle: `Share Invoice ${invoiceNumber}`,
//           UTI: "com.adobe.pdf"
//         });
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
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//     >
//       <ScrollView style={styles.container}>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Title>Create Invoice</Title>
//             <Button mode="contained" onPress={pickLogo} style={styles.button}>
//               Select Logo
//             </Button>
//             {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
//             <TextInput
//               style={styles.input}
//               placeholder="Biller Name"
//               value={billerName}
//               onChangeText={setBillerName}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Biller Address"
//               value={billerAddress}
//               onChangeText={setBillerAddress}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Bill To"
//               value={billTo}
//               onChangeText={setBillTo}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Bill To Address"
//               value={billToAddress}
//               onChangeText={setBillToAddress}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Date"
//               value={date}
//               onChangeText={setDate}
//             />

//             <TextInput
//               style={styles.input}
//               placeholder="Bank Name"
//               value={bankName}
//               onChangeText={setBankName}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Account Name"
//               value={accountName}
//               onChangeText={setAccountName}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Account Number"
//               value={accountNumber}
//               onChangeText={setAccountNumber}
//               keyboardType="numeric"
//             />

//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Items</Text>
//             </View>
//             {items.map((item, index) => (
//               <View key={item.id} style={styles.itemContainer}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemNumber}>Item #{index + 1}</Text>
//                   {items.length > 1 && (
//                     <Button 
//                       mode="text" 
//                       onPress={() => removeItem(item.id)}
//                       style={styles.removeButton}
//                     >
//                       Remove
//                     </Button>
//                   )}
//                 </View>
                
//                 <View style={styles.itemRow}>
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Shipment No"
//                     value={item.ShipmentNo}
//                     onChangeText={(text) => handleItemChange(text, index, "ShipmentNo")}
//                   />
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Route (e.g., Agbara to Lagos)"
//                     value={item.Route}
//                     onChangeText={(text) => handleItemChange(text, index, "Route")}
//                   />
//                 </View>
                
//                 <View style={styles.itemRow}>
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Truck Type"
//                     value={item.TruckType}
//                     onChangeText={(text) => handleItemChange(text, index, "TruckType")}
//                   />
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Freight Cost"
//                     value={item.FreightCost}
//                     onChangeText={(text) => handleItemChange(text, index, "FreightCost")}
//                     keyboardType="numeric"
//                   />
//                 </View>
                
//                 <View style={styles.itemRow}>
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Service Charge"
//                     value={item.ServiceCharge}
//                     onChangeText={(text) => handleItemChange(text, index, "ServiceCharge")}
//                     keyboardType="numeric"
//                   />
//                   <View style={[styles.input, styles.itemInput, styles.totalContainer]}>
//                     <Text style={styles.totalLabel}>Subtotal:</Text>
//                     <Text>₦{item.Total}</Text>
//                   </View>
//                 </View>
                
//                 <View style={[styles.input, styles.vatContainer]}>
//                   <Text style={styles.vatLabel}>VAT (7.5%):</Text>
//                   <Text>₦{item.VAT}</Text>
//                 </View>
//               </View>
//             ))}
            
//             <Button mode="contained" onPress={addItem} style={styles.addButton}>
//               Add Another Item
//             </Button>
//             <Button
//               mode="contained"
//               onPress={generatePDF}
//               style={styles.generateButton}
//               disabled={isGenerating}
//             >
//               {isGenerating ? <ActivityIndicator color="#fff" /> : "Generate PDF"}
//             </Button>
//           </Card.Content>
//         </Card>
//       </ScrollView>
//     </KeyboardAvoidingView>
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
//     flexDirection: "column",
//     justifyContent: "space-evenly",
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
//   sectionHeader: {
//     marginTop: 20,
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//     paddingBottom: 5,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   itemContainer: {
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#eee",
//     borderRadius: 5,
//     padding: 10,
//     backgroundColor: "#f9f9f9",
//   },
//   totalLabel: {
//     fontWeight: "bold",
//   },
//   vatContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e6f7ff",
//   },
//   vatLabel: {
//     fontWeight: "bold",
//     color: "#1890ff",
//   },
//   removeButton: {
//     alignSelf: "flex-end",
//   },
//   itemNumber: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   itemHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   totalContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//   },
//   addButton: {
//     marginTop: 10,
//     backgroundColor: "#52c41a",
//   },
// });

// export default InvoiceScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Button, Card, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InvoiceScreen = () => {
  // Form state
  const [billerName, setBillerName] = useState("");
  const [billerAddress, setBillerAddress] = useState("");
  const [billTo, setBillTo] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [logoUri, setLogoUri] = useState(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Items state
  const [items, setItems] = useState([{ 
    id: Date.now(), 
    shipmentNo: "", 
    truckType: "", 
    route: "", 
    freightCost: "0.00", 
    serviceCharge: "",
    total: "0.00",
    vat: "0.00"
  }]);

  // Generate invoice number
  function generateInvoiceNumber() {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `INV-${new Date().getFullYear()}-${randomNumber}`;
  }

  // Calculate item totals whenever freightCost or serviceCharge changes
  useEffect(() => {
    const updatedItems = items.map(item => {
      const freight = parseFloat(item.freightCost) || 0;
      const service = parseFloat(item.serviceCharge) || 0;
      const total = freight + service;
      const vat = (total * 0.075).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      return {
        ...item,
        total: total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        vat
      };
    });
    setItems(updatedItems);
  }, [items.map(item => `${item.freightCost}|${item.serviceCharge}`).join()]);

  // Calculate grand totals
  const calculateGrandTotals = () => {
    let subtotal = 0;
    let totalVat = 0;

    items.forEach(item => {
      subtotal += parseFloat(item.total) || 0;
      totalVat += parseFloat(item.vat) || 0;
    });

    return {
      subtotal: subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalVat: totalVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      grandTotal: (subtotal + totalVat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  };

  // Logo picker function remains the same...
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

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLogoBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  // Add new item
  const addItem = () => {
    setItems([...items, { 
      id: Date.now(),
      shipmentNo: "", 
      truckType: "", 
      route: "", 
      freightCost: "0.00", 
      serviceCharge: "",
      total: "0.00",
      vat: "0.00"
    }]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Handle item field changes
  const handleItemChange = (text, index, field) => {
    const updatedItems = [...items];
    updatedItems[index][field] = text;
    setItems(updatedItems);
  };

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedBillerName = await AsyncStorage.getItem("billerName");
        const savedBillerAddress = await AsyncStorage.getItem("billerAddress");
        const savedBankName = await AsyncStorage.getItem("bankName");
        const savedAccountName = await AsyncStorage.getItem("accountName");
        const savedAccountNumber = await AsyncStorage.getItem("accountNumber");

        if (savedBillerName) setBillerName(savedBillerName);
        if (savedBillerAddress) setBillerAddress(savedBillerAddress);
        if (savedBankName) setBankName(savedBankName);
        if (savedAccountName) setAccountName(savedAccountName);
        if (savedAccountNumber) setAccountNumber(savedAccountNumber);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("billerName", billerName);
        await AsyncStorage.setItem("billerAddress", billerAddress);
        await AsyncStorage.setItem("bankName", bankName);
        await AsyncStorage.setItem("accountName", accountName);
        await AsyncStorage.setItem("accountNumber", accountNumber);
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    saveData();
  }, [billerName, billerAddress, bankName, accountName, accountNumber]);

  // Generate HTML for PDF
  const generateInvoiceHTML = () => {
    const { subtotal, totalVat, grandTotal } = calculateGrandTotals();
    
    const itemsHTML = items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.shipmentNo || "-"}</td>
          <td>${item.route || "-"}</td>
          <td>${item.truckType || "-"}</td>
          <td>₦${item.freightCost || "0.00"}</td>
          <td>₦${item.serviceCharge || "0.00"}</td>
          <td>₦${item.total || "0.00"}</td>
          <td>₦${item.vat || "0.00"}</td>
        </tr>
      `
      )
      .join("");

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .logo { width: 100px; height: auto; float: right; }
            .biller-info { flex: 1; margin-right: 20px; }
            .invoice-info { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .invoice-total { text-align: right; margin-top: 20px; }
            .invoice-total p { margin: 5px 0; }
            .total-label { font-weight: bold; }
            .grand-total { font-size: 18px; font-weight: bold; }
            .terms { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="biller-info">
                <h2>${billerName || "Biller Name"}</h2>
                <p>${billerAddress || "Biller Address"}</p>
                <h3>BILL TO</h3>
                <p>${billTo || "Customer Name"}</p>
                <p>${billToAddress || "Customer Address"}</p>
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
                  <th>#</th>
                  <th>Shipment No</th>
                  <th>Route</th>
                  <th>Truck Type</th>
                  <th>Freight Cost</th>
                  <th>Service Charge</th>
                  <th>Subtotal</th>
                  <th>VAT (7.5%)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            <div class="invoice-total">
              <p><span class="total-label">Subtotal:</span> ₦${subtotal}</p>
              <p><span class="total-label">Total VAT:</span> ₦${totalVat}</p>
              <p class="grand-total"><span class="total-label">Grand Total:</span> ₦${grandTotal}</p>
            </div>
            <div class="terms">
              <h2>TERMS & CONDITIONS</h2>
              <p>Please pay to ${accountName || "Account Name"} accounts.</p>
              <p>Bank Name: ${bankName || "Bank Name"}</p>
              <p>Account name: ${accountName || "Account Name"}</p>
              <p>Account Number: ${accountNumber || "Account Number"}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Generate PDF function
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateInvoiceHTML(),
      });
      
      const newUri = `${FileSystem.documentDirectory}${invoiceNumber}.pdf`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { 
          mimeType: "application/pdf", 
          dialogTitle: `Share Invoice ${invoiceNumber}`,
          UTI: "com.adobe.pdf"
        });
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Create Invoice</Title>
            
            {/* Logo and company info */}
            <Button mode="contained" onPress={pickLogo} style={styles.button}>
              Select Logo
            </Button>
            {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
            
            {/* Biller info */}
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
              multiline
            />
            
            {/* Customer info */}
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
              multiline
            />
            
            {/* Invoice info */}
            <TextInput
              style={styles.input}
              placeholder="Date"
              value={date}
              onChangeText={setDate}
            />
            
            {/* Bank info */}
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
            
            {/* Items section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
            </View>
            
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNumber}>Item #{index + 1}</Text>
                  {items.length > 1 && (
                    <Button 
                      mode="text" 
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                    >
                      Remove
                    </Button>
                  )}
                </View>
                
                <View style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, styles.itemInput]}
                    placeholder="Shipment No"
                    value={item.shipmentNo}
                    onChangeText={(text) => handleItemChange(text, index, "shipmentNo")}
                  />
                  <TextInput
                    style={[styles.input, styles.itemInput]}
                    placeholder="Route (e.g., Agbara to Lagos)"
                    value={item.route}
                    onChangeText={(text) => handleItemChange(text, index, "route")}
                  />
                </View>
                
                <View style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, styles.itemInput]}
                    placeholder="Truck Type"
                    value={item.truckType}
                    onChangeText={(text) => handleItemChange(text, index, "truckType")}
                  />
                  <TextInput
                    style={[styles.input, styles.itemInput]}
                    placeholder="Freight Cost"
                    value={item.freightCost}
                    onChangeText={(text) => handleItemChange(text, index, "freightCost")}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, styles.itemInput]}
                    placeholder="Service Charge"
                    value={item.serviceCharge}
                    onChangeText={(text) => handleItemChange(text, index, "serviceCharge")}
                    keyboardType="numeric"
                  />
                  <View style={[styles.input, styles.itemInput, styles.totalContainer]}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text>₦{item.total}</Text>
                  </View>
                </View>
                
                <View style={[styles.input, styles.vatContainer]}>
                  <Text style={styles.vatLabel}>VAT (7.5%):</Text>
                  <Text>₦{item.vat}</Text>
                </View>
              </View>
            ))}
            
            <Button mode="contained" onPress={addItem} style={styles.addButton}>
              Add Another Item
            </Button>
            
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
    </KeyboardAvoidingView>
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
    backgroundColor: "#fff",
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },
  removeButton: {
    alignSelf: "flex-end",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
    marginRight: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  totalLabel: {
    fontWeight: "bold",
  },
  vatContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
  },
  vatLabel: {
    fontWeight: "bold",
    color: "#1890ff",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200ee",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#52c41a",
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: "#1890ff",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default InvoiceScreen;