// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Image
// } from 'react-native';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import SearchableDropdown from 'react-native-searchable-dropdown';
// import { app } from '../firebase';
// import {router} from 'expo-router'


// const db = getFirestore(app);

// const collections = [
//   { id: 'deliverydriver', name: 'Delivery Driver' },
//   { id: 'customer', name: 'Customer' },
//   { id: 'transporter', name: 'Transporter' },
//   { id: 'fieldagent', name: 'Field Agent' },
// ];

// const AddUserScreen: React.FC = () => {
//   const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
//   const [assignedVanNo, setAssignedVanNo] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [name, setName] = useState('');
//   const [transporter, setTransporter] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSave = async () => {
//     if (!selectedCollection) {
//       Alert.alert('Error', 'Please select a collection');
//       return;
//     }

//     if (
//       selectedCollection === 'deliverydriver' &&
//       (!phoneNumber || !name || !assignedVanNo || !transporter || !password)
//     ) {
//       Alert.alert('Error', 'All fields are required for Delivery Driver');
//       return;
//     }

//     if (selectedCollection === 'customer' && (!phoneNumber || !name || !password)) {
//       Alert.alert('Error', 'All fields are required for Customer');
//       return;
//     }

//     const uid = `${phoneNumber}_${name}`;
//     const userData: Record<string, any> = { uid };

//     if (selectedCollection === 'deliverydriver') {
//       Object.assign(userData, {
//         AssignedVanNo: assignedVanNo,
//         phoneNumber: phoneNumber,
//         name: name,
//         Transporter: transporter,
//         password: password,
//       });
//     } else if (selectedCollection === 'customer') {
//       Object.assign(userData, {
//         phoneNumber: phoneNumber,
//         name: name,
//         password: password,
//       });
//     }

//     setIsLoading(true); // Show loading indicator
//     try {
//       await setDoc(doc(db, selectedCollection, uid), userData);
//       Alert.alert('Success', 'User added successfully');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add user');
//       console.error(error);
//     } finally {
//       setIsLoading(false); // Hide loading indicator
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//               <View style={styles.topSection}>
                
//                   <Text style={{ fontSize: 20, fontWeight: "bold", marginTop:20 }}>Back</Text>
                
//                 <TouchableOpacity onPress={() => router.back()} style={{marginLeft:20, marginTop:20}}>
//                 <Image
//                   source={require("../../assets/images/Back.png")}
//                   style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
//                 />
//                 </TouchableOpacity>
//               </View>
//       <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
//         <Text style={styles.label}>Select Collection</Text>
//         <SearchableDropdown
//           onItemSelect={(item) => setSelectedCollection(item.id)}
//           items={collections}
//           placeholder={selectedCollection ? collections.find((c) => c.id === selectedCollection)?.name : 'Select Category..'}
//           containerStyle={styles.dropdownContainer}
//           itemStyle={styles.dropdownItem}
//           itemTextStyle={styles.dropdownItemText}
//           placeholderTextStyle={styles.placeholderText}
//           placeholderTextColor={'#666'}
//         />

//         {selectedCollection === 'deliverydriver' && (
//           <>
//             <Text style={styles.label}>Assigned Van No</Text>
//             <TextInput
//               value={assignedVanNo}
//               onChangeText={setAssignedVanNo}
//               style={styles.input}
//               placeholder="Enter Van No"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Name"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Transporter</Text>
//             <TextInput
//               value={transporter}
//               onChangeText={setTransporter}
//               style={styles.input}
//               placeholder="Enter Transporter"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter Password"
//               placeholderTextColor="#999"
//             />
//           </>
//         )}

//         {selectedCollection === 'customer' && (
//           <>
//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Name"
//               placeholderTextColor="#999"
//             />

//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter Password"
//               placeholderTextColor="#999"
//             />
//           </>
//         )}

