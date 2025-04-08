// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   ScrollView, 
//   StyleSheet, 
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   FlatList,
//   RefreshControl
// } from 'react-native';
// import { Button, Card, Searchbar, IconButton } from 'react-native-paper';
// import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
// import { 
//   collection, 
//   addDoc, 
//   serverTimestamp, 
//   doc, 
//   getFirestore, 
//   updateDoc,
//   getDocs,
//   query,
//   where,
//   deleteDoc
// } from 'firebase/firestore';
// import { app } from '../firebase';
// import { router, useLocalSearchParams } from 'expo-router';

// type Supplier = {
//   id: string;
//   name: string;
//   address: string;
//   contactPerson?: string;
//   phoneNumber?: string;
//   email?: string;
//   taxId?: string;
//   createdAt?: any;
// };

// const SupplierManagementScreen = () => {
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

//   // Form fields
//   const [supplierName, setSupplierName] = useState('');
//   const [supplierAddress, setSupplierAddress] = useState('');
//   const [contactPerson, setContactPerson] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [email, setEmail] = useState('');
//   const [taxId, setTaxId] = useState('');

//   const db = getFirestore(app);
//   const { transporterName } = useLocalSearchParams();
//   const transporterNameStr = Array.isArray(transporterName) ? transporterName[0] : transporterName ?? '';

//   // Fetch suppliers
//   const fetchSuppliers = async () => {
//     setRefreshing(true);
//     try {
//       const transporterRef = doc(db, 'transporter', transporterNameStr);
//       const suppliersRef = collection(transporterRef, 'suppliers');
//       const querySnapshot = await getDocs(suppliersRef);
      
