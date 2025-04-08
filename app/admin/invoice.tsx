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
//   TouchableOpacity
// } from "react-native";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
// import { Button, Card, Title } from "react-native-paper";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";

// const InvoiceScreen = () => {
//   const [billerName, setBillerName] = useState("");
//   const [billerAddress, setBillerAddress] = useState("");
//   const [billTo, setBillTo] = useState("");
//   const [billToAddress, setBillToAddress] = useState("");
//   const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
//   const [date, setDate] = useState(new Date().toLocaleDateString());
//   const [bankName, setBankName] = useState("");
//   const [accountName, setAccountName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [logoUri, setLogoUri] = useState(null);
//   const [logoBase64, setLogoBase64] = useState<string | null>(null);
//   const [isGenerating, setIsGenerating] = useState(false);
  
//   // Items state
//   const [items, setItems] = useState([{ 
//     id: Date.now(), 
//     shipmentNo: "", 
//     truckType: "", 
//     route: "", 
//     freightCost: 0, 
//     serviceCharge: 0,
//     total: 0,
//     vat: 0
//   }]);

//   // Generate invoice number
//   function generateInvoiceNumber() {
//     const randomNumber = Math.floor(Math.random() * 10000);
//     return `INV-${new Date().getFullYear()}-${randomNumber}`;
//   }

//   // Calculate item totals whenever freightCost or serviceCharge changes
//   useEffect(() => {
//     const updatedItems = items.map(item => {
//       const freight = Number(item.freightCost) || 0;
//       const service = Number(item.serviceCharge) || 0;
//       const total = freight + service;
//       const vat = total * 0.075
      
//       return {
//         ...item,
//         total, 
//         vat
//       };
//     });
//     setItems(updatedItems);
//   }, [items.map(item => `${item.freightCost}|${item.serviceCharge}`).join()]);

//   // Calculate grand totals
//   const calculateGrandTotals = () => {
//     let subtotal = 0;
//     let totalVat = 0;

//     items.forEach(item => {
//       subtotal += Number(item.total) || 0;
//       totalVat += Number(item.vat) || 0;
//     });
//     const grandTotal = subtotal + totalVat;
//     return {
//       subtotal: subtotal.toFixed(2),
//       totalVat: totalVat.toFixed(2),
//       grandTotal: grandTotal.toFixed(2)
//     };
//   };

//   // Logo picker function remains the same...
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

//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       setLogoBase64(`data:image/jpeg;base64,${base64}`);
//     }
//   };

//   // Add new item
//   const addItem = () => {
//     setItems([...items, { 
//       id: Date.now(),
//       shipmentNo: "", 
//       truckType: "", 
//       route: "", 
//       freightCost: 0, 
//       serviceCharge: 0,
//       total: 0,
//       vat: 0
//     }]);
//   };

//   // Remove item
//   const removeItem = (id) => {
//     if (items.length > 1) {
//       setItems(items.filter(item => item.id !== id));
//     }
//   };


//   const handleItemChange = (text, index, field) => {
//     const updatedItems = [...items];
//     // Convert to number if it's a numeric field
//     if (['freightCost', 'serviceCharge'].includes(field)) {
//       updatedItems[index][field] = text === '' ? 0 : parseFloat(text) || 0;
//     } else {
//       updatedItems[index][field] = text;
//     }
//     setItems(updatedItems);
//   };

//   // Load saved data
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

//   // Save data when it changes
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

//   // Generate HTML for PDF
//   const generateInvoiceHTML = () => {
//     const { subtotal, totalVat, grandTotal } = calculateGrandTotals();
    
//     const itemsHTML = items
//       .map(
//         (item, index) => `
//         <tr>
//           <td>${index + 1}</td>
//           <td>${item.shipmentNo || "-"}</td>
//           <td>${item.route || "-"}</td>
//           <td>${item.truckType || "-"}</td>
//           <td>₦${item.freightCost || "0.00"}</td>
//           <td>₦${item.serviceCharge || "0.00"}</td>
//           <td>₦${item.total || "0.00"}</td>
//           <td>₦${item.vat || "0.00"}</td>
//         </tr>
//       `
//       )
//       .join("");