//         {isLoading ? (
//           <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
//         ) : (
//           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//             <Text style={styles.saveButtonText}>Save User</Text>
//           </TouchableOpacity>
//         )}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollContainer: {
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: '#fff',
//     fontSize: 16,
//     color: '#333',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dropdownContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 16,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dropdownItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   dropdownItemText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   placeholderText: {
//     fontSize: 16,
//     color: '#999',
//   },
//   loader: {
//     marginTop: 20,
//   },
//   saveButton: {
//     //backgroundColor: '#6200ee',
//     backgroundColor:'orange',
//     borderRadius: 8,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   topSection: {
//     width: '100%',
//     height: '10%',
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
// });

// export default AddUserScreen;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Dimensions,
//   Alert,
//   Keyboard,
// } from 'react-native';
// import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
// import SearchableDropdown from 'react-native-searchable-dropdown';
// import { app } from '../firebase';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { router } from 'expo-router';

// const db = getFirestore(app);

// const collections = [
//   { id: 'deliverydriver', name: 'Delivery Driver' },
//   { id: 'customer', name: 'Customer' },
//   { id: 'transporter', name: 'Transporter' },
//   { id: 'fieldagent', name: 'Field Agent' },
// ];

// const AddUserScreen: React.FC = () => {
//   const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
//   const [assignedVanNo, setAssignedVanNo] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [name, setName] = useState('');
//   const [transporter, setTransporter] = useState('');
//   const [loadingPoint, setLoadingPoint] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [transporters, setTransporters] = useState<{ id: string; name: string }[]>([]);
//   const [loadingPoints, setLoadingPoints] = useState<{ id: string; name: string }[]>([]);
//   const [fetchingTransporters, setFetchingTransporters] = useState(false);
//   const [fetchingLoadingPoints, setFetchingLoadingPoints] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [keyboardOffset, setKeyboardOffset] = useState(0);

//   const { width, height } = Dimensions.get('window');
//   const isSmallDevice = height < 700;

