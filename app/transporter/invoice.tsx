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
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import SearchableDropdown  from 'react-native-searchable-dropdown';
import { collection, query, where, getDocs, doc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

type Client = {
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
  const [clients, setclients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVATInclusive, setIsVATInclusive] = useState(true);
  const { transporterName } = useLocalSearchParams();
  
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


useEffect(() => {
  const fetchclients = async () => {
    try {
      const clientsCollection = collection(db, 'transporter');
      const q = query(clientsCollection);
      const querySnapshot = await getDocs(q);
      
      const clientsData: Client[] = [];
      
      for (const transporterDoc of querySnapshot.docs) {
        const transporterData = transporterDoc.data();
        
        if (transporterData.clients) {
          Object.entries(transporterData.clients).forEach(([_, client]: [string, any]) => {
            clientsData.push({
              id: client.name, // Now using name as ID
              name: client.name,
              address: client.address
            });
          });
        }
        
        const clientsSubcollection = collection(db, `transporter/${transporterName}/clients`);
        const clientsSubSnapshot = await getDocs(clientsSubcollection);
        clientsSubSnapshot.forEach((clientDoc) => {
          const clientData = clientDoc.data();
          clientsData.push({
            id: clientData.name, // Using name as ID
            name: clientData.name,
            address: clientData.address
          });
        });
      }
      
      setclients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      Alert.alert("Error", "Failed to fetch clients");
    }
  };

  fetchclients();
}, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchclients = async () => {
      try {
        // fetch logic
        if (isMounted) setclients(clients);
      } catch (error) {
        if (isMounted) console.error(error);
      }
    };
    
    fetchclients();
    
    return () => {
      isMounted = false;
    };
  }, []);


  const uploadPdfToFirebase = async (pdfUri: string, invoiceNumber: string) => {
    try {
      // 1. Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error("PDF file does not exist");
      }
  
      // 2. Read the file as base64
      const base64Data = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // 3. Create a reference to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `invoices/${invoiceNumber}.pdf`);
  
      // 4. Create a Blob compatible with React Native
      // For React Native, we need to use the react-native-blob-util library
      // or convert to a format Firebase can accept directly
      const response = await fetch(`data:application/pdf;base64,${base64Data}`);
      const blob = await response.blob();
  
      // 5. Upload the blob
      await uploadBytes(storageRef, blob);
  
      // 6. Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  };
  // Filter clients based on search query
  const filteredclients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase())
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
  const saveInvoiceToFirebase = async (pdfUrl: string) => {
    try {
      if (!billTo) {
        Alert.alert("Error", "Please select a client before saving");
        return;
      }
  
      // Find the selected client
      const selectedclient = clients.find(s => s.name === billTo);
      if (!selectedclient) {
        Alert.alert("Error", "Selected client not found");
        return;
      } else{
        console.log("Selected client:", selectedclient);
      }
  
      // Create a reference to the client's invoices collection
      const invoiceRef = doc(db, `transporter/${transporterName}/clients/${selectedclient.id}/invoices/${invoiceNumber}`);
      
      // Prepare invoice data
      const invoiceData = {
        invoiceNumber,
        date: date.toISOString(),
        billerName,
        billTo,
        billToAddress,
        items,
        ...calculateGrandTotals(),
        pdfUrl, // Store the download URL
        createdAt: new Date().toISOString(),
        status: 'unpaid' // You can add payment status tracking
      };
  
      // Save to Firebase
      await setDoc(invoiceRef, invoiceData);
    } catch (error) {
      console.error("Error saving invoice:", error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
      .replace('NGN', '₦')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas for thousands
  };

  // Generate HTML for PDF
  const generateInvoiceHTML = () => {
    const { subtotal, totalVat, grandTotal } = calculateGrandTotals();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const itemsHTML = items.map((item, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.shipmentNo || "-"}</td>
        <td>${item.route || "-"}</td>
        <td>${item.truckType || "-"}</td>
        <td class="text-right">${formatCurrency(item.freightCost)}</td>
        <td class="text-right">${formatCurrency(item.serviceCharge)}</td>
        <td class="text-right">${formatCurrency(item.total - item.vat)}</td>
        <td class="text-right">${formatCurrency(item.vat)}</td>
        <td class="text-right font-bold">${formatCurrency(item.total)}</td>
      </tr>
    `).join("");
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoiceNumber}</title>
        <style>
          /* Modern CSS Reset */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          /* Base Styles */
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                         'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f8fafc;
            padding: 2rem;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Invoice Container */
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          
          /* Header Section */
          .invoice-header {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 2.0rem;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            height:15%;
          }
          
          @media (min-width: 768px) {
            .invoice-header {
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
            }
          }
          
          .company-info h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          
          .company-info p {
            opacity: 0.9;
            font-size: 0.9rem;
          }
          
          .invoice-meta {
            text-align: right;
          }
          
          @media (max-width: 767px) {
            .invoice-meta {
              text-align: left;
            }
          }
          
          .invoice-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          
          .invoice-number {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 0.25rem;
          }
          
          .invoice-date {
            font-size: 0.9rem;
            opacity: 0.9;
          }
          
          .logo {
            max-width: 90px;
            height: 90px;
            margin-bottom: 1rem;
          }
          
          /* Client Info Section */
          .client-info {
            padding: 1.5rem 2.5rem;
            background: #f1f5f9;
          }
          
          .client-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #1e293b;
          }
          
          .client-details p {
            margin-bottom: 0.25rem;
          }
          
          .client-name {
            font-weight: 600;
          }
          
          /* Items Table */
          .invoice-items {
            padding: 0 2.5rem;
            margin: 2rem 0;
            overflow-x: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          
          thead {
            background-color: #f1f5f9;
          }
          
          th {
            padding: 0.75rem 1rem;
            text-align: left;
            font-weight: 600;
            color: #334155;
            border-bottom: 2px solid #e2e8f0;
          }
          
          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .font-bold {
            font-weight: 700;
          }
          
          /* Totals Section */
          .invoice-totals {
            padding: 0 2.5rem 2.5rem;
            margin-top: 1rem;
          }
          
          .totals-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            max-width: 400px;
            margin-left: auto;
          }
          
          .total-row {
            display: contents;
          }
          
          .total-label {
            text-align: right;
            padding: 0.5rem;
            font-weight: 600;
            color: #475569;
          }
          
          .total-value {
            text-align: right;
            padding: 0.5rem;
            font-family: 'Roboto Mono', monospace;
          }
          
          .grand-total {
            grid-column: 1 / -1;
            padding-top: 0.75rem;
            margin-top: 0.75rem;
            border-top: 2px solid #e2e8f0;
            font-weight: 700;
            font-size: 1.1rem;
            color: #1e293b;
          }
          
          .vat-note {
            grid-column: 1 / -1;
            font-size: 0.8rem;
            color: #64748b;
            text-align: right;
            font-style: italic;
            margin-top: 0.5rem;
          }
          
          /* Footer Section */
          .invoice-footer {
            padding: 2rem 2.5rem;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          
          .payment-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1e293b;
          }
          
          .payment-details p {
            margin-bottom: 0.5rem;
          }
          
          .thank-you {
            margin-top: 1.5rem;
            font-weight: 500;
            color: #334155;
          }
          
          /* Responsive Adjustments */
          @media (max-width: 640px) {
            body {
              padding: 1rem;
            }
            
            .invoice-header,
            .client-info,
            .invoice-items,
            .invoice-totals,
            .invoice-footer {
              padding: 1.5rem;
            }
            
            table {
              font-size: 0.8rem;
            }
            
            th, td {
              padding: 0.5rem;
            }
          }
          
          /* Print Styles */
          @media print {
            body {
              padding: 0;
              background: none;
            }
            
            .invoice-container {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : ""}
              <h2>${billerName || "Biller Name"}</h2>
              <p>${billerAddress || "Biller Address"}</p>
            </div>
            
            <div class="invoice-meta">
              <h1 class="invoice-title">INVOICE</h1>
              <p class="invoice-number">#${invoiceNumber}</p>
              <p class="invoice-date">${formattedDate}</p>
            </div>
          </div>
          
          <div class="client-info">
            <h3>BILL TO</h3>
            <div class="client-details">
              <p class="client-name">${billTo || "Customer Name"}</p>
              <p>${billToAddress || "Customer Address"}</p>
            </div>
          </div>
          
          <div class="invoice-items">
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
          </div>
          
          <div class="invoice-totals">
            <div class="totals-grid">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${formatCurrency(Number(subtotal))}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total VAT:</span>
                <span class="total-value">${formatCurrency(Number(totalVat))}</span>
              </div>
              <div class="total-row">
                <span class="total-label grand-total">Grand Total:</span>
                <span class="total-value grand-total">${formatCurrency(Number(grandTotal))}</span>
              </div>
              <div class="vat-note">
                ${isVATInclusive ? "Prices include VAT" : "VAT added to subtotal"}
              </div>
            </div>
          </div>
          
          <div class="invoice-footer">
            <div class="payment-info">
              <h3>PAYMENT INFORMATION</h3>
              <div class="payment-details">
                <p><strong>Bank Name:</strong> ${bankName || "Bank Name"}</p>
                <p><strong>Account Name:</strong> ${accountName || "Account Name"}</p>
                <p><strong>Account Number:</strong> ${accountNumber || "Account Number"}</p>
              </div>
            </div>
            
            <p class="thank-you">Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // const generatePDF = async () => {
  //   // Validate required fields
  //   if (!billTo || !billToAddress) {
  //     Alert.alert("Validation Error", "Please select a client before generating invoice");
  //     return;
  //   }
  
  //   setIsGenerating(true);
  //   try {
  //     const { uri } = await Print.printToFileAsync({
  //       html: generateInvoiceHTML(),
  //     });
      
  //     // Upload PDF to Firebase Storage
  //     const pdfUrl = await uploadPdfToFirebase(uri, invoiceNumber);
      
  //     // Save invoice data to Firestore with PDF URL
  //     await saveInvoiceToFirebase(pdfUrl);
  
  //     if (await Sharing.isAvailableAsync()) {
  //       await Sharing.shareAsync(uri, { 
  //         mimeType: "application/pdf", 
  //         dialogTitle: `Share Invoice ${invoiceNumber}`,
  //         UTI: "com.adobe.pdf"
  //       });
  //     } else {
  //       Alert.alert("Success", "Invoice generated and saved successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     Alert.alert("Error", "Failed to generate invoice");
  //   } finally {
  //     Alert.alert("Success", "Invoice generated and saved successfully!");
  //     router.push('/transporter/dashboard')
  //     setIsGenerating(false);
  //   }
  // };
  const generatePDF = async () => {
    // Validate all required fields
    const requiredFields = [
      { field: billerName, message: "Biller name is required" },
      { field: billerAddress, message: "Biller address is required" },
      { field: billTo, message: "Please select a client to bill to" },
      { field: billToAddress, message: "Client address is required" },
      { field: bankName, message: "Bank name is required" },
      { field: accountName, message: "Account name is required" },
      { field: accountNumber, message: "Account number is required" },
    ];
  
    // Check if any item has empty required fields
    const invalidItems = items.some(item => 
      !item.shipmentNo || !item.route || !item.truckType || item.freightCost <= 0
    );
  
    if (invalidItems) {
      Alert.alert(
        "Validation Error", 
        "Please fill all item fields (Shipment No, Route, Truck Type) and ensure Freight Cost is greater than 0"
      );
      return;
    }
  
    // Check other required fields
    for (const { field, message } of requiredFields) {
      if (!field) {
        Alert.alert("Validation Error", message);
        return;
      }
    }
  
    setIsGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateInvoiceHTML(),
        width: 595,
        height: 842,
        margins: {
          left: 30,
          right: 30,
          top: 30,
          bottom: 30
        }
      });
  
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("PDF file was not generated properly");
      }
  
      const pdfUrl = await uploadPdfToFirebase(uri, invoiceNumber);
      await saveInvoiceToFirebase(pdfUrl);
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: "application/pdf", 
          dialogTitle: `Share Invoice ${invoiceNumber}`,
          UTI: "com.adobe.pdf"
        });
      }
  
      Alert.alert("Success", "Invoice generated and saved successfully!");
      router.push('/transporter/dashboard');
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", `Failed to generate invoice: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBillToSection = () => (
    <>
      <Text style={styles.sectionLabel}>Bill To *</Text>
      <View style={styles.searchableDropdownContainer}>
        <SearchableDropdown
          onTextChange={(text) => setSearchQuery(text)}
          onItemSelect={(item: Client) => {
            setBillTo(item.id);
            setBillToAddress(item.address);
          }}
          containerStyle={styles.dropdownContainer}
          textInputStyle={styles.dropdownTextInput}
          itemStyle={styles.dropdownItem}
          itemTextStyle={styles.dropdownItemText}
          itemsContainerStyle={styles.dropdownItemsContainer}
          items={filteredclients}
          placeholder="Search client..."
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
          placeholder="Bill To Address *"
          placeholderTextColor="#95a5a6"
          value={billToAddress}
          onChangeText={setBillToAddress}
          multiline
          editable={false} // Make it read-only since it's auto-filled
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
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
                    <Text style={styles.totalValue}>{formatCurrency(item.total - item.vat)}</Text>
                  </View>
                </View>
                
                <View style={[styles.inputContainer, styles.vatContainer]}>
                  <Text style={styles.vatLabel}>VAT (7.5%):</Text>
                  <Text style={styles.vatValue}>{formatCurrency(item.vat)}</Text>
                </View>
                
                <View style={[styles.inputContainer, styles.grandTotalContainer]}>
                  <Text style={styles.grandTotalLabel}>Total:</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(item.total)}</Text>
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
    padding: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    minHeight: 50,
  },
  dropdownTextInput: {
    borderWidth: 1,
    borderColor: '#D5DBE1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
    fontSize: 14,
    color: '#2C3E50',
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    //shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    zIndex: 1,
  },
});

export default InvoiceScreen;