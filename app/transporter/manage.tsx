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

// type client = {
//   id: string;
//   name: string;
//   address: string;
//   contactPerson?: string;
//   phoneNumber?: string;
//   email?: string;
//   taxId?: string;
//   createdAt?: any;
// };

// const clientManagementScreen = () => {
//   const [clients, setclients] = useState<client[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentclient, setCurrentclient] = useState<client | null>(null);

//   // Form fields
//   const [clientName, setclientName] = useState('');
//   const [clientAddress, setclientAddress] = useState('');
//   const [contactPerson, setContactPerson] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [email, setEmail] = useState('');
//   const [taxId, setTaxId] = useState('');

//   const db = getFirestore(app);
//   const { transporterName } = useLocalSearchParams();
//   const transporterNameStr = Array.isArray(transporterName) ? transporterName[0] : transporterName ?? '';

//   // Fetch clients
//   const fetchclients = async () => {
//     setRefreshing(true);
//     try {
//       const transporterRef = doc(db, 'transporter', transporterNameStr);
//       const clientsRef = collection(transporterRef, 'clients');
//       const querySnapshot = await getDocs(clientsRef);
      
//       const clientsData: client[] = [];
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         clientsData.push({
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
      
//       setclients(clientsData);
//     } catch (error) {
//       console.error('Error fetching clients:', error);
//       Alert.alert('Error', 'Failed to fetch clients');
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchclients();
//   }, []);

//   // Filter clients based on search query
//   const filteredclients = clients.filter(client =>
//     client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (client.contactPerson && client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   // Reset form
//   const resetForm = () => {
//     setclientName('');
//     setclientAddress('');
//     setContactPerson('');
//     setPhoneNumber('');
//     setEmail('');
//     setTaxId('');
//     setCurrentclient(null);
//     setEditMode(false);
//   };

//   // Handle create/update client
//   const handleSubmitclient = async () => {
//     if (!clientName || !clientAddress) {
//       Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const transporterRef = doc(db, 'transporter', transporterNameStr);
//       const clientsRef = collection(transporterRef, 'clients');
      
//       const clientData = {
//         name: clientName,
//         address: clientAddress,
//         contactPerson,
//         phoneNumber,
//         email,
//         taxId,
//         updatedAt: serverTimestamp()
//       };

//       if (editMode && currentclient) {
//         // Update existing client
//         await updateDoc(doc(clientsRef, currentclient.id), {
//           ...clientData,
//           createdAt: currentclient.createdAt || serverTimestamp()
//         });
//         Alert.alert('Success', 'client updated successfully!');
//       } else {
//         // Create new client
//         await addDoc(clientsRef, {
//           ...clientData,
//           createdAt: serverTimestamp()
//         });
//         Alert.alert('Success', 'client created successfully!');
//       }

//       resetForm();
//       fetchclients();
//     } catch (error) {
//       console.error('Error saving client:', error);
//       Alert.alert('Error', 'Failed to save client. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle edit client
//   const handleEditclient = (client: client) => {
//     setCurrentclient(client);
//     setclientName(client.name);
//     setclientAddress(client.address);
//     setContactPerson(client.contactPerson || '');
//     setPhoneNumber(client.phoneNumber || '');
//     setEmail(client.email || '');
//     setTaxId(client.taxId || '');
//     setEditMode(true);
//   };

//   // Handle delete client
//   const handleDeleteclient = async (clientId: string) => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this client?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const transporterRef = doc(db, 'transporter', transporterNameStr);
//               const clientRef = doc(collection(transporterRef, 'clients'), clientId);
//               await deleteDoc(clientRef);
//               fetchclients();
//               Alert.alert('Success', 'client deleted successfully');
//             } catch (error) {
//               console.error('Error deleting client:', error);
//               Alert.alert('Error', 'Failed to delete client');
//             }
//           }
//         }
//       ]
//     );
//   };

//   // Render client item
//   const renderclientItem = ({ item }: { item: client }) => (
//     <Card style={styles.clientCard}>
//       <Card.Content>
//         <View style={styles.clientHeader}>
//           <View style={styles.clientInfo}>
//             <Text style={styles.clientName}>{item.name}</Text>
//             <Text style={styles.clientAddress}>{item.address}</Text>
//             {item.contactPerson && (
//               <Text style={styles.clientContact}>Contact: {item.contactPerson}</Text>
//             )}
//           </View>
//           <View style={styles.clientActions}>
//             <IconButton
//               icon="pencil"
//               size={20}
//               onPress={() => handleEditclient(item)}
//               style={styles.actionButton}
//             />
//             <IconButton
//               icon="delete"
//               size={20}
//               onPress={() => handleDeleteclient(item.id)}
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
//         <RefreshControl refreshing={refreshing} onRefresh={fetchclients} />
//       }
//     >
//       <View style={styles.topSection}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="#2c3e50" />
//         </TouchableOpacity>
//         <Text style={styles.screenTitle}>client Management</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       {/* Search Bar */}
//       <Searchbar
//         placeholder="Search clients..."
//         onChangeText={setSearchQuery}
//         value={searchQuery}
//         style={styles.searchBar}
//         iconColor="#7f8c8d"
//         inputStyle={styles.searchInput}
//       />

//       {/* client Form */}
//       <Card style={styles.card}>
//         <Card.Content>
//           <Text style={styles.sectionLabel}>
//             {editMode ? 'Edit client' : 'Add New client'}
//           </Text>
          
//           <View style={styles.inputContainer}>
//             <MaterialIcons name="business" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="client Name *"
//               placeholderTextColor="#95a5a6"
//               value={clientName}
//               onChangeText={setclientName}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.multilineInput]}
//               placeholder="Address *"
//               placeholderTextColor="#95a5a6"
//               value={clientAddress}
//               onChangeText={setclientAddress}
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
//               onPress={handleSubmitclient}
//               style={styles.submitButton}
//               labelStyle={styles.buttonText}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 editMode ? 'Update client' : 'Create client'
//               )}
//             </Button>
//           </View>
//         </Card.Content>
//       </Card>

//       {/* clients List */}
//       <Text style={styles.listHeader}>clients ({filteredclients.length})</Text>
      
//       {filteredclients.length === 0 ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="business" size={40} color="#bdc3c7" />
//           <Text style={styles.emptyText}>No clients found</Text>
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
//           data={filteredclients}
//           renderItem={renderclientItem}
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
//   clientCard: {
//     marginBottom: 10,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   clientHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   clientInfo: {
//     flex: 1,
//   },
//   clientName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//     marginBottom: 5,
//   },
//   clientAddress: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginBottom: 5,
//   },
//   clientContact: {
//     fontSize: 14,
//     color: '#3498db',
//   },
//   clientActions: {
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

// export default clientManagementScreen;

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
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { router, useLocalSearchParams } from 'expo-router';

type client = {
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

const clientManagementScreen = () => {
  const [clients, setclients] = useState<client[]>([]);
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [currentclient, setCurrentclient] = useState<client | null>(null);
  const [currentInvoices, setCurrentInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form fields
  const [clientName, setclientName] = useState('');
  const [clientAddress, setclientAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const db = getFirestore(app);
  const storage = getStorage(app);
  const { transporterName } = useLocalSearchParams();
  const transporterNameStr = Array.isArray(transporterName) ? transporterName[0] : transporterName ?? '';

  // Fetch clients and invoices
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      
      // Fetch clients
      const clientsRef = collection(transporterRef, 'clients');
      const clientsSnapshot = await getDocs(clientsRef);
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as client[];
      
      // Fetch invoices for each client
      const invoicesData: Record<string, Invoice[]> = {};
      const invoicePromises = clientsData.map(async client => {
        const invoicesRef = collection(transporterRef, `clients/${client.id}/invoices`);
        const invoicesSnapshot = await getDocs(invoicesRef);
        invoicesData[client.id] = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[];
      });
      
      await Promise.all(invoicePromises);
      
      setclients(clientsData);
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
    const unsubscribe = onSnapshot(collection(transporterRef, 'clients'), async () => {
      fetchData();
    });

    return () => unsubscribe();
  }, []);

  // Filter clients based on search query
  const filteredclients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contactPerson && client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get invoices for a specific client
  const getclientInvoices = (clientId: string) => {
    return invoices[clientId] || [];
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
    setclientName('');
    setclientAddress('');
    setContactPerson('');
    setPhoneNumber('');
    setEmail('');
    setTaxId('');
    setStatus('active');
    setCurrentclient(null);
    setModalVisible(false);
  };

  // Open modal for new client
  const openNewclientModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing client
  const openEditclientModal = (client: client) => {
    setCurrentclient(client);
    setclientName(client.name);
    setclientAddress(client.address);
    setContactPerson(client.contactPerson || '');
    setPhoneNumber(client.phoneNumber || '');
    setEmail(client.email || '');
    setTaxId(client.taxId || '');
    setStatus(client.status || 'active');
    setModalVisible(true);
  };

  // View all invoices for a client
  const viewclientInvoices = (client: client) => {
    setCurrentclient(client);
    setCurrentInvoices(getclientInvoices(client.id));
    setInvoiceModalVisible(true);
  };

  // Handle create/update client
  // const handleSubmitclient = async () => {
  //   if (!clientName || !clientAddress) {
  //     Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const transporterRef = doc(db, 'transporter', transporterNameStr);
  //     const clientsRef = collection(transporterRef, 'clients');
      
  //     const clientData = {
  //       name: clientName,
  //       address: clientAddress,
  //       contactPerson,
  //       phoneNumber,
  //       email,
  //       taxId,
  //       status,
  //       updatedAt: serverTimestamp()
  //     };

  //     if (currentclient) {
  //       // Update existing client
  //       await updateDoc(doc(clientsRef, currentclient.id), {
  //         ...clientData,
  //         createdAt: currentclient.createdAt || serverTimestamp()
  //       });
  //       Alert.alert('Success', 'client updated successfully!');
  //     } else {
  //       // Create new client
  //       await addDoc(clientsRef, {
  //         ...clientData,
  //         createdAt: serverTimestamp()
  //       });
  //       Alert.alert('Success', 'client created successfully!');
  //     }

  //     resetForm();
  //     fetchData();
  //   } catch (error) {
  //     console.error('Error saving client:', error);
  //     Alert.alert('Error', 'Failed to save client. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmitclient = async () => {
    if (!clientName || !clientAddress) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name and Address)');
      return;
    }
  
    setIsLoading(true);
    try {
      // Sanitize the client name to create a valid document ID
      const clientId = clientName
  
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      const clientRef = doc(collection(transporterRef, 'clients'), clientId);
      
      const clientData = {
        name: clientName,
        address: clientAddress,
        contactPerson,
        phoneNumber,
        email,
        taxId,
        status,
        updatedAt: serverTimestamp()
      };
  
      if (currentclient) {
        // Update existing client - use the existing ID
        await setDoc(doc(transporterRef, 'clients', currentclient.id), {
          ...clientData,
          createdAt: currentclient.createdAt || serverTimestamp()
        }, { merge: true });
        Alert.alert('Success', 'client updated successfully!');
      } else {
        // Create new client with name as ID
        await setDoc(clientRef, {
          ...clientData,
          createdAt: serverTimestamp()
        });
        Alert.alert('Success', 'client created successfully!');
      }
  
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving client:', error);
      let errorMessage = 'Failed to save client. Please try again.';
      
      // Handle specific Firestore errors
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to perform this operation.';
      } else if (error.code === 'already-exists') {
        errorMessage = 'A client with this name already exists.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // Handle delete client
  const handleDeleteclient = async (clientId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this client? This will also delete all associated invoices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const transporterRef = doc(db, 'transporter', transporterNameStr);
              const clientRef = doc(collection(transporterRef, 'clients'), clientId);
              await deleteDoc(clientRef);
              
              // Also delete all invoices for this client
              const invoicesRef = collection(transporterRef, `clients/${clientId}/invoices`);
              const invoicesSnapshot = await getDocs(invoicesRef);
              const deletePromises = invoicesSnapshot.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);
              
              fetchData();
              Alert.alert('Success', 'client and associated invoices deleted successfully');
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert('Error', 'Failed to delete client');
            }
          }
        }
      ]
    );
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, newStatus: 'paid' | 'unpaid' | 'overdue') => {
    try {
      // Find which client this invoice belongs to
      const clientId = Object.keys(invoices).find(key => 
        invoices[key].some(inv => inv.id === invoiceId)
      );
      
      if (!clientId) {
        throw new Error('client not found for this invoice');
      }
      
      const transporterRef = doc(db, 'transporter', transporterNameStr);
      const invoiceRef = doc(transporterRef, `clients/${clientId}/invoices/${invoiceId}`);
      
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

  // Render client item
  const renderclientItem = ({ item }: { item: client }) => {
    const clientInvoices = getclientInvoices(item.id);
    const unpaidInvoices = clientInvoices.filter(i => i.status === 'unpaid');
    const paidInvoices = clientInvoices.filter(i => i.status === 'paid');
    const overdueInvoices = clientInvoices.filter(i => i.status === 'overdue');

    return (
      <Card style={styles.clientCard}>
        <Card.Content>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <View style={styles.clientTitleRow}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Badge 
                  style={[
                    styles.statusBadge,
                    item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                  ]}
                >
                  {item.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </View>
              <Text style={styles.clientAddress}>{item.address}</Text>
              
              {item.contactPerson && (
                <View style={styles.contactRow}>
                  <MaterialIcons name="person" size={16} color="#7f8c8d" />
                  <Text style={styles.clientContact}>{item.contactPerson}</Text>
                </View>
              )}
              
              {item.phoneNumber && (
                <View style={styles.contactRow}>
                  <FontAwesome name="phone" size={16} color="#7f8c8d" />
                  <Text style={styles.clientContact}>{item.phoneNumber}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.clientActions}>
              <IconButton
                icon="file-document-outline"
                size={20}
                onPress={() => viewclientInvoices(item)}
                style={styles.actionButton}
                disabled={clientInvoices.length === 0}
              />
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openEditclientModal(item)}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteclient(item.id)}
                style={styles.actionButton}
              />
            </View>
          </View>
          
          {/* Invoice Status Summary */}
          <View style={styles.invoiceStatusContainer}>
            <View style={styles.invoiceStatusHeader}>
              <Text style={styles.invoiceStatusTitle}>Invoices</Text>
              <Text style={styles.invoiceCount}>{clientInvoices.length} total</Text>
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Management</Text>
        <TouchableOpacity 
          onPress={openNewclientModal}
          style={styles.addButton}
        >
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search client..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#7f8c8d"
          inputStyle={styles.searchInput}
          placeholderTextColor="#95a5a6"
        />
      </View>

      {/* clients List */}
      <FlatList
        data={filteredclients}
        renderItem={renderclientItem}
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
            <Text style={styles.emptyText}>No client found</Text>
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
                onPress={openNewclientModal}
                style={styles.addFirstButton}
                labelStyle={styles.addFirstButtonText}
              >
                Add Your First Client
              </Button>
            )}
          </View>
        }
      />

      {/* client Form Modal */}
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
                {currentclient ? 'Edit Client' : 'New Client'}
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
                  placeholder="Client Name *"
                  placeholderTextColor="#95a5a6"
                  value={clientName}
                  onChangeText={setclientName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Entypo name="address" size={20} color="#7f8c8d" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Address *"
                  placeholderTextColor="#95a5a6"
                  value={clientAddress}
                  onChangeText={setclientAddress}
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
                onPress={handleSubmitclient}
                style={styles.submitButton}
                labelStyle={styles.buttonText}
                loading={isLoading}
                disabled={isLoading}
              >
                {currentclient ? 'Update' : 'Create'}
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
                {selectedInvoice ? 'Invoice Details' : `${currentclient?.name}'s Invoices`}
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
                    <Text style={styles.emptyInvoicesText}>No invoices found for this client</Text>
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
    //backgroundColor: '#3498db',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
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
    marginTop:5
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
  clientCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clientInfo: {
    flex: 1,
  },
  clientTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  clientAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientContact: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  clientActions: {
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

export default clientManagementScreen;