//   // Keyboard handling
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       (e) => {
//         setKeyboardOffset(e.endCoordinates.height);
//       }
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardOffset(0);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Fetch data based on selected collection
//   useEffect(() => {
//     const fetchData = async () => {
//       if (selectedCollection === 'deliverydriver') {
//         setFetchingTransporters(true);
//         try {
//           const transporterRef = collection(db, 'transporter');
//           const transporterSnapshot = await getDocs(transporterRef);
//           const transporterData = transporterSnapshot.docs.map((doc) => ({
//             id: doc.id,
//             name: doc.data().name || `Transporter ${doc.id.substring(0, 4)}`,
//           }));
//           setTransporters(transporterData);
//         } catch (error) {
//           console.error('Error fetching transporters:', error);
//           showAlert('Error', 'Failed to fetch transporters');
//         } finally {
//           setFetchingTransporters(false);
//         }
//       } else if (selectedCollection === 'fieldagent') {
//         setFetchingLoadingPoints(true);
//         try {
//           const loadingPointRef = collection(db, 'originPoint');
//           const loadingPointSnapshot = await getDocs(loadingPointRef);
//           const loadingPointData = loadingPointSnapshot.docs.map((doc) => ({
//             id: doc.id,
//             name: doc.data().name || `Loading Point ${doc.id.substring(0, 4)}`,
//           }));
//           setLoadingPoints(loadingPointData);
//         } catch (error) {
//           console.error('Error fetching loading points:', error);
//           showAlert('Error', 'Failed to fetch loading points');
//         } finally {
//           setFetchingLoadingPoints(false);
//         }
//       }
//     };

//     fetchData();
//   }, [selectedCollection]);

//   const showAlert = (title: string, message: string) => {
//     Alert.alert(title, message);
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!selectedCollection) {
//       newErrors.collection = 'Please select a collection';
//     }

//     if (!phoneNumber) {
//       newErrors.phoneNumber = 'Phone number is required';
//     }

//     if (!name) {
//       newErrors.name = 'Name is required';
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//     }

//     if (selectedCollection === 'deliverydriver') {
//       if (!assignedVanNo) newErrors.assignedVanNo = 'Van number is required';
//       if (!transporter) newErrors.transporter = 'Transporter is required';
//     }

//     if (selectedCollection === 'fieldagent' && !loadingPoint) {
//       newErrors.loadingPoint = 'Loading point is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     const uid = `${phoneNumber}_${name}`;
//     const userData: Record<string, any> = { 
//       uid,
//       phoneNumber,
//       name,
//       password,
//       createdAt: new Date().toISOString()
//     };

//     // Collection-specific fields
//     if (selectedCollection === 'deliverydriver') {
//       Object.assign(userData, {
//         AssignedVanNo: assignedVanNo,
//         Transporter: transporter,
//       });
//     } else if (selectedCollection === 'fieldagent') {
//       Object.assign(userData, {
//         LoadingPoint: loadingPoint,
//       });
//     }

//     setIsLoading(true);
//     try {
//       await setDoc(doc(db, selectedCollection!, uid), userData);
//       showAlert('Success', 'User added successfully');
//       // Reset form
//       setSelectedCollection(null);
//       setAssignedVanNo('');
//       setPhoneNumber('');
//       setName('');
//       setTransporter('');
//       setLoadingPoint('');
//       setPassword('');
//       setErrors({});
//     } catch (error) {
//       showAlert('Error', 'Failed to add user');
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
//     >
//       <ScrollView
//         contentContainerStyle={[
//           styles.scrollContainer,
//           { paddingBottom: keyboardOffset + 20 }
//         ]}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header with Back Button */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
//             <Ionicons name="arrow-back" size={24} color="#2C3E50" />
//           </TouchableOpacity>
//           <Text style={styles.title}>Create New User</Text>
//           <View style={{ width: 24 }} /> {/* Spacer for alignment */}
//         </View>

//         {/* Form Content */}
//         <View style={styles.formContainer}>
//           <Text style={styles.label}>Select Access Level</Text>
//           <SearchableDropdown
//             onItemSelect={(item) => {
//               setSelectedCollection(item.id);
//               setErrors(prev => ({ ...prev, collection: '' }));
//             }}
//             containerStyle={styles.dropdownContainer}
//             textInputStyle={styles.dropdownTextInput}
//             itemStyle={styles.dropdownItem}
//             itemTextStyle={styles.dropdownItemText}
//             itemsContainerStyle={[
//               styles.dropdownItemsContainer,
//               isSmallDevice && { maxHeight: 150 }
//             ]}
//             items={collections}
//             defaultIndex={-1}
//             resetValue={false}
//             underlineColorAndroid="transparent"
//             placeholder="Select User Type"
//             placeholderTextColor="#999"
//             searchPlaceholder="Search user types..."
//             nestedScrollEnabled={true}
//             onRemoveItem={() => setSelectedCollection(null)}
//           />
//           {errors.collection && <Text style={styles.errorText}>{errors.collection}</Text>}

//           {/* Delivery Driver Specific Fields */}
//           {selectedCollection === 'deliverydriver' && (
//             <>
//               <Text style={styles.label}>Assigned Van Number</Text>
//               <TextInput
//                 value={assignedVanNo}
//                 onChangeText={(text) => {
//                   setAssignedVanNo(text);
//                   setErrors(prev => ({ ...prev, assignedVanNo: '' }));
//                 }}
//                 style={[styles.input, errors.assignedVanNo && styles.inputError]}
//                 placeholder="Enter Van No."
//                 placeholderTextColor="#999"
//                 returnKeyType="next"
//               />
//               {errors.assignedVanNo && <Text style={styles.errorText}>{errors.assignedVanNo}</Text>}

//               <Text style={styles.label}>Transporter</Text>
//               {fetchingTransporters ? (
//                 <ActivityIndicator size="small" color="#FFA500" />
//               ) : (
//                 <SearchableDropdown
//                   onItemSelect={(item) => {
//                     setTransporter(item.id);
//                     setErrors(prev => ({ ...prev, transporter: '' }));
//                   }}
//                   containerStyle={[styles.dropdownContainer, errors.transporter && styles.inputError]}
//                   textInputStyle={styles.dropdownTextInput}
//                   itemStyle={styles.dropdownItem}
//                   itemTextStyle={styles.dropdownItemText}
//                   itemsContainerStyle={[
//                     styles.dropdownItemsContainer,
//                     isSmallDevice && { maxHeight: 150 }
//                   ]}
//                   items={transporters}
//                   defaultIndex={-1}
//                   resetValue={false}
//                   underlineColorAndroid="transparent"
//                   placeholder="Select Transporter"
//                   placeholderTextColor="#999"
//                   searchPlaceholder="Search transporters..."
//                   nestedScrollEnabled={true}
//                   onRemoveItem={() => setTransporter('')}
//                 />
//               )}
//               {errors.transporter && <Text style={styles.errorText}>{errors.transporter}</Text>}
//             </>
//           )}

//           {/* Field Agent Specific Fields */}
//           {selectedCollection === 'fieldagent' && (
//             <>
//               <Text style={styles.label}>Loading Point</Text>
//               {fetchingLoadingPoints ? (
//                 <ActivityIndicator size="small" color="#FFA500" />
//               ) : (
//                 <SearchableDropdown
//                   onItemSelect={(item) => {
//                     setLoadingPoint(item.id);
//                     setErrors(prev => ({ ...prev, loadingPoint: '' }));
//                   }}
//                   containerStyle={[styles.dropdownContainer, errors.loadingPoint && styles.inputError]}
//                   textInputStyle={styles.dropdownTextInput}
//                   itemStyle={styles.dropdownItem}
//                   itemTextStyle={styles.dropdownItemText}
//                   itemsContainerStyle={[
//                     styles.dropdownItemsContainer,
//                     isSmallDevice && { maxHeight: 150 }
//                   ]}
//                   items={loadingPoints}
//                   defaultIndex={-1}
//                   resetValue={false}
//                   underlineColorAndroid="transparent"
//                   placeholder="Select Loading Point"
//                   placeholderTextColor="#999"
//                   searchPlaceholder="Search loading points..."
//                   nestedScrollEnabled={true}
//                   onRemoveItem={() => setLoadingPoint('')}
//                 />
//               )}
//               {errors.loadingPoint && <Text style={styles.errorText}>{errors.loadingPoint}</Text>}
//             </>
//           )}

//           {/* Common Fields */}
//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             value={phoneNumber}
//             onChangeText={(text) => {
//               setPhoneNumber(text);
//               setErrors(prev => ({ ...prev, phoneNumber: '' }));
//             }}
//             keyboardType="phone-pad"
//             style={[styles.input, errors.phoneNumber && styles.inputError]}
//             placeholder="Enter Phone Number"
//             placeholderTextColor="#999"
//             returnKeyType="next"
//           />
//           {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

//           <Text style={styles.label}>
//             {selectedCollection === 'customer' ? 'Customer Name' : 
//              selectedCollection === 'transporter' ? 'Transporter Name' : 
//              selectedCollection === 'fieldagent' ? 'Agent Name' : 'Name'}
//           </Text>
//           <TextInput
//             value={name}
//             onChangeText={(text) => {
//               setName(text);
//               setErrors(prev => ({ ...prev, name: '' }));
//             }}
//             style={[styles.input, errors.name && styles.inputError]}
//             placeholder={
//               selectedCollection === 'customer' ? 'Enter Customer Name' : 
//               selectedCollection === 'transporter' ? 'Enter Transporter Name' : 
//               selectedCollection === 'fieldagent' ? 'Enter Agent Name' : 'Enter Name'
//             }
//             placeholderTextColor="#999"
//             returnKeyType="next"
//           />
//           {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

//           <Text style={styles.label}>Password</Text>
//           <TextInput
//             value={password}
//             onChangeText={(text) => {
//               setPassword(text);
//               setErrors(prev => ({ ...prev, password: '' }));
//             }}
//             secureTextEntry
//             style={[styles.input, errors.password && styles.inputError]}
//             placeholder="Enter Password"
//             placeholderTextColor="#999"
//             returnKeyType="done"
//             onSubmitEditing={Keyboard.dismiss}
//           />
//           {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

//           {isLoading ? (
//             <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
//           ) : (
//             <TouchableOpacity 
//               style={styles.saveButton} 
//               onPress={handleSave}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.saveButtonText}>Save User</Text>
//               <Ionicons name="save-outline" size={20} color="#FFF" style={styles.saveIcon} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#F8F9FA' 
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   backButton: {
//     padding: 8,
//   },
//   scrollContainer: { 
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   formContainer: {
//     paddingBottom: 40,
//   },
//   title: { 
//     fontSize: 22, 
//     fontWeight: 'bold', 
//     color: '#2C3E50',
//     textAlign: 'center',
//     flex: 1,
//   },
//   label: { 
//     fontSize: 14, 
//     fontWeight: '600', 
//     marginBottom: 8, 
//     color: '#34495E',
//     marginTop: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D5DBE1',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 5,
//     backgroundColor: '#FFF',
//     fontSize: 14,
//     color: '#2C3E50',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   inputError: {
//     borderColor: '#E74C3C',
//   },
//   errorText: {
//     color: '#E74C3C',
//     fontSize: 12,
//     marginBottom: 8,
//     marginTop: -5,
//   },
//   loader: { 
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   saveButton: {
//     backgroundColor: '#FFA500',
//     borderRadius: 8,
//     padding: 14,
//     alignItems: 'center',
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   saveButtonText: { 
//     color: '#FFF', 
//     fontSize: 16, 
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   saveIcon: {
//     marginTop: 2,
//   },
//   // Dropdown styles
//   dropdownContainer: {
//     padding: 0,
//     marginBottom: 5,
//   },
//   dropdownTextInput: {
//     borderWidth: 1,
//     borderColor: '#D5DBE1',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#FFF',
//     fontSize: 14,
//     color: '#2C3E50',
//   },
//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#D5DBE1',
//   },
//   dropdownItemText: {
//     fontSize: 14,
//     color: '#2C3E50',
//   },
//   dropdownItemsContainer: {
//     maxHeight: 200,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#D5DBE1',
//     marginTop: 5,
//   },
// });

// export default AddUserScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { app } from '../firebase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

const db = getFirestore(app);

const collections = [
  { id: 'deliverydriver', name: 'Delivery Driver' },
  { id: 'customer', name: 'Customer' },
  { id: 'transporter', name: 'Transporter' },
  { id: 'fieldagent', name: 'Field Agent' },
];

const AddUserScreen: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [assignedVanNo, setAssignedVanNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [transporter, setTransporter] = useState('');
  const [loadingPoint, setLoadingPoint] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transporters, setTransporters] = useState<{ id: string; name: string }[]>([]);
  const [loadingPoints, setLoadingPoints] = useState<{ id: string; name: string }[]>([]);
  const [fetchingTransporters, setFetchingTransporters] = useState(false);
  const [fetchingLoadingPoints, setFetchingLoadingPoints] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const { width, height } = Dimensions.get('window');
  const isSmallDevice = height < 700;

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch data based on selected collection
  useEffect(() => {
    const fetchData = async () => {
      if (selectedCollection === 'deliverydriver' || selectedCollection === 'transporter') {
        setFetchingTransporters(true);
        try {
          const transporterRef = collection(db, 'transporter');
          const transporterSnapshot = await getDocs(transporterRef);
          const transporterData = transporterSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || `Transporter ${doc.id.substring(0, 4)}`,
          }));
          setTransporters(transporterData);
        } catch (error) {
          console.error('Error fetching transporters:', error);
          showAlert('Error', 'Failed to fetch transporters');
        } finally {
          setFetchingTransporters(false);
        }
      }
      
      if (selectedCollection === 'fieldagent' || selectedCollection === 'transporter') {
        setFetchingLoadingPoints(true);
        try {
          const loadingPointRef = collection(db, 'originPoint');
          const loadingPointSnapshot = await getDocs(loadingPointRef);
          const loadingPointData = loadingPointSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || `Loading Point ${doc.id.substring(0, 4)}`,
          }));
          setLoadingPoints(loadingPointData);
        } catch (error) {
          console.error('Error fetching loading points:', error);
          showAlert('Error', 'Failed to fetch loading points');
        } finally {
          setFetchingLoadingPoints(false);
        }
      }
    };

    fetchData();
  }, [selectedCollection]);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCollection) {
      newErrors.collection = 'Please select a collection';
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (selectedCollection === 'deliverydriver') {
      if (!assignedVanNo) newErrors.assignedVanNo = 'Van number is required';
      if (!transporter) newErrors.transporter = 'Transporter is required';
    }

    if (selectedCollection === 'fieldagent' && !loadingPoint) {
      newErrors.loadingPoint = 'Loading point is required';
    }

    if (selectedCollection === 'transporter' && !loadingPoint) {
      newErrors.loadingPoint = 'Loading point is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const uid = `${phoneNumber}_${name}`;
    const userData: Record<string, any> = { 
      uid,
      phoneNumber,
      name,
      password,
      createdAt: new Date().toISOString()
    };

    // Collection-specific fields
    if (selectedCollection === 'deliverydriver') {
      Object.assign(userData, {
        AssignedVanNo: assignedVanNo,
        Transporter: transporter,
      });
    } else if (selectedCollection === 'fieldagent') {
      Object.assign(userData, {
        LoadingPoint: loadingPoint,
      });
    } else if (selectedCollection === 'transporter') {
      Object.assign(userData, {
        LoadingPoint: loadingPoint,
      });
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, selectedCollection!, uid), userData);
      showAlert('Success', 'User added successfully');
      // Reset form
      setSelectedCollection(null);
      setAssignedVanNo('');
      setPhoneNumber('');
      setName('');
      setTransporter('');
      setLoadingPoint('');
      setPassword('');
      setErrors({});
    } catch (error) {
      showAlert('Error', 'Failed to add user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: keyboardOffset + 20 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New User</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        {/* Form Content */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Select Access Level</Text>
          <SearchableDropdown
            onItemSelect={(item) => {
              setSelectedCollection(item.id);
              setErrors(prev => ({ ...prev, collection: '' }));
            }}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownTextInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={[
              styles.dropdownItemsContainer,
              isSmallDevice && { maxHeight: 150 }
            ]}
            items={collections}
            defaultIndex={-1}
            resetValue={false}
            underlineColorAndroid="transparent"
            placeholder="Select User Type"
            placeholderTextColor="#999"
            searchPlaceholder="Search user types..."
            nestedScrollEnabled={true}
            onRemoveItem={() => setSelectedCollection(null)}
          />
          {errors.collection && <Text style={styles.errorText}>{errors.collection}</Text>}

          {/* Delivery Driver Specific Fields */}
          {selectedCollection === 'deliverydriver' && (
            <>
              <Text style={styles.label}>Assigned Van Number</Text>
              <TextInput
                value={assignedVanNo}
                onChangeText={(text) => {
                  setAssignedVanNo(text);
                  setErrors(prev => ({ ...prev, assignedVanNo: '' }));
                }}
                style={[styles.input, errors.assignedVanNo && styles.inputError]}
                placeholder="Enter Van No."
                placeholderTextColor="#999"
                returnKeyType="next"
              />
              {errors.assignedVanNo && <Text style={styles.errorText}>{errors.assignedVanNo}</Text>}

              <Text style={styles.label}>Transporter</Text>
              {fetchingTransporters ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <SearchableDropdown
                  onItemSelect={(item) => {
                    setTransporter(item.id);
                    setErrors(prev => ({ ...prev, transporter: '' }));
                  }}
                  containerStyle={[styles.dropdownContainer, errors.transporter && styles.inputError]}
                  textInputStyle={styles.dropdownTextInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  itemsContainerStyle={[
                    styles.dropdownItemsContainer,
                    isSmallDevice && { maxHeight: 150 }
                  ]}
                  items={transporters}
                  defaultIndex={-1}
                  resetValue={false}
                  underlineColorAndroid="transparent"
                  placeholder="Select Transporter"
                  placeholderTextColor="#999"
                  searchPlaceholder="Search transporters..."
                  nestedScrollEnabled={true}
                  onRemoveItem={() => setTransporter('')}
                />
              )}
              {errors.transporter && <Text style={styles.errorText}>{errors.transporter}</Text>}
            </>
          )}

          {/* Field Agent Specific Fields */}
          {selectedCollection === 'fieldagent' && (
            <>
              <Text style={styles.label}>Loading Point</Text>
              {fetchingLoadingPoints ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <SearchableDropdown
                  onItemSelect={(item) => {
                    setLoadingPoint(item.id);
                    setErrors(prev => ({ ...prev, loadingPoint: '' }));
                  }}
                  containerStyle={[styles.dropdownContainer, errors.loadingPoint && styles.inputError]}
                  textInputStyle={styles.dropdownTextInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  itemsContainerStyle={[
                    styles.dropdownItemsContainer,
                    isSmallDevice && { maxHeight: 150 }
                  ]}
                  items={loadingPoints}
                  defaultIndex={-1}
                  resetValue={false}
                  underlineColorAndroid="transparent"
                  placeholder="Select Loading Point"
                  placeholderTextColor="#999"
                  searchPlaceholder="Search loading points..."
                  nestedScrollEnabled={true}
                  onRemoveItem={() => setLoadingPoint('')}
                />
              )}
              {errors.loadingPoint && <Text style={styles.errorText}>{errors.loadingPoint}</Text>}
            </>
          )}

          {/* Transporter Specific Fields */}
          {selectedCollection === 'transporter' && (
            <>
              <Text style={styles.label}>Loading Point</Text>
              {fetchingLoadingPoints ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <SearchableDropdown
                  onItemSelect={(item) => {
                    setLoadingPoint(item.id);
                    setErrors(prev => ({ ...prev, loadingPoint: '' }));
                  }}
                  containerStyle={[styles.dropdownContainer, errors.loadingPoint && styles.inputError]}
                  textInputStyle={styles.dropdownTextInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={styles.dropdownItemText}
                  itemsContainerStyle={[
                    styles.dropdownItemsContainer,
                    isSmallDevice && { maxHeight: 150 }
                  ]}
                  items={loadingPoints}
                  defaultIndex={-1}
                  resetValue={false}
                  underlineColorAndroid="transparent"
                  placeholder="Select Loading Point"
                  placeholderTextColor="#999"
                  searchPlaceholder="Search loading points..."
                  nestedScrollEnabled={true}
                  onRemoveItem={() => setLoadingPoint('')}
                />
              )}
              {errors.loadingPoint && <Text style={styles.errorText}>{errors.loadingPoint}</Text>}
            </>
          )}

          {/* Common Fields */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setErrors(prev => ({ ...prev, phoneNumber: '' }));
            }}
            keyboardType="phone-pad"
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="Enter Phone Number"
            placeholderTextColor="#999"
            returnKeyType="next"
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

          <Text style={styles.label}>
            {selectedCollection === 'customer' ? 'Customer Name' : 
             selectedCollection === 'transporter' ? 'Transporter Name' : 
             selectedCollection === 'fieldagent' ? 'Agent Name' : 'Name'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors(prev => ({ ...prev, name: '' }));
            }}
            style={[styles.input, errors.name && styles.inputError]}
            placeholder={
              selectedCollection === 'customer' ? 'Enter Customer Name' : 
              selectedCollection === 'transporter' ? 'Enter Transporter Name' : 
              selectedCollection === 'fieldagent' ? 'Enter Agent Name' : 'Enter Name'
            }
            placeholderTextColor="#999"
            returnKeyType="next"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Enter Password"
            placeholderTextColor="#999"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {isLoading ? (
            <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
          ) : (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save User</Text>
              <Ionicons name="save-outline" size={20} color="#FFF" style={styles.saveIcon} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: { 
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    paddingBottom: 40,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2C3E50',
    textAlign: 'center',
    flex: 1,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#34495E',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5DBE1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: '#FFF',
    fontSize: 14,
    color: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -5,
  },
  loader: { 
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
    marginRight: 8,
  },
  saveIcon: {
    marginTop: 2,
  },
  // Dropdown styles
  dropdownContainer: {
    padding: 0,
    marginBottom: 5,
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
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DBE1',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  dropdownItemsContainer: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5DBE1',
    marginTop: 5,
  },
});

export default AddUserScreen;