//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
//             .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
//             .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
//             .logo { width: 100px; height: auto; float: right; }
//             .biller-info { flex: 1; margin-right: 20px; }
//             .invoice-info { text-align: right; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
//             .invoice-total { text-align: right; margin-top: 20px; }
//             .invoice-total p { margin: 5px 0; }
//             .total-label { font-weight: bold; }
//             .grand-total { font-size: 18px; font-weight: bold; }
//             .terms { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
//           </style>
//         </head>
//         <body>
//           <div class="invoice">
//             <div class="header">
//               <div class="biller-info">
//                 <h2>${billerName || "Biller Name"}</h2>
//                 <p>${billerAddress || "Biller Address"}</p>
//                 <h3>BILL TO</h3>
//                 <p>${billTo || "Customer Name"}</p>
//                 <p>${billToAddress || "Customer Address"}</p>
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
//                   <th>Subtotal</th>
//                   <th>VAT (7.5%)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHTML}
//               </tbody>
//             </table>
//             <div class="invoice-total">
//               <p><span class="total-label">Subtotal:</span> ₦${subtotal}</p>
//               <p><span class="total-label">Total VAT:</span> ₦${totalVat}</p>
//               <p class="grand-total"><span class="total-label">Grand Total:</span> ₦${grandTotal}</p>
//             </div>
//             <div class="terms">
//               <h2>TERMS & CONDITIONS</h2>
//               <p>Please pay to ${accountName || "Account Name"} accounts.</p>
//               <p>Bank Name: ${bankName || "Bank Name"}</p>
//               <p>Account name: ${accountName || "Account Name"}</p>
//               <p>Account Number: ${accountNumber || "Account Number"}</p>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   // Generate PDF function
//   const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const { uri } = await Print.printToFileAsync({
//         html: generateInvoiceHTML(),
//       });
      
//       const newUri = `${FileSystem.documentDirectory}${invoiceNumber}.pdf`;
      
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
//       <View style={styles.topSection}>
                            
//                               <Text style={{fontWeight:'700', fontSize:20,marginLeft:10}}>Create Invoice</Text>
//                             <TouchableOpacity onPress={() => router.back()}>
//                             <Image
//                               source={require('../../assets/images/Back.png')}
//                               style={{ width: 30, resizeMode: 'contain', marginLeft: 15 }}
//                             />
//                             </TouchableOpacity>
//                           </View>
//         <Card style={styles.card}>
//           <Card.Content>
            
//             {/* Logo and company info */}
//             <Button mode="contained" onPress={pickLogo} style={styles.button}>
//               Select Logo
//             </Button>
//             {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} />}
            
//             {/* Biller info */}
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
//               multiline
//             />
            
//             {/* Customer info */}
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
//               multiline
//             />
            
//             {/* Invoice info */}
//             <TextInput
//               style={styles.input}
//               placeholder="Invoice Date"
//               value={date}
//               onChangeText={setDate}
//             />
            
//             {/* Bank info */}
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
            
//             {/* Items section */}
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
//                     value={item.shipmentNo}
//                     onChangeText={(text) => handleItemChange(text, index, "shipmentNo")}
//                   />
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Route (e.g., Agbara to Lagos)"
//                     value={item.route}
//                     onChangeText={(text) => handleItemChange(text, index, "route")}
//                   />
//                 </View>
                
//                 <View style={styles.itemRow}>
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Truck Type"
//                     value={item.truckType}
//                     onChangeText={(text) => handleItemChange(text, index, "truckType")}
//                   />
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Freight Cost"
//                     //value={item.freightCost}
//                     onChangeText={(text) => handleItemChange(text, index, "freightCost")}
//                     keyboardType="numeric"
//                   />
//                 </View>
                
//                 <View style={styles.itemRow}>
//                   <TextInput
//                     style={[styles.input, styles.itemInput]}
//                     placeholder="Service Charge"
//                     //value={item.serviceCharge}
//                     onChangeText={(text) => handleItemChange(text, index, "serviceCharge")}
//                     keyboardType="numeric"
//                   />
//                   <View style={[styles.input, styles.itemInput, styles.totalContainer]}>
//                     {/* <Text style={styles.totalLabel}>Subtotal:</Text> */}
//                     <Text>₦{item.total}</Text>
//                   </View>
//                 </View>
                