//       const suppliersData: Supplier[] = [];
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         suppliersData.push({
//           id: doc.id,
//           name: data.name || 'Unknown',
//           address: data.address || 'Unknown',
//           contactPerson: data.contactPerson || '',
//           phoneNumber: data.phoneNumber || '',
//           email: data.email || '',
//           taxId: data.taxId || '',
//           createdAt: data.createdAt || null
//         });
//       });
      
//       setSuppliers(suppliersData);
//     } catch (error) {
//       console.error('Error fetching suppliers:', error);
//       Alert.alert('Error', 'Failed to fetch suppliers');
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchSuppliers();
//   }, []);

//   // Filter suppliers based on search query
//   const filteredSuppliers = suppliers.filter(supplier =>
//     supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     supplier.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   // Reset form
//   const resetForm = () => {
//     setSupplierName('');
//     setSupplierAddress('');
//     setContactPerson('');
//     setPhoneNumber('');
//     setEmail('');
//     setTaxId('');
//     setCurrentSupplier(null);
//     setEditMode(false);
//   };

//   // Handle create/update supplier
//   const handleSubmitSupplier = async () => {
//     if (!supplierName || !supplierAddress) {
//       Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const transporterRef = doc(db, 'transporter', transporterNameStr);
//       const suppliersRef = collection(transporterRef, 'suppliers');
      
//       const supplierData = {
//         name: supplierName,
//         address: supplierAddress,
//         contactPerson,
//         phoneNumber,
//         email,
//         taxId,
//         updatedAt: serverTimestamp()
//       };

//       if (editMode && currentSupplier) {
//         // Update existing supplier
//         await updateDoc(doc(suppliersRef, currentSupplier.id), {
//           ...supplierData,
//           createdAt: currentSupplier.createdAt || serverTimestamp()
//         });
//         Alert.alert('Success', 'Supplier updated successfully!');
//       } else {
//         // Create new supplier
//         await addDoc(suppliersRef, {
//           ...supplierData,
//           createdAt: serverTimestamp()
//         });
//         Alert.alert('Success', 'Supplier created successfully!');
//       }

//       resetForm();
//       fetchSuppliers();
//     } catch (error) {
//       console.error('Error saving supplier:', error);
//       Alert.alert('Error', 'Failed to save supplier. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle edit supplier
//   const handleEditSupplier = (supplier: Supplier) => {
//     setCurrentSupplier(supplier);
//     setSupplierName(supplier.name);
//     setSupplierAddress(supplier.address);
//     setContactPerson(supplier.contactPerson || '');
//     setPhoneNumber(supplier.phoneNumber || '');
//     setEmail(supplier.email || '');
//     setTaxId(supplier.taxId || '');
//     setEditMode(true);
//   };

//   // Handle delete supplier
//   const handleDeleteSupplier = async (supplierId: string) => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this supplier?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const transporterRef = doc(db, 'transporter', transporterNameStr);
//               const supplierRef = doc(collection(transporterRef, 'suppliers'), supplierId);
//               await deleteDoc(supplierRef);
//               fetchSuppliers();
//               Alert.alert('Success', 'Supplier deleted successfully');
//             } catch (error) {
//               console.error('Error deleting supplier:', error);
//               Alert.alert('Error', 'Failed to delete supplier');
//             }
//           }
//         }
//       ]
//     );
//   };

//   // Render supplier item
//   const renderSupplierItem = ({ item }: { item: Supplier }) => (
//     <Card style={styles.supplierCard}>
//       <Card.Content>
//         <View style={styles.supplierHeader}>
//           <View style={styles.supplierInfo}>
//             <Text style={styles.supplierName}>{item.name}</Text>
//             <Text style={styles.supplierAddress}>{item.address}</Text>
//             {item.contactPerson && (
//               <Text style={styles.supplierContact}>Contact: {item.contactPerson}</Text>
//             )}
//           </View>
//           <View style={styles.supplierActions}>
//             <IconButton
//               icon="pencil"
//               size={20}
//               onPress={() => handleEditSupplier(item)}
//               style={styles.actionButton}
//             />
//             <IconButton
//               icon="delete"
//               size={20}
//               onPress={() => handleDeleteSupplier(item.id)}
//               style={styles.actionButton}
//             />
//           </View>
//         </View>
//       </Card.Content>
//     </Card>
//   );

//   return (
//     <ScrollView 
//       style={styles.container}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={fetchSuppliers} />
//       }
//     >
//       <View style={styles.topSection}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="#2c3e50" />
//         </TouchableOpacity>
//         <Text style={styles.screenTitle}>Supplier Management</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       {/* Search Bar */}
//       <Searchbar
//         placeholder="Search suppliers..."
//         onChangeText={setSearchQuery}
//         value={searchQuery}
//         style={styles.searchBar}
//         iconColor="#7f8c8d"
//         inputStyle={styles.searchInput}
//       />

//       {/* Supplier Form */}
//       <Card style={styles.card}>
//         <Card.Content>
//           <Text style={styles.sectionLabel}>
//             {editMode ? 'Edit Supplier' : 'Add New Supplier'}
//           </Text>
          
//           <View style={styles.inputContainer}>
//             <MaterialIcons name="business" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Supplier Name *"
//               placeholderTextColor="#95a5a6"
//               value={supplierName}
//               onChangeText={setSupplierName}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.multilineInput]}
//               placeholder="Address *"
//               placeholderTextColor="#95a5a6"
//               value={supplierAddress}
//               onChangeText={setSupplierAddress}
//               multiline
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <MaterialIcons name="person" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Contact Person"
//               placeholderTextColor="#95a5a6"
//               value={contactPerson}
//               onChangeText={setContactPerson}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <FontAwesome name="phone" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Phone Number"
//               placeholderTextColor="#95a5a6"
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <MaterialIcons name="email" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               placeholderTextColor="#95a5a6"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <MaterialIcons name="receipt" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Tax ID/VAT Number"
//               placeholderTextColor="#95a5a6"
//               value={taxId}
//               onChangeText={setTaxId}
//             />
//           </View>

//           <View style={styles.formButtons}>
//             <Button
//               mode="outlined"
//               onPress={resetForm}
//               style={styles.cancelButton}
//               labelStyle={styles.buttonText}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               mode="contained"
//               onPress={handleSubmitSupplier}
//               style={styles.submitButton}
//               labelStyle={styles.buttonText}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 editMode ? 'Update Supplier' : 'Create Supplier'
//               )}
//             </Button>
//           </View>
//         </Card.Content>
//       </Card>

//       {/* Suppliers List */}
//       <Text style={styles.listHeader}>Suppliers ({filteredSuppliers.length})</Text>
      
//       {filteredSuppliers.length === 0 ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="business" size={40} color="#bdc3c7" />
//           <Text style={styles.emptyText}>No suppliers found</Text>
//           {searchQuery && (
//             <Button
//               mode="text"
//               onPress={() => setSearchQuery('')}
//               style={styles.clearSearchButton}
//             >
//               Clear search
//             </Button>
//           )}
//         </View>
//       ) : (
//         <FlatList
//           data={filteredSuppliers}
//           renderItem={renderSupplierItem}
//           keyExtractor={(item) => item.id}
//           scrollEnabled={false} // Since we're inside a ScrollView
//           contentContainerStyle={styles.listContainer}
//         />
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#f8f9fa",
//   },
//   topSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   backButton: {
//     padding: 5,
//   },
//   screenTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#2c3e50',
//     textAlign: 'center',
//     flex: 1,
//   },
//   searchBar: {
//     marginBottom: 15,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     elevation: 1,
//   },
//   searchInput: {
//     color: '#2c3e50',
//     fontSize: 15,
//   },
//   card: {
//     marginBottom: 20,
//     borderRadius: 12,
//     elevation: 3,
//     backgroundColor: '#fff',
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//     marginBottom: 15,
//     marginTop: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     color: '#2c3e50',
//     fontSize: 15,
//   },
//   multilineInput: {
//     height: 80,
//     textAlignVertical: 'top',
//     paddingVertical: 15,
//   },
//   formButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 15,
//   },
//   cancelButton: {
//     flex: 1,
//     marginRight: 10,
//     borderColor: '#e74c3c',
//   },
//   submitButton: {
//     flex: 1,
//     backgroundColor: '#2ecc71',
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   listHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#2c3e50',
//     marginBottom: 15,
//     marginTop: 10,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   supplierCard: {
//     marginBottom: 10,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   supplierHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   supplierInfo: {
//     flex: 1,
//   },
//   supplierName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//     marginBottom: 5,
//   },
//   supplierAddress: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginBottom: 5,
//   },
//   supplierContact: {
//     fontSize: 14,
//     color: '#3498db',
//   },
//   supplierActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   actionButton: {
//     margin: 0,
//     padding: 0,
//     marginLeft: 10,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     marginTop: 10,
//   },
//   clearSearchButton: {
//     marginTop: 10,
//   },
// });

// export default SupplierManagementScreen;

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  Pressable,
  Linking
} from 'react-native';
import { 
  Button, 
  Card, 
  Searchbar, 
  IconButton, 
  Badge,
  Divider,
  List
} from 'react-native-paper';
import { 
  MaterialIcons, 
  FontAwesome, 
  Ionicons, 
  Entypo,
  AntDesign,
  Feather
} from '@expo/vector-icons';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getFirestore, 
  updateDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { router, useLocalSearchParams } from 'expo-router';

type Supplier = {
  id: string;
  name: string;
  address: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  taxId?: string;
  createdAt?: any;
  status?: 'active' | 'inactive';
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: 'unpaid' | 'paid' | 'overdue';
  subtotal: string;
  date: string;
  pdfUrl?: string;
  billerName?: string;
  billTo?: string;
  billToAddress?: string;
};

const SupplierManagementScreen = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [currentInvoices, setCurrentInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form fields
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const db = getFirestore(app);
  const storage = getStorage(app);
  const { transporterName } = useLocalSearchParams();
  const transporterNameStr = Array.isArray(transporterName) ? transporterName[0] : transporterName ?? '';

  // Fetch suppliers and invoices
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      
      // Fetch suppliers
      const suppliersRef = collection(transporterRef, 'suppliers');
      const suppliersSnapshot = await getDocs(suppliersRef);
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[];
      
      // Fetch invoices for each supplier
      const invoicesData: Record<string, Invoice[]> = {};
      const invoicePromises = suppliersData.map(async supplier => {
        const invoicesRef = collection(transporterRef, `suppliers/${supplier.id}/invoices`);
        const invoicesSnapshot = await getDocs(invoicesRef);
        invoicesData[supplier.id] = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[];
      });
      
      await Promise.all(invoicePromises);
      
      setSuppliers(suppliersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time listener for invoices
    const transporterRef = doc(db, 'transporter', transporterNameStr);
    const unsubscribe = onSnapshot(collection(transporterRef, 'suppliers'), async () => {
      fetchData();
    });

    return () => unsubscribe();
  }, []);

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get invoices for a specific supplier
  const getSupplierInvoices = (supplierId: string) => {
    return invoices[supplierId] || [];
  };

  // View invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceModalVisible(true);
  };

  // Open PDF invoice
  // const openPdfInvoice = async (pdfUrl: string) => {
  //   try {
  //     const url = await getDownloadURL(ref(storage, pdfUrl));
  //     await Linking.openURL(url);
  //   } catch (error) {
  //     console.error('Error opening PDF:', error);
  //     Alert.alert('Error', 'Could not open invoice PDF');
  //   }
  // };
  const openPdfInvoice = async (pdfUrl: string) => {
    try {
      // Check if it's already a download URL
      if (pdfUrl.startsWith('https://')) {
        await Linking.openURL(pdfUrl);
      } else {
        // If it's a storage path, get the download URL first
        const storageRef = ref(storage, pdfUrl);
        const url = await getDownloadURL(storageRef);
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Could not open invoice PDF');
    }
  };

  // Reset form
  const resetForm = () => {
    setSupplierName('');
    setSupplierAddress('');
    setContactPerson('');
    setPhoneNumber('');
    setEmail('');
    setTaxId('');
    setStatus('active');
    setCurrentSupplier(null);
    setModalVisible(false);
  };

  // Open modal for new supplier
  const openNewSupplierModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing supplier
  const openEditSupplierModal = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierAddress(supplier.address);
    setContactPerson(supplier.contactPerson || '');
    setPhoneNumber(supplier.phoneNumber || '');
    setEmail(supplier.email || '');
    setTaxId(supplier.taxId || '');
    setStatus(supplier.status || 'active');
    setModalVisible(true);
  };

  // View all invoices for a supplier
  const viewSupplierInvoices = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setCurrentInvoices(getSupplierInvoices(supplier.id));
    setInvoiceModalVisible(true);
  };

  // Handle create/update supplier
  const handleSubmitSupplier = async () => {
    if (!supplierName || !supplierAddress) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
      return;
    }

    setIsLoading(true);
    try {
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      const suppliersRef = collection(transporterRef, 'suppliers');
      
      const supplierData = {
        name: supplierName,
        address: supplierAddress,
        contactPerson,
        phoneNumber,
        email,
        taxId,
        status,
        updatedAt: serverTimestamp()
      };

      if (currentSupplier) {
        // Update existing supplier
        await updateDoc(doc(suppliersRef, currentSupplier.id), {
          ...supplierData,
          createdAt: currentSupplier.createdAt || serverTimestamp()
        });
        Alert.alert('Success', 'Supplier updated successfully!');
      } else {
        // Create new supplier
        await addDoc(suppliersRef, {
          ...supplierData,
          createdAt: serverTimestamp()
        });
        Alert.alert('Success', 'Supplier created successfully!');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving supplier:', error);
      Alert.alert('Error', 'Failed to save supplier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async (supplierId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this supplier? This will also delete all associated invoices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const transporterRef = doc(db, 'transporter', transporterNameStr);
              const supplierRef = doc(collection(transporterRef, 'suppliers'), supplierId);
              await deleteDoc(supplierRef);
              
              // Also delete all invoices for this supplier
              const invoicesRef = collection(transporterRef, `suppliers/${supplierId}/invoices`);
              const invoicesSnapshot = await getDocs(invoicesRef);
              const deletePromises = invoicesSnapshot.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);
              
              fetchData();
              Alert.alert('Success', 'Supplier and associated invoices deleted successfully');
            } catch (error) {
              console.error('Error deleting supplier:', error);
              Alert.alert('Error', 'Failed to delete supplier');
            }
          }
        }
      ]
    );
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, newStatus: 'paid' | 'unpaid' | 'overdue') => {
    try {
      // Find which supplier this invoice belongs to
      const supplierId = Object.keys(invoices).find(key => 
        invoices[key].some(inv => inv.id === invoiceId)
      );
      
      if (!supplierId) {
        throw new Error('Supplier not found for this invoice');
      }
      
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      const invoiceRef = doc(transporterRef, `suppliers/${supplierId}/invoices/${invoiceId}`);
      
      await updateDoc(invoiceRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      fetchData();
      Alert.alert('Success', `Invoice marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      Alert.alert('Error', 'Failed to update invoice status');
    }
  };

  // Render supplier item
  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    const supplierInvoices = getSupplierInvoices(item.id);
    const unpaidInvoices = supplierInvoices.filter(i => i.status === 'unpaid');
    const paidInvoices = supplierInvoices.filter(i => i.status === 'paid');
    const overdueInvoices = supplierInvoices.filter(i => i.status === 'overdue');

    return (
      <Card style={styles.supplierCard}>
        <Card.Content>
          <View style={styles.supplierHeader}>
            <View style={styles.supplierInfo}>
              <View style={styles.supplierTitleRow}>
                <Text style={styles.supplierName}>{item.name}</Text>
                <Badge 
                  style={[
                    styles.statusBadge,
                    item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                  ]}
                >
                  {item.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </View>
              <Text style={styles.supplierAddress}>{item.address}</Text>
              
              {item.contactPerson && (
                <View style={styles.contactRow}>
                  <MaterialIcons name="person" size={16} color="#7f8c8d" />
                  <Text style={styles.supplierContact}>{item.contactPerson}</Text>
                </View>
              )}
              
              {item.phoneNumber && (
                <View style={styles.contactRow}>
                  <FontAwesome name="phone" size={16} color="#7f8c8d" />
                  <Text style={styles.supplierContact}>{item.phoneNumber}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.supplierActions}>
              <IconButton
                icon="file-document-outline"
                size={20}
                onPress={() => viewSupplierInvoices(item)}
                style={styles.actionButton}
                disabled={supplierInvoices.length === 0}
              />
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openEditSupplierModal(item)}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteSupplier(item.id)}
                style={styles.actionButton}
              />
            </View>
          </View>
          
          {/* Invoice Status Summary */}
          <View style={styles.invoiceStatusContainer}>
            <View style={styles.invoiceStatusHeader}>
              <Text style={styles.invoiceStatusTitle}>Invoices</Text>
              <Text style={styles.invoiceCount}>{supplierInvoices.length} total</Text>
            </View>
            <View style={styles.invoiceStatusRow}>
              <View style={styles.invoiceStatusItem}>
                <View style={[styles.statusIndicator, styles.unpaidIndicator]} />
                <Text style={styles.invoiceStatusCount}>{unpaidInvoices.length}</Text>
                <Text style={styles.invoiceStatusLabel}>Unpaid</Text>
              </View>
              <View style={styles.invoiceStatusItem}>
                <View style={[styles.statusIndicator, styles.paidIndicator]} />
                <Text style={styles.invoiceStatusCount}>{paidInvoices.length}</Text>
                <Text style={styles.invoiceStatusLabel}>Paid</Text>
              </View>
              <View style={styles.invoiceStatusItem}>
                <View style={[styles.statusIndicator, styles.overdueIndicator]} />
                <Text style={styles.invoiceStatusCount}>{overdueInvoices.length}</Text>
                <Text style={styles.invoiceStatusLabel}>Overdue</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render invoice item
  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <List.Item
      title={`Invoice #${item.invoiceNumber}`}
      description={`${item.date} • ₦${(Number(item.subtotal) || 0).toFixed(2)}`}
      left={props => (
        <View style={styles.invoiceStatusWrapper}>
          <Badge 
            style={[
              styles.invoiceBadge,
              item.status === 'paid' ? styles.paidBadge :
              item.status === 'overdue' ? styles.overdueBadge : styles.unpaidBadge
            ]}
          >
            {item.status}
          </Badge>
        </View>
      )}
      right={props => (
        <View style={styles.invoiceActions}>
          {item.pdfUrl && (
            <IconButton
              icon="file-pdf-box"
              size={24}
              onPress={() => openPdfInvoice(item.pdfUrl!)}
              style={styles.pdfButton}
            />
          )}
          {item.status !== 'paid' && (
            <Button
              mode="contained"
              compact
              onPress={() => updateInvoiceStatus(item.id, 'paid')}
              style={styles.markPaidButton}
              labelStyle={styles.markPaidButtonText}
            >
              Mark Paid
            </Button>
          )}
        </View>
      )}
      style={styles.invoiceListItem}
      onPress={() => viewInvoiceDetails(item)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplier Management</Text>
        <TouchableOpacity 
          onPress={openNewSupplierModal}
          style={styles.addButton}
        >
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search suppliers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#7f8c8d"
          inputStyle={styles.searchInput}
          placeholderTextColor="#95a5a6"
        />
      </View>

      {/* Suppliers List */}
      <FlatList
        data={filteredSuppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchData}
            colors={['#3498db']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="business" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>No suppliers found</Text>
            {searchQuery ? (
              <Button
                mode="text"
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
                labelStyle={styles.clearSearchButtonText}
              >
                Clear search
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={openNewSupplierModal}
                style={styles.addFirstButton}
                labelStyle={styles.addFirstButtonText}
              >
                Add Your First Supplier
              </Button>
            )}
          </View>
        }
      />

      {/* Supplier Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentSupplier ? 'Edit Supplier' : 'New Supplier'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <AntDesign name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="business" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Supplier Name *"
                  placeholderTextColor="#95a5a6"
                  value={supplierName}
                  onChangeText={setSupplierName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Address *"
                  placeholderTextColor="#95a5a6"
                  value={supplierAddress}
                  onChangeText={setSupplierAddress}
                  multiline
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contact Person"
                  placeholderTextColor="#95a5a6"
                  value={contactPerson}
                  onChangeText={setContactPerson}
                />
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome name="phone" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#95a5a6"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#95a5a6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="receipt" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tax ID/VAT Number"
                  placeholderTextColor="#95a5a6"
                  value={taxId}
                  onChangeText={setTaxId}
                />
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === 'active' && styles.statusOptionActive
                    ]}
                    onPress={() => setStatus('active')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      status === 'active' && styles.statusOptionTextActive
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === 'inactive' && styles.statusOptionActive
                    ]}
                    onPress={() => setStatus('inactive')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      status === 'inactive' && styles.statusOptionTextActive
                    ]}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={resetForm}
                style={styles.cancelButton}
                labelStyle={styles.buttonText}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitSupplier}
                style={styles.submitButton}
                labelStyle={styles.buttonText}
                loading={isLoading}
                disabled={isLoading}
              >
                {currentSupplier ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invoices Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={invoiceModalVisible}
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.invoiceModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedInvoice ? 'Invoice Details' : `${currentSupplier?.name}'s Invoices`}
              </Text>
              <TouchableOpacity onPress={() => {
                setSelectedInvoice(null);
                setInvoiceModalVisible(false);
              }}>
                <AntDesign name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {selectedInvoice ? (
              <ScrollView style={styles.modalBody}>
                <View style={styles.invoiceDetailCard}>
                  <Text style={styles.invoiceDetailTitle}>Invoice #{selectedInvoice.invoiceNumber}</Text>
                  
                  <View style={styles.invoiceDetailRow}>
                    <Text style={styles.invoiceDetailLabel}>Status:</Text>
                    <Badge 
                      style={[
                        styles.invoiceBadge,
                        selectedInvoice.status === 'paid' ? styles.paidBadge :
                        selectedInvoice.status === 'overdue' ? styles.overdueBadge : styles.unpaidBadge
                      ]}
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </View>
                  
                  <View style={styles.invoiceDetailRow}>
                    <Text style={styles.invoiceDetailLabel}>Amount:</Text>
                    <Text style={styles.invoiceDetailValue}>₦{(Number(selectedInvoice?.subtotal) || 0).toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.invoiceDetailRow}>
                    <Text style={styles.invoiceDetailLabel}>Date:</Text>
                    <Text style={styles.invoiceDetailValue}>{selectedInvoice.date}</Text>
                  </View>
                  
                  {selectedInvoice.billerName && (
                    <View style={styles.invoiceDetailRow}>
                      <Text style={styles.invoiceDetailLabel}>From:</Text>
                      <Text style={styles.invoiceDetailValue}>{selectedInvoice.billerName}</Text>
                    </View>
                  )}
                  
                  {selectedInvoice.billTo && (
                    <View style={styles.invoiceDetailRow}>
                      <Text style={styles.invoiceDetailLabel}>To:</Text>
                      <Text style={styles.invoiceDetailValue}>{selectedInvoice.billTo}</Text>
                    </View>
                  )}
                  
                  {selectedInvoice.billToAddress && (
                    <View style={styles.invoiceDetailRow}>
                      <Text style={styles.invoiceDetailLabel}>Address:</Text>
                      <Text style={styles.invoiceDetailValue}>{selectedInvoice.billToAddress}</Text>
                    </View>
                  )}
                  
                  <View style={styles.invoiceActionsContainer}>
                    {selectedInvoice.pdfUrl && (
                      <Button
                        mode="contained"
                        onPress={() => openPdfInvoice(selectedInvoice.pdfUrl!)}
                        style={styles.viewPdfButton}
                        labelStyle={styles.viewPdfButtonText}
                        icon="file-pdf-box"
                      >
                        View PDF Invoice
                      </Button>
                    )}
                    
                    {selectedInvoice.status !== 'paid' && (
                      <Button
                        mode="contained"
                        onPress={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                        style={styles.markPaidButton}
                        labelStyle={styles.markPaidButtonText}
                        icon="check-circle-outline"
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <FlatList
                data={currentInvoices}
                renderItem={renderInvoiceItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.invoiceListContent}
                ListEmptyComponent={
                  <View style={styles.emptyInvoicesState}>
                    <Feather name="file-text" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyInvoicesText}>No invoices found for this supplier</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#3498db',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
    backgroundColor: '#2980b9',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    elevation: 0,
  },
  searchInput: {
    color: '#2c3e50',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  supplierCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  supplierAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierContact: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  supplierActions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#2ecc71',
  },
  inactiveBadge: {
    backgroundColor: '#e74c3c',
  },
  invoiceStatusContainer: {
    marginTop: 12,
    paddingTop: 12,
  },
  invoiceStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  invoiceCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  invoiceStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  unpaidIndicator: {
    backgroundColor: '#e74c3c',
  },
  paidIndicator: {
    backgroundColor: '#2ecc71',
  },
  overdueIndicator: {
    backgroundColor: '#f39c12',
  },
  invoiceStatusCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  invoiceStatusLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  clearSearchButton: {
    marginTop: 8,
  },
  clearSearchButtonText: {
    color: '#3498db',
  },
  addFirstButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    elevation: 5,
  },
  invoiceModalContent: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#2c3e50',
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  statusOptionActive: {
    backgroundColor: '#3498db',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#e74c3c',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  invoiceListItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceStatusWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  invoiceBadge: {
    alignSelf: 'center',
  },
  unpaidBadge: {
    backgroundColor: '#e74c3c',
  },
  paidBadge: {
    backgroundColor: '#2ecc71',
  },
  overdueBadge: {
    backgroundColor: '#f39c12',
  },
  invoiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfButton: {
    marginRight: 8,
  },
  markPaidButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2ecc71',
  },
  markPaidButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  invoiceListContent: {
    paddingBottom: 16,
  },
  emptyInvoicesState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyInvoicesText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
  },
  invoiceDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  invoiceDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceDetailLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    flex: 1,
  },
  invoiceDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
  },
  invoiceActionsContainer: {
    marginTop: 24,
  },
  viewPdfButton: {
    marginBottom: 12,
    backgroundColor: '#e74c3c',
  },
  viewPdfButtonText: {
    color: '#fff',
  },
});

export default SupplierManagementScreen;