//                 <View style={[styles.input, styles.vatContainer]}>
//                   <Text style={styles.vatLabel}>VAT (7.5%):</Text>
//                   <Text>₦{item.vat}</Text>
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
//     padding: 10,
//     backgroundColor: "#f3f3f3",
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
//     backgroundColor: "#fff",
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
//   itemHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   itemNumber: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   removeButton: {
//     alignSelf: "flex-end",
//   },
//   itemRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   itemInput: {
//     flex: 1,
//     marginRight: 5,
//   },
//   totalContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
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
//   button: {
//     marginTop: 10,
//     backgroundColor: "#6200ee",
//     marginBottom: 15
//   },
//   addButton: {
//     marginTop: 10,
//     backgroundColor: "#52c41a",
//   },
//   generateButton: {
//     marginTop: 20,
//     backgroundColor: "#1890ff",
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 10,
//   },
//   topSection: {
//     width: '100%',
//     marginTop:20,
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingRight: 30,
    
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
  TouchableOpacity,
  Alert
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Button, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import SearchableDropdown  from 'react-native-searchable-dropdown';
import { collection, query, where, getDocs, doc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

type Item = {
  id: number;
  shipmentNo: string;
  truckType: string;
  route: string;
  freightCost: number;
  serviceCharge: number;
  total: number;
  vat: number;
};

type Supplier = {
  id: string;
  name: string;
  address: string;
};

const InvoiceScreen = () => {
  const [billerName, setBillerName] = useState("");
  const [billerAddress, setBillerAddress] = useState("");
  const [billTo, setBillTo] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVATInclusive, setIsVATInclusive] = useState(true);
  
  // Items state
  const [items, setItems] = useState<Item[]>([{ 
    id: Date.now(), 
    shipmentNo: "", 
    truckType: "", 
    route: "", 
    freightCost: 0, 
    serviceCharge: 0,
    total: 0,
    vat: 0
  }]);

  const db = getFirestore(app);

  // Generate invoice number
  function generateInvoiceNumber() {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `INV-${new Date().getFullYear()}-${randomNumber}`;
  }

  // Fetch suppliers from Firebase
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersCollection = collection(db, 'transporter');
        const q = query(suppliersCollection);
        const querySnapshot = await getDocs(q);
        
        const suppliersData: Supplier[] = [];
        
        querySnapshot.forEach((doc) => {
          const transporterData = doc.data();
          if (transporterData.suppliers) {
            Object.entries(transporterData.suppliers).forEach(([id, supplier]: [string, any]) => {
              suppliersData.push({
                id,
                name: supplier.name,
                address: supplier.address
              });
            });
          }
        });
        
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        Alert.alert("Error", "Failed to fetch suppliers");
      }
    };

    fetchSuppliers();
  }, []);

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate item totals whenever freightCost or serviceCharge changes
  useEffect(() => {
    const updatedItems = items.map(item => {
      const freight = Number(item.freightCost) || 0;
      const service = Number(item.serviceCharge) || 0;
      let total, vat;
      
      if (isVATInclusive) {
        // VAT is included in the total (reverse calculate VAT)
        total = freight + service;
        vat = total - (total / 1.075);
      } else {
        // VAT is added to the total
        const subtotal = freight + service;
        vat = subtotal * 0.075;
        total = subtotal + vat;
      }
      
      return {
        ...item,
        total: parseFloat(total.toFixed(2)),
        vat: parseFloat(vat.toFixed(2))
      };
    });
    setItems(updatedItems);
  }, [items.map(item => `${item.freightCost}|${item.serviceCharge}`).join(), isVATInclusive]);

  // Calculate grand totals
  const calculateGrandTotals = () => {
    let subtotal = 0;
    let totalVat = 0;

    items.forEach(item => {
      subtotal += Number(item.total - item.vat) || 0;
      totalVat += Number(item.vat) || 0;
    });
    const grandTotal = subtotal + totalVat;
    return {
      subtotal: subtotal.toFixed(2),
      totalVat: totalVat.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  // Logo picker function
  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need camera roll permissions to select a logo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
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
      freightCost: 0, 
      serviceCharge: 0,
      total: 0,
      vat: 0
    }]);
  };

  // Remove item
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (text: string, index: number, field: keyof Item) => {
    const updatedItems: any = [...items];
    // Convert to number if it's a numeric field
    if (['freightCost', 'serviceCharge'].includes(field)) {
      updatedItems[index][field] = text === '' ? 0 : parseFloat(text) || 0;
    } else {
      updatedItems[index][field] = text;
    }
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

  // Save invoice to Firebase
  const saveInvoiceToFirebase = async (pdfUri: string) => {
    try {
      if (!billTo) {
        Alert.alert("Error", "Please select a supplier before saving");
        return;
      }

      // Find the selected supplier
      const selectedSupplier = suppliers.find(s => s.name === billTo);
      if (!selectedSupplier) {
        Alert.alert("Error", "Selected supplier not found");
        return;
      }

      // Create a reference to the supplier's invoices collection
      const invoiceRef = doc(db, `transporter/${selectedSupplier.id}/suppliers/${selectedSupplier.id}/invoices/${invoiceNumber}`);
      
      // Prepare invoice data
      const invoiceData = {
        invoiceNumber,
        date: date.toISOString(),
        billerName,
        billTo,
        billToAddress,
        items,
        ...calculateGrandTotals(),
        pdfUrl: pdfUri,
        createdAt: new Date().toISOString()
      };

      // Save to Firebase
      await setDoc(invoiceRef, invoiceData);
      Alert.alert("Success", "Invoice saved successfully");
    } catch (error) {
      console.error("Error saving invoice:", error);
      Alert.alert("Error", "Failed to save invoice");
    }
  };

  // Generate HTML for PDF
  const generateInvoiceHTML = () => {
    const { subtotal, totalVat, grandTotal } = calculateGrandTotals();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const itemsHTML = items
      .map(
        (item, index) => `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${item.shipmentNo || "-"}</td>
          <td>${item.route || "-"}</td>
          <td>${item.truckType || "-"}</td>
          <td style="text-align: right;">₦${item.freightCost.toFixed(2) || "0.00"}</td>
          <td style="text-align: right;">₦${item.serviceCharge.toFixed(2) || "0.00"}</td>
          <td style="text-align: right;">₦${(item.total - item.vat).toFixed(2)}</td>
          <td style="text-align: right;">₦${item.vat.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold;">₦${item.total.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    return `
      <html>
        <head>
          <style>
            body { 
              font-family: 'Helvetica Neue', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
            }
            .invoice { 
              width: 100%; 
              max-width: 800px; 
              margin: 0 auto; 
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 20px;
            }
            .logo { 
              width: 120px; 
              height: auto;
              margin-bottom: 10px;
            }
            .biller-info { 
              flex: 1; 
              margin-right: 20px; 
            }
            .invoice-info { 
              text-align: right;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .invoice-number {
              font-size: 16px;
              color: #7f8c8d;
              margin-bottom: 5px;
            }
            .invoice-date {
              font-size: 14px;
              color: #7f8c8d;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 14px;
            }
            th { 
              background-color: #f8f9fa;
              color: #2c3e50;
              font-weight: 600;
              padding: 12px 10px;
              text-align: left;
              border-bottom: 2px solid #e0e0e0;
            }
            td { 
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            .invoice-total { 
              text-align: right; 
              margin-top: 20px;
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .invoice-total p { 
              margin: 8px 0;
              font-size: 15px;
            }
            .total-label { 
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            .grand-total { 
              font-size: 18px; 
              font-weight: bold;
              color: #2c3e50;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #e0e0e0;
            }
            .terms { 
              margin-top: 40px; 
              border-top: 1px solid #e0e0e0; 
              padding-top: 20px;
              font-size: 13px;
              color: #7f8c8d;
            }
            .terms-title {
              font-size: 16px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .vat-note {
              font-size: 12px;
              color: #7f8c8d;
              margin-top: 5px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="biller-info">
                <h2 style="color: #2c3e50; margin-bottom: 5px;">${billerName || "Biller Name"}</h2>
                <p style="color: #7f8c8d; margin-bottom: 15px;">${billerAddress || "Biller Address"}</p>
                <h3 style="color: #2c3e50; margin-bottom: 5px;">BILL TO</h3>
                <p style="font-weight: 500;">${billTo || "Customer Name"}</p>
                <p style="color: #7f8c8d;">${billToAddress || "Customer Address"}</p>
              </div>
              <div class="invoice-info">
                ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${invoiceNumber}</div>
                <div class="invoice-date">Date: ${formattedDate}</div>
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
                  <th>Total</th>
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
              <div class="vat-note">${isVATInclusive ? "Prices include VAT" : "VAT added to subtotal"}</div>
            </div>
            <div class="terms">
              <div class="terms-title">PAYMENT INFORMATION</div>
              <p>Please make payment to:</p>
              <p><strong>Bank Name:</strong> ${bankName || "Bank Name"}</p>
              <p><strong>Account Name:</strong> ${accountName || "Account Name"}</p>
              <p><strong>Account Number:</strong> ${accountNumber || "Account Number"}</p>
              <p style="margin-top: 15px;">Thank you for your business!</p>
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

      // Save invoice to Firebase
      await saveInvoiceToFirebase(newUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { 
          mimeType: "application/pdf", 
          dialogTitle: `Share Invoice ${invoiceNumber}`,
          UTI: "com.adobe.pdf"
        });
      } else {
        Alert.alert("Success", "Invoice generated successfully");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBillToSection = () => (
    <>
      <Text style={styles.sectionLabel}>Bill To</Text>
      <View style={styles.searchableDropdownContainer}>
        <SearchableDropdown
          onTextChange={(text) => setSearchQuery(text)}
          onItemSelect={(item: Supplier) => {
            setBillTo(item.name);
            setBillToAddress(item.address);
          }}
          containerStyle={styles.dropdownContainer}
          textInputStyle={styles.dropdownTextInput}
          itemStyle={styles.dropdownItem}
          itemTextStyle={styles.dropdownItemText}
          itemsContainerStyle={styles.dropdownItemsContainer}
          items={filteredSuppliers}
          defaultIndex={0}
          placeholder="Search supplier..."
          resetValue={false}
          underlineColorAndroid="transparent"
          textInputProps={{
            placeholderTextColor: "#95a5a6",
            style: { color: '#2c3e50' }
          }}
          leftIcon={
            <View style={styles.dropdownIcon}>
              <MaterialIcons name="business-center" size={20} color="#7f8c8d" />
            </View>
          }
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Bill To Address"
          placeholderTextColor="#95a5a6"
          value={billToAddress}
          onChangeText={setBillToAddress}
          multiline
        />
      </View>
    </>
  );

  // Date picker handler
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Create Invoice</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoPreview} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <MaterialIcons name="photo-camera" size={32} color="#7f8c8d" />
                </View>
              )}
              <Button 
                mode="outlined" 
                onPress={pickLogo} 
                style={styles.logoButton}
                labelStyle={styles.buttonText}
                icon={() => <MaterialIcons name="add-a-photo" size={18} color="#3498db" />}
              >
                {logoUri ? 'Change Logo' : 'Add Logo'}
              </Button>
            </View>

            {/* VAT Toggle */}
            <View style={styles.vatToggleContainer}>
              <Text style={styles.sectionLabel}>VAT Calculation:</Text>
              <TouchableOpacity 
                style={[styles.toggleOption, isVATInclusive && styles.toggleOptionActive]}
                onPress={() => setIsVATInclusive(true)}
              >
                <Text style={[styles.toggleText, isVATInclusive && styles.toggleTextActive]}>7.5% VAT Inclusive</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleOption, !isVATInclusive && styles.toggleOptionActive]}
                onPress={() => setIsVATInclusive(false)}
              >
                <Text style={[styles.toggleText, !isVATInclusive && styles.toggleTextActive]}>VAT Exclusive</Text>
              </TouchableOpacity>
            </View>

            {/* Biller Information */}
            <Text style={styles.sectionLabel}>Biller Information</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="business" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Biller Name"
                placeholderTextColor="#95a5a6"
                value={billerName}
                onChangeText={setBillerName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Biller Address"
                placeholderTextColor="#95a5a6"
                value={billerAddress}
                onChangeText={setBillerAddress}
                multiline
              />
            </View>

            {/* Bill To Information with Searchable Dropdown */}
  
            {renderBillToSection()}

            {/* Invoice Information */}
            <Text style={styles.sectionLabel}>Invoice Information</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="confirmation-number" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Invoice Number"
                placeholderTextColor="#95a5a6"
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
              />
            </View>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="date-range" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <Text style={styles.dateInput}>
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            {/* Bank Information */}
            <Text style={styles.sectionLabel}>Bank Information</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="account-balance" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Name"
                placeholderTextColor="#95a5a6"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="account-circle" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Account Name"
                placeholderTextColor="#95a5a6"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="credit-card" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                placeholderTextColor="#95a5a6"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
              />
            </View>

            {/* Items Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
            </View>
            
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNumber}>Item #{index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="delete" size={22} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.itemRow}>
                  <View style={[styles.inputContainer, styles.itemInput]}>
                    <MaterialIcons name="local-shipping" size={18} color="#7f8c8d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Shipment No"
                      placeholderTextColor="#95a5a6"
                      value={item.shipmentNo}
                      onChangeText={(text) => handleItemChange(text, index, "shipmentNo")}
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.itemInput]}>
                    <MaterialIcons name="route" size={18} color="#7f8c8d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Route (e.g., Agbara to Lagos)"
                      placeholderTextColor="#95a5a6"
                      value={item.route}
                      onChangeText={(text) => handleItemChange(text, index, "route")}
                    />
                  </View>
                </View>
                
                <View style={styles.itemRow}>
                  <View style={[styles.inputContainer, styles.itemInput]}>
                    <FontAwesome name="truck" size={18} color="#7f8c8d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Truck Type"
                      placeholderTextColor="#95a5a6"
                      value={item.truckType}
                      onChangeText={(text) => handleItemChange(text, index, "truckType")}
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.itemInput]}>
                    <MaterialIcons name="attach-money" size={18} color="#7f8c8d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Freight Cost"
                      placeholderTextColor="#95a5a6"
                      value={item.freightCost ? item.freightCost.toString() : ""}
                      onChangeText={(text) => handleItemChange(text, index, "freightCost")}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.itemRow}>
                  <View style={[styles.inputContainer, styles.itemInput]}>
                    <MaterialIcons name="money" size={18} color="#7f8c8d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Service Charge"
                      placeholderTextColor="#95a5a6"
                      value={item.serviceCharge ? item.serviceCharge.toString() : ""}
                      onChangeText={(text) => handleItemChange(text, index, "serviceCharge")}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.itemInput, styles.totalContainer]}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>₦{(item.total - item.vat).toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={[styles.inputContainer, styles.vatContainer]}>
                  <Text style={styles.vatLabel}>VAT (7.5%):</Text>
                  <Text style={styles.vatValue}>₦{item.vat.toFixed(2)}</Text>
                </View>
                
                <View style={[styles.inputContainer, styles.grandTotalContainer]}>
                  <Text style={styles.grandTotalLabel}>Total:</Text>
                  <Text style={styles.grandTotalValue}>₦{item.total.toFixed(2)}</Text>
                </View>
              </View>
            ))}
            
            <Button
              mode="outlined"
              onPress={addItem}
              style={styles.addButton}
              labelStyle={styles.buttonText}
              icon={() => <MaterialIcons name="add-circle-outline" size={18} color="#2ecc71" />}
            >
              Add Another Item
            </Button>
            
            <Button
              mode="contained"
              onPress={generatePDF}
              style={styles.generateButton}
              labelStyle={styles.generateButtonText}
              disabled={isGenerating}
              icon={() => isGenerating ? 
                <ActivityIndicator color="#fff" /> : 
                <MaterialIcons name="picture-as-pdf" size={18} color="#fff" />
              }
            >
              {isGenerating ? "Generating..." : "Generate PDF Invoice"}
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
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoButton: {
    borderColor: '#3498db',
    borderWidth: 1,
  },
  vatToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 5,
  },
  toggleOption: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  toggleOptionActive: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#2c3e50',
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 15,
  },
  dateInput: {
    flex: 1,
    height: 50,
    color: '#2c3e50',
    fontSize: 15,
    paddingVertical: 15,
  },
  dropdown: {
    flex: 1,
    height: 50,
    backgroundColor: 'transparent',
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#95a5a6',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#2c3e50',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 15,
    color: '#2c3e50',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 3,
  },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  removeButton: {
    padding: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
    marginRight: 5,
    marginBottom: 0,
  },
  totalContainer: {
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
  },
  totalLabel: {
    fontWeight: '500',
    color: '#7f8c8d',
  },
  totalValue: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  vatContainer: {
    justifyContent: 'space-between',
    backgroundColor: '#e6f7ff',
    marginBottom: 10,
  },
  vatLabel: {
    fontWeight: '500',
    color: '#1890ff',
  },
  vatValue: {
    fontWeight: '600',
    color: '#1890ff',
  },
  grandTotalContainer: {
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
  },
  grandTotalLabel: {
    fontWeight: '500',
    color: '#2e7d32',
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    marginTop: 10,
    borderColor: '#2ecc71',
    borderWidth: 1,
  },
  generateButton: {
    marginTop: 25,
    marginBottom: 10,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  searchableDropdownContainer: {
    marginBottom: 15,
  },
  dropdownContainer: {
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownTextInput: {
    height: 50,
    borderWidth: 0,
    paddingLeft: 40,
    color: '#2c3e50',
    fontSize: 15,
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    zIndex: 1,
  },
});

export default InvoiceScreen;