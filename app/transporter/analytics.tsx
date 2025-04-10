// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, Pressable, Alert } from 'react-native';
// import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
// import { collection, getDocs, query, where, getFirestore, addDoc, doc, updateDoc } from 'firebase/firestore';
// import { app } from "../firebase";
// import { useFocusEffect } from '@react-navigation/native';
// import { useLocalSearchParams } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import SegmentedControl from '@react-native-segmented-control/segmented-control';

// const { width: screenWidth } = Dimensions.get('window');
// const chartSize = screenWidth * 0.6;
// const legendWidth = screenWidth * 0.3;

// const db = getFirestore(app);

// interface Shipment {
//   createdAt: string;
//   driverName: string;
//   freightCost: number;
//   mobileNumber: string;
//   route: string;
//   statusId: number;
//   transporter: string;
//   vehicleNo: string;
// }

// interface Expense {
//   id?: string;
//   amount: number;
//   description: string;
//   category: string;
//   date: string;
//   vehicleNo?: string;
//   createdAt: string;
// }

// const statusColors = {
//   Completed: '#4CAF50',
//   Pending: '#FF9800',
//   Delayed: '#F44336',
// };

// const expenseCategories = ['Fuel', 'Maintenance', 'Tolls', 'Driver', 'Other'];

// const AnalyticsScreen: React.FC = () => {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
//   const [totalExpenses, setTotalExpenses] = useState<number>(0);
//   const [netRevenue, setNetRevenue] = useState<number>(0);
//   const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
//   const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
//   const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
//   const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
//   const [expenseAnalysis, setExpenseAnalysis] = useState({
//     byCategory: [] as { value: number; label: string; color: string }[],
//     byVehicle: [] as { value: number; label: string; color: string }[],
//     revenueVsExpense: [] as { month: string; revenue: number; expense: number; profit: number }[],
//   });
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
//   const [activeChart, setActiveChart] = useState<'routes' | 'vehicles' | 'status' | 'trend'>('routes');
//   const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
//   const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'createdAt'>>({
//     amount: 0,
//     description: '',
//     category: 'Fuel',
//     date: new Date().toISOString().split('T')[0],
//     vehicleNo: ''
//   });

//   const [isSavingExpense, setIsSavingExpense] = useState(false);
// const [showConfirmModal, setShowConfirmModal] = useState(false);
// const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
// const [totalInvoiceRevenue, setTotalInvoiceRevenue] = useState<number>(0);

//   const { transporterName } = useLocalSearchParams();

//   useFocusEffect(
//     useCallback(() => {
//       fetchAnalyticsData();
//     }, [timeFilter])
//   );

//   const fetchAnalyticsData = async () => {
//     try {
//       setRefreshing(true);
//       setLoading(true);
      
//       // 1. FETCH SHIPMENTS (existing logic)
//       const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', transporterName));
//       const shipmentSnapshot = await getDocs(shipmentRef);
//       const shipmentData = shipmentSnapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           createdAt: data.createdAt || '',
//           driverName: data.driverName || '',
//           freightCost: data.freightCost || 0,
//           mobileNumber: data.mobileNumber || '',
//           route: data.route || '',
//           statusId: data.statusId || 0,
//           transporter: data.transporter || '',
//           vehicleNo: data.vehicleNo || ''
//         } as Shipment;
//       });
//       setShipments(shipmentData);
  
//       // 2. FETCH INVOICE REVENUE (new logic)
//       const transporterQuery = query(collection(db, 'transporter'), where('name', '==', transporterName));
//       const transporterSnapshot = await getDocs(transporterQuery);
      
//       if (!transporterSnapshot.empty) {
//         const transporterDocId = transporterSnapshot.docs[0].id;
        
//         // 2a. Get all clients
//         const clientsRef = collection(db, 'transporter', transporterDocId, 'clients');
//         const clientsSnapshot = await getDocs(clientsRef);
        
//         let totalInvoiceRevenue = 0;
        
//         // 2b. Fetch invoices from each client
//         for (const clientDoc of clientsSnapshot.docs) {
//           const invoicesRef = collection(db, 'transporter', transporterDocId, 'clients', clientDoc.id, 'invoices');
//           const invoicesSnapshot = await getDocs(invoicesRef);
          
//           invoicesSnapshot.forEach(invoiceDoc => {
//             const invoice = invoiceDoc.data();
//             // Calculate revenue from invoice (subtotal + VAT)
//             const invoiceRevenue = (Number(invoice.subtotal) || 0) + (Number(invoice.totalVat) || 0);
//             totalInvoiceRevenue += invoiceRevenue;
//           });
//         }
        
//         // Update invoice revenue state
//         setTotalInvoiceRevenue(totalInvoiceRevenue);
  
//         // 3. FETCH EXPENSES (existing logic)
//         const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
//         const expenseSnapshot = await getDocs(expenseRef);
        
//         const expenseData = expenseSnapshot.docs.map(doc => {
//           const data = doc.data();
//           let createdAt = new Date().toISOString();
          
//           if (data.createdAt) {
//             if (typeof data.createdAt.toDate === 'function') {
//               createdAt = data.createdAt.toDate().toISOString();
//             } else if (typeof data.createdAt === 'string') {
//               createdAt = data.createdAt;
//             }
//           }
          
//           return {
//             id: doc.id,
//             ...data,
//             createdAt
//           } as Expense;
//         });
        
//         // 4. CALCULATE TOTALS
//         const totalFreightRevenue = shipmentData.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
//         // const totalRevenue = totalFreightRevenue + totalInvoiceRevenue; // Combined revenue
//         const totalRevenue = totalInvoiceRevenue;
//         const totalExp = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
//         // 5. UPDATE STATE
//         setTotalFreightRevenue(totalFreightRevenue);
//         setExpenses(expenseData);
//         setTotalExpenses(totalExp);
//         setNetRevenue(totalRevenue - totalExp);
  
//         // 6. ANALYZE DATA
//         // 6a. Expense Analysis (existing)
//         const byCategory: Record<string, number> = {};
//         const byVehicle: Record<string, number> = {};
        
//         expenseData.forEach(expense => {
//           // By category
//           byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
          
//           // By vehicle
//           if (expense.vehicleNo) {
//             byVehicle[expense.vehicleNo] = (byVehicle[expense.vehicleNo] || 0) + expense.amount;
//           }
//         });
        
//         // 6b. Revenue vs Expense by Month (updated)
//         const revenueByMonth: Record<string, number> = {};
//         const expenseByMonth: Record<string, number> = {};
//         const revenueVsExpense: { month: string; revenue: number; expense: number; profit: number }[] = [];
        
//         // Process shipment revenue by month
//         shipmentData.forEach(shipment => {
//           const date = new Date(shipment.createdAt);
//           const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
//           revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + (shipment.freightCost || 0);
//         });
        
//         // Process expenses by month
//         expenseData.forEach(expense => {
//           const date = new Date(expense.createdAt);
//           const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
//           expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + (expense.amount || 0);
//         });
        
//         // Combine data
//         const allMonths = new Set([...Object.keys(revenueByMonth), ...Object.keys(expenseByMonth)]);
//         allMonths.forEach(month => {
//           revenueVsExpense.push({
//             month,
//             revenue: revenueByMonth[month] || 0,
//             expense: expenseByMonth[month] || 0,
//             profit: (revenueByMonth[month] || 0) - (expenseByMonth[month] || 0)
//           });
//         });
        
//         // Sort by month
//         revenueVsExpense.sort((a, b) => a.month.localeCompare(b.month));
        
//         // 6c. Update expense analysis state
//         setExpenseAnalysis(prev => ({
//           ...prev,
//           revenueVsExpense,
//           byCategory: Object.keys(byCategory).map(category => ({
//             value: byCategory[category],
//             label: category,
//             color: getCategoryColor(category)
//           })),
//           byVehicle: Object.keys(byVehicle).map(vehicle => ({
//             value: byVehicle[vehicle],
//             label: vehicle,
//             color: getVehicleColor(vehicle)
//           }))
//         }));
  
//         // 7. SHIPMENT ANALYTICS (existing logic)
//         // 7a. Route Frequency
//         const routeCounts: Record<string, number> = {};
//         shipmentData.forEach(({ route }) => {
//           routeCounts[route] = (routeCounts[route] || 0) + 1;
//         });
        
//         setRouteFrequency(
//           Object.keys(routeCounts).map(route => ({
//             value: Number(routeCounts[route]) || 0,
//             label: route
//           }))
//         );
  
//         // 7b. Vehicle Usage
//         const vehicleCounts: Record<string, number> = {};
//         shipmentData.forEach(({ vehicleNo }) => {
//           vehicleCounts[vehicleNo] = (vehicleCounts[vehicleNo] || 0) + 1;
//         });
        
//         setVehicleUsage(
//           Object.keys(vehicleCounts).map(vehicle => ({
//             value: Number(vehicleCounts[vehicle]) || 0,
//             label: vehicle
//           }))
//         );
        
//         // 7c. Status Distribution
//         const statusCounts = { 'Completed': 0, 'Pending': 0, 'Delayed': 0 };
//         shipmentData.forEach(({ statusId }) => {
//           if (statusId === 4) statusCounts['Completed']++;
//           else if (statusId <=3) statusCounts['Pending']++;
//           else statusCounts['Delayed']++;
//         });
        
//         setStatusData([
//           { value: statusCounts['Completed'], color: statusColors.Completed, label: 'Completed' },
//           { value: statusCounts['Pending'], color: statusColors.Pending, label: 'Pending' },
//           { value: statusCounts['Delayed'], color: statusColors.Delayed, label: 'Delayed' },
//         ]);
  
//         // 7d. Revenue Trend (filtered by time)
//         const filteredData = shipmentData.filter(({ createdAt }) => {
//           const date = new Date(createdAt);
//           const now = new Date();
//           if (timeFilter === 'week') {
//             return date >= new Date(now.setDate(now.getDate() - 7));
//           } else if (timeFilter === 'month') {
//             return date >= new Date(now.setMonth(now.getMonth() - 1));
//           }
//           return true;
//         });
        
//         const revenueTrend: Record<string, number> = {};
//         filteredData.forEach(({ createdAt, freightCost }) => {
//           const dateLabel = new Date(createdAt).toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric'
//           });
//           revenueTrend[dateLabel] = (revenueTrend[dateLabel] || 0) + freightCost;
//         });
        
//         setTrendData(
//           Object.keys(revenueTrend).map(date => ({
//             value: Number(revenueTrend[date]) || 0,
//             label: date
//           }))
//         );
//       }
//     } catch (error) {
//       console.error('Error fetching analytics data:', error);
//       Alert.alert('Error', 'Failed to load analytics data. Please try again.');
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };
//   const getCategoryColor = (category: string) => {
//     const colors: Record<string, string> = {
//       'Fuel': '#F59E0B',
//       'Maintenance': '#EF4444',
//       'Tolls': '#3B82F6',
//       'Driver': '#10B981',
//       'Other': '#8B5CF6'
//     };
//     return colors[category] || '#6B7280';
//   };

//   const getVehicleColor = (vehicle: string) => {
//     const hash = vehicle.split('').reduce((acc, char) => {
//       return char.charCodeAt(0) + ((acc << 5) - acc);
//     }, 0);
//     return `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
//   };

//   const handleAddExpense = async () => {
//     try {
//       setIsSavingExpense(true);
//       if (!newExpense.amount || !newExpense.description) {
//         alert('Please fill all required fields');
//         return;
//       }

//       // Get the transporter document ID
//       const transporterQuery = query(
//         collection(db, 'transporter'),
//         where('name', '==', transporterName)
//       );
//       const transporterSnapshot = await getDocs(transporterQuery);
      
//       if (transporterSnapshot.empty) {
//         throw new Error('Transporter not found');
//       }

//       const transporterDocId = transporterSnapshot.docs[0].id;
//       const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
      
//       if (editingExpense && editingExpense.id) {
//         // Update existing expense
//         await updateDoc(doc(expenseRef, editingExpense.id), {
//           amount: Number(newExpense.amount),
//           description: newExpense.description,
//           category: newExpense.category,
//           date: new Date(newExpense.date).toISOString(),
//           vehicleNo: newExpense.vehicleNo
//         });
//       } else {
//         // Add new expense
//         await addDoc(expenseRef, {
//           ...newExpense,
//           amount: Number(newExpense.amount),
//           date: new Date(newExpense.date).toISOString(),
//           createdAt: new Date().toISOString()
//         });
//       }

//       setShowAddExpenseModal(false);
//       setShowConfirmModal(false);
//       setEditingExpense(null);
//       setNewExpense({
//         amount: 0,
//         description: '',
//         category: 'Fuel',
//         date: new Date().toISOString().split('T')[0],
//         vehicleNo: ''
//       });
      
//       fetchAnalyticsData();
//       Alert.alert('Success', `Expense ${editingExpense ? 'updated' : 'added'} successfully!`);
//     } catch (error: any) {
//       console.error('Error adding expense:', error);
//       alert(`Failed to add expense: ${error.message}`);
//     } finally {
//       setIsSavingExpense(false);
//     }
//   };

//   const analyzeExpenses = (expenseData: Expense[], shipmentData: Shipment[]) => {
//     const byCategory: Record<string, number> = {};
//     const byVehicle: Record<string, number> = {};
//     const revenueVsExpense: { month: string; revenue: number; expense: number }[] = [];
    
//     // Group revenue by month
//     const revenueByMonth: Record<string, number> = {};
//     shipmentData.forEach(shipment => {
//       const date = new Date(shipment.createdAt);
//       if (isNaN(date.getTime())) return;
      
//       const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
//       revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + (shipment.freightCost || 0);
//     });
  
//     // Group expenses by month
//     const expenseByMonth: Record<string, number> = {};
//     expenseData.forEach(expense => {
//       const date = new Date(expense.date);
//       if (isNaN(date.getTime())) return;
      
//       const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
//       expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + (expense.amount || 0);
//     });
  
//     // Combine all months
//     const allMonths = new Set([
//       ...Object.keys(revenueByMonth),
//       ...Object.keys(expenseByMonth)
//     ]);
  
//     // Create the data array
//     Array.from(allMonths).forEach(month => {
//       revenueVsExpense.push({
//         month,
//         revenue: revenueByMonth[month] || 0,
//         expense: expenseByMonth[month] || 0
//       });
//     });
  
//     // Sort by date
//     revenueVsExpense.sort((a, b) => {
//       return new Date(a.month).getTime() - new Date(b.month).getTime();
//     });
  
//     return {
//       byCategory: Object.keys(byCategory).map(category => ({
//         value: byCategory[category],
//         label: category,
//         color: getCategoryColor(category)
//       })),
//       byVehicle: Object.keys(byVehicle).map(vehicle => ({
//         value: byVehicle[vehicle],
//         label: vehicle,
//         color: getVehicleColor(vehicle)
//       })),
//       revenueVsExpense
//     };
//   };

//   const handleEditExpense = (expense: Expense) => {
//     setEditingExpense(expense);
//     setNewExpense({
//       amount: expense.amount,
//       description: expense.description,
//       category: expense.category,
//       date: expense.date.split('T')[0],
//       vehicleNo: expense.vehicleNo || ''
//     });
//     setShowAddExpenseModal(true);
//   };

//   const renderChart = () => {
//     if (loading) {
//       return (
//         <View style={styles.chartPlaceholder}>
//           <ActivityIndicator size="large" color="#3A82F6" />
//         </View>
//       );
//     }

//     switch (activeChart) {
//       case 'routes':
//         return (
//           <View style={{width: chartSize}}>
//             <BarChart 
//               data={routeFrequency} 
//               barWidth={40} 
//               spacing={30} 
//               showValuesAsTopLabel 
//               isAnimated 
//               onPress={(item) => alert(`${item.label}: ${item.value} trips`)}
//               barBorderRadius={4}
//               frontColor="#3A82F6"
//               yAxisThickness={0}
//               xAxisThickness={0}
//               noOfSections={4}
//               yAxisTextStyle={{ color: '#6B7280' }}
//               xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center', width:'100%' }}
//               labelWidth={80}
//             />
//           </View>
//         );
//       case 'vehicles':
//         return (
//           <BarChart 
//             data={vehicleUsage} 
//             barWidth={40} 
//             spacing={30} 
//             showValuesAsTopLabel 
//             isAnimated 
//             onPress={(item) => alert(`${item.label}: ${item.value} times used`)}
//             barBorderRadius={4}
//             yAxisThickness={0}
//             xAxisThickness={0}
//             noOfSections={4}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
//             labelWidth={80}
//             frontColor="#3A82F6"
//           />
//         );
//       case 'status':
//         return (
//           <View style={styles.pieChartContainer}>
//             <View style={{ width: chartSize, height: chartSize, justifyContent: 'center', alignItems: 'center' }}>
//               <PieChart 
//                 data={statusData} 
//                 showValuesAsLabels 
//                 showText 
//                 textColor='white' 
//                 textSize={16} 
//                 fontWeight='bold' 
//                 showExternalLabels 
//                 donut 
//                 radius={chartSize/ 2- 20} 
//                 onPress={(item) => alert(`${item.label}: ${item.value}`)}
//                 centerLabelComponent={() => (
//                   <View style={styles.pieCenterLabel}>
//                     <Text style={styles.pieCenterText}>Status</Text>
//                   </View>
//                 )}
//               />
//               <View style={styles.legendContainer}>
//                 {statusData.map((item, index) => (
//                   <View key={index} style={styles.legendRow}>
//                     <View style={[styles.legendColor, { backgroundColor: item.color }]} />
//                     <Text style={styles.legendText}>
//                       {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           </View>
//         );
//       case 'trend':
//         return (
//           <LineChart 
//             data={trendData} 
//             color='#8B5CF6' 
//             curved 
//             thickness={3} 
//             isAnimated 
//             hideDataPoints 
//             onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value.toLocaleString()}`)}
//             adjustToWidth
//             yAxisThickness={0}
//             xAxisThickness={0}
//             noOfSections={4}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
//             areaChart
//             startFillColor="rgba(139, 92, 246, 0.1)"
//             startOpacity={0.1}
//             endFillColor="rgba(139, 92, 246, 0.05)"
//             endOpacity={0.05}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <ScrollView 
//       style={styles.container}
//       refreshControl={
//         <RefreshControl 
//           refreshing={refreshing} 
//           onRefresh={fetchAnalyticsData} 
//           tintColor="#3A82F6"
//         />
//       }
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Analytics Dashboard</Text>
//         <Text style={styles.headerSubtitle}>{transporterName}</Text>
//       </View>

//       {/* Financial Summary Cards */}
//       <View style={styles.financialSummary}>
//         {/* Revenue Card */}
//         <LinearGradient
//           colors={['#3A82F6', '#5D9DFF']}
//           style={styles.summaryCard}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.cardHeader}>
//             <MaterialIcons name="attach-money" size={20} color="white" />
//             <Text style={styles.cardTitle}>Total Revenue</Text>
//           </View>
//           {/* <Text style={styles.cardAmount}>₦{totalFreightRevenue.toLocaleString()}</Text> */}
//           {/* <Text style={styles.cardAmount}>₦{(totalFreightRevenue + totalInvoiceRevenue).toLocaleString()}</Text> */}
//           <Text style={styles.cardAmount}>₦{(totalInvoiceRevenue).toLocaleString()}</Text>
//           {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//     <Text style={styles.revenueBreakdown}>Freight: ₦{totalFreightRevenue.toLocaleString()}</Text>
//     <Text style={styles.revenueBreakdown}>Invoices: ₦{totalInvoiceRevenue.toLocaleString()}</Text>
//   </View> */}
//         </LinearGradient>

//         {/* Expenses Card */}
//         <LinearGradient
//           colors={['#EF4444', '#F87171']}
//           style={styles.summaryCard}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.cardHeader}>
//             <MaterialIcons name="money-off" size={20} color="white" />
//             <Text style={styles.cardTitle}>Total Expenses</Text>
//           </View>
//           <Text style={styles.cardAmount}>₦{totalExpenses.toLocaleString()}</Text>
//           <TouchableOpacity 
//             style={styles.addButton}
//             onPress={() => setShowAddExpenseModal(true)}
//           >
//             <Text style={styles.addButtonText}>Add Expense</Text>
//           </TouchableOpacity>
//         </LinearGradient>

//         {/* Net Revenue Card */}
//         <LinearGradient
//           colors={['#10B981', '#34D399']}
//           style={styles.summaryCard}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.cardHeader}>
//             <MaterialIcons name="account-balance" size={20} color="white" />
//             <Text style={styles.cardTitle}>Net Profit</Text>
//           </View>
//           <Text style={styles.cardAmount}>₦{netRevenue.toLocaleString()}</Text>
//         </LinearGradient>
//       </View>

//       {/* Time Filter */}
//       <SegmentedControl
//         values={['Week', 'Month', 'All']}
//         selectedIndex={timeFilter === 'week' ? 0 : timeFilter === 'month' ? 1 : 2}
//         onChange={(event) => {
//           const index = event.nativeEvent.selectedSegmentIndex;
//           setTimeFilter(index === 0 ? 'week' : index === 1 ? 'month' : 'all');
//         }}
//         style={styles.segmentControl}
//         tintColor="#F3F4F6"
//         backgroundColor="#FFFFFF"
//         activeFontStyle={{ color: '#111827', fontWeight: '600' }}
//         fontStyle={{ color: '#6B7280' }}
//       />

//       {/* Chart Navigation */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.chartNavContainer}
//       >
//         <TouchableOpacity 
//           style={[styles.chartNavButton, activeChart === 'routes' && styles.chartNavButtonActive]}
//           onPress={() => setActiveChart('routes')}
//         >
//           <MaterialIcons 
//             name="map" 
//             size={20} 
//             color={activeChart === 'routes' ? '#3A82F6' : '#6B7280'} 
//           />
//           <Text style={[styles.chartNavText, activeChart === 'routes' && styles.chartNavTextActive]}>
//             Routes
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.chartNavButton, activeChart === 'vehicles' && styles.chartNavButtonActive]}
//           onPress={() => setActiveChart('vehicles')}
//         >
//           <MaterialIcons 
//             name="directions-car" 
//             size={20} 
//             color={activeChart === 'vehicles' ? '#10B981' : '#6B7280'} 
//           />
//           <Text style={[styles.chartNavText, activeChart === 'vehicles' && styles.chartNavTextActive]}>
//             Vehicles
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.chartNavButton, activeChart === 'status' && styles.chartNavButtonActive]}
//           onPress={() => setActiveChart('status')}
//         >
//           <MaterialIcons 
//             name="pie-chart" 
//             size={20} 
//             color={activeChart === 'status' ? '#8B5CF6' : '#6B7280'} 
//           />
//           <Text style={[styles.chartNavText, activeChart === 'status' && styles.chartNavTextActive]}>
//             Status
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.chartNavButton, activeChart === 'trend' && styles.chartNavButtonActive]}
//           onPress={() => setActiveChart('trend')}
//         >
//           <MaterialIcons 
//             name="trending-up" 
//             size={20} 
//             color={activeChart === 'trend' ? '#F59E0B' : '#6B7280'} 
//           />
//           <Text style={[styles.chartNavText, activeChart === 'trend' && styles.chartNavTextActive]}>
//             Trends
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Chart Container */}
//       <View style={styles.chartContainer}>
//         {renderChart()}
//       </View>

//       {/* Expense Analytics Section */}
//       <Text style={styles.sectionTitle}>Expense Analytics</Text>
      
//       {/* Revenue vs Expenses Chart */}
//       <View style={styles.analyticsCard}>
//   <Text style={styles.analyticsTitle}>Revenue vs Expenses</Text>
//   {expenseAnalysis.revenueVsExpense.length > 0 ? (
//     <BarChart
//       data={expenseAnalysis.revenueVsExpense.map(item => ({
//         value: item.revenue,
//         label: item.month,
//         frontColor: '#3A82F6',
//         topLabelComponent: () => (
//           <Text style={{ color: '#3A82F6', fontSize: 10 }}>
//             ₦{item.revenue.toLocaleString()}
//           </Text>
//         ),
//         labelTextStyle: { color: '#6B7280', fontSize: 10 }
//       }))}
//       secondaryData={expenseAnalysis.revenueVsExpense.map(item => ({
//         value: item.expense,
//         frontColor: '#EF4444',
//         topLabelComponent: () => (
//           <Text style={{ color: '#EF4444', fontSize: 10 }}>
//             ₦{item.expense.toLocaleString()}
//           </Text>
//         )
//       }))}
//       barWidth={20}
//       spacing={30}
//       height={200}
//       noOfSections={5}
//       yAxisThickness={0}
//       xAxisThickness={0}
//       yAxisTextStyle={{ color: '#6B7280' }}
//       xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
//       showReferenceLine1
//       referenceLine1Position={0}
//       referenceLine1Config={{ color: 'gray', dashWidth: 2, dashGap: 3 }}
//       initialSpacing={10}
//     />
//   ) : (
//     <View style={styles.noDataContainer}>
//       <Text style={styles.noDataText}>No revenue/expense data available</Text>
//     </View>
//   )}
//   <View style={styles.legendContainer}>
//     <View style={styles.legendItem}>
//       <View style={[styles.legendColor, { backgroundColor: '#3A82F6' }]} />
//       <Text style={styles.legendText}>Revenue</Text>
//     </View>
//     <View style={styles.legendItem}>
//       <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
//       <Text style={styles.legendText}>Expenses</Text>
//     </View>
//   </View>
// </View>
//       <View style={styles.expenseListContainer}>
//   <Text style={styles.sectionTitle}>Recent Expenses</Text>
//   {expenses.slice(0, 5).map((expense) => (
//     <TouchableOpacity 
//       key={expense.id} 
//       style={styles.expenseItem}
//       onPress={() => handleEditExpense(expense)}
//     >
//       <View style={styles.expenseItemLeft}>
//         <Text style={styles.expenseCategory}>{expense.category}</Text>
//         <Text style={styles.expenseDescription}>{expense.description}</Text>
//         {expense.vehicleNo && (
//           <Text style={styles.expenseVehicle}>Vehicle: {expense.vehicleNo}</Text>
//         )}
//       </View>
//       <View style={styles.expenseItemRight}>
//         <Text style={styles.expenseAmount}>₦{expense.amount.toLocaleString()}</Text>
//         <Text style={styles.expenseDate}>
//           {new Date(expense.date).toLocaleDateString()}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ))}
// </View>


//       {/* Expenses by Category */}
//       <View style={styles.analyticsCard}>
//         <Text style={styles.analyticsTitle}>Expenses by Category</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <PieChart
//             data={expenseAnalysis.byCategory}
//             donut
//             showText
//             textColor="white"
//             radius={80}
//             innerRadius={50}
//             textSize={12}
//             centerLabelComponent={() => (
//               <View style={{ justifyContent: 'center', alignItems: 'center' }}>
//                 <Text style={{ fontSize: 14, color: '#6B7280' }}>Categories</Text>
//               </View>
//             )}
//           />
//           <View style={styles.legendContainer}>
//             {expenseAnalysis.byCategory.map((item, index) => (
//               <View key={index} style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: item.color }]} />
//                 <Text style={styles.legendText}>
//                   {item.label}: ₦{item.value.toLocaleString()}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>

//       {/* Expenses by Vehicle */}
//       {expenseAnalysis.byVehicle.length > 0 && (
//         <View style={styles.analyticsCard}>
//           <Text style={styles.analyticsTitle}>Expenses by Vehicle</Text>
//           <BarChart
//             data={expenseAnalysis.byVehicle}
//             barWidth={40}
//             spacing={20}
//             height={200}
//             noOfSections={5}
//             showValuesAsTopLabel
//             yAxisThickness={0}
//             xAxisThickness={0}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
//           />
//           <View style={styles.legendContainer}>
//             {expenseAnalysis.byVehicle.map((item, index) => (
//               <View key={index} style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: item.color }]} />
//                 <Text style={styles.legendText}>
//                   {item.label}: ₦{item.value.toLocaleString()}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       )}

//       {/* Stats Overview */}
//       <Text style={styles.sectionTitle}>Quick Stats</Text>
//       <View style={styles.statsContainer}>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>{shipments.length}</Text>
//           <Text style={styles.statLabel}>Total Shipments</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>
//             {statusData.reduce((acc, curr) => acc + curr.value, 0) > 0 
//               ? `${Math.round((statusData.find(s => s.label === 'Completed')?.value || 0) / 
//                  statusData.reduce((acc, curr) => acc + curr.value, 0) * 100)}%`
//               : '0%'}
//           </Text>
//           <Text style={styles.statLabel}>Completion Rate</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>{vehicleUsage.length}</Text>
//           <Text style={styles.statLabel}>Active Vehicles</Text>
//         </View>
//       </View>

//       {/* Add Expense Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showAddExpenseModal}
//         onRequestClose={() => {setShowAddExpenseModal(false); setEditingExpense(null);}}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>
//         {editingExpense ? 'Edit Expense' : 'Add New Expense'}
//       </Text>
            
//             <Text style={styles.inputLabel}>Amount (₦)</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="Enter amount"
//               value={newExpense.amount.toString()}
//               onChangeText={(text) => setNewExpense({...newExpense, amount: Number(text) || 0})}
//             />
            
//             <Text style={styles.inputLabel}>Description</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="What was this expense for?"
//               value={newExpense.description}
//               onChangeText={(text) => setNewExpense({...newExpense, description: text})}
//             />
            
//             <Text style={styles.inputLabel}>Category</Text>
//             <View style={styles.categoryContainer}>
//               {expenseCategories.map((cat) => (
//                 <TouchableOpacity
//                   key={cat}
//                   style={[
//                     styles.categoryButton,
//                     newExpense.category === cat && styles.categoryButtonSelected
//                   ]}
//                   onPress={() => setNewExpense({...newExpense, category: cat})}
//                 >
//                   <Text style={[
//                     styles.categoryButtonText,
//                     newExpense.category === cat && styles.categoryButtonTextSelected
//                   ]}>
//                     {cat}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
            
//             <Text style={styles.inputLabel}>Vehicle (optional)</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Vehicle number if applicable"
//               value={newExpense.vehicleNo}
//               onChangeText={(text) => setNewExpense({...newExpense, vehicleNo: text})}
//             />
            
//             <Text style={styles.inputLabel}>Date</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="YYYY-MM-DD"
//               value={newExpense.date}
//               onChangeText={(text) => setNewExpense({...newExpense, date: text})}
//             />
            
//             <View style={styles.modalButtonContainer}>
//         <Pressable
//           style={[styles.modalButton, styles.cancelButton]}
//           onPress={() => {
//             setShowAddExpenseModal(false);
//             setEditingExpense(null);
//           }}
//           disabled={isSavingExpense}
//         >
//           <Text style={styles.modalButtonText}>Cancel</Text>
//         </Pressable>
//         <Pressable
//           style={[styles.modalButton, styles.submitButton]}
//           onPress={() => setShowConfirmModal(true)}
//           disabled={isSavingExpense}
//         >
//           {isSavingExpense ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.modalButtonText}>
//               {editingExpense ? 'Update' : 'Save'}
//             </Text>
//           )}
//         </Pressable>
//       </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//   animationType="fade"
//   transparent={true}
//   visible={showConfirmModal}
//   onRequestClose={() => setShowConfirmModal(false)}
// >
//   <View style={styles.confirmModalContainer}>
//     <View style={styles.confirmModalContent}>
//       <Text style={styles.confirmModalTitle}>Confirm Expense</Text>
//       <Text style={styles.confirmModalText}>
//         {`Are you sure you want to ${editingExpense ? 'update' : 'add'} this expense?`}
//       </Text>
//       <View style={styles.confirmDetails}>
//         <Text style={styles.confirmDetailLabel}>Amount:</Text>
//         <Text style={styles.confirmDetailValue}>₦{newExpense.amount.toLocaleString()}</Text>
        
//         <Text style={styles.confirmDetailLabel}>Category:</Text>
//         <Text style={styles.confirmDetailValue}>{newExpense.category}</Text>
        
//         <Text style={styles.confirmDetailLabel}>Description:</Text>
//         <Text style={styles.confirmDetailValue}>{newExpense.description}</Text>
//       </View>
      
//       <View style={styles.confirmButtonContainer}>
//         <Pressable
//           style={[styles.confirmButton, styles.confirmCancelButton]}
//           onPress={() => setShowConfirmModal(false)}
//         >
//           <Text style={styles.confirmButtonText}>Cancel</Text>
//         </Pressable>
//         <Pressable
//           style={[styles.confirmButton, styles.confirmSubmitButton]}
//           onPress={handleAddExpense}
//           disabled={isSavingExpense}
//         >
//           {isSavingExpense ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.confirmButtonText}>
//               {editingExpense ? 'Update' : 'Confirm'}
//             </Text>
//           )}
//         </Pressable>
//       </View>
//     </View>
//   </View>
// </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//   },
//   header: {
//     marginBottom: 24,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#111827',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   financialSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   summaryCard: {
//     flex: 1,
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   cardAmount: {
//     color: 'white',
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   addButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 16,
//     alignSelf: 'flex-start',
//     marginTop: 4,
//   },
//   addButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   segmentControl: {
//     marginBottom: 20,
//     height: 40,
//   },
//   chartNavContainer: {
//     paddingBottom: 12,
//   },
//   chartNavButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#FFFFFF',
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   chartNavButtonActive: {
//     backgroundColor: '#F3F4F6',
//     borderColor: '#D1D5DB',
//   },
//   chartNavText: {
//     marginLeft: 8,
//     color: '#6B7280',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   chartNavTextActive: {
//     color: '#111827',
//   },
//   chartContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     minHeight: 400,
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   chartPlaceholder: {
//     height: 300,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pieChartContainer: {
//     alignItems: 'center',
//     height: chartSize*1.6,
//     justifyContent: 'center',
//   },
//   pieCenterLabel: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pieCenterText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   analyticsCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   analyticsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 16,
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 16,
//     justifyContent: 'center',
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//     marginBottom: 8,
//   },
//   legendColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   legendText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   legendValue: {
//     fontWeight: 'bold',
//     color: '#111827',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 16,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   statCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     flex: 1,
//     marginHorizontal: 4,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#111827',
//     textAlign: 'center',
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 8,
//     marginTop: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 8,
//   },
//   categoryButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: '#F3F4F6',
//   },
//   categoryButtonSelected: {
//     backgroundColor: '#3B82F6',
//     borderColor: '#3B82F6',
//   },
//   categoryButtonText: {
//     color: '#6B7280',
//     fontSize: 14,
//   },
//   categoryButtonTextSelected: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   modalButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 24,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#F3F4F6',
//     marginRight: 8,
//   },
//   submitButton: {
//     backgroundColor: '#3B82F6',
//     marginLeft: 8,
//   },
//   modalButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
  
//   legendRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   expenseListContainer: {
//     marginBottom: 20,
//   },
//   expenseItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   expenseItemLeft: {
//     flex: 1,
//   },
//   expenseItemRight: {
//     alignItems: 'flex-end',
//   },
//   expenseCategory: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   expenseDescription: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   expenseVehicle: {
//     fontSize: 11,
//     color: '#6B7280',
//     fontStyle: 'italic',
//   },
//   expenseAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   expenseDate: {
//     fontSize: 10,
//     color: '#6B7280',
//   },
//   confirmModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   confirmModalContent: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     width: '90%',
//     maxWidth: 400,
//   },
//   confirmModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   confirmModalText: {
//     fontSize: 16,
//     color: '#6B7280',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   confirmDetails: {
//     marginBottom: 20,
//   },
//   confirmDetailLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginTop: 8,
//   },
//   confirmDetailValue: {
//     fontSize: 14,
//     color: '#111827',
//   },
//   confirmButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   confirmButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   confirmCancelButton: {
//     backgroundColor: '#F3F4F6',
//     marginRight: 8,
//   },
//   confirmSubmitButton: {
//     backgroundColor: '#3B82F6',
//     marginLeft: 8,
//   },
//   confirmButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   noDataContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noDataText: {
//     color: '#6B7280',
//     fontSize: 14,
//   },
//   revenueBreakdown: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 10,
//     marginTop: 4,
//   },
  
// });

// export default AnalyticsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, Pressable, Alert } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { collection, getDocs, query, where, getFirestore, addDoc, doc, updateDoc } from 'firebase/firestore';
import { app } from "../firebase";
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375; // iPhone 7 width is 375
const chartSize = isSmallDevice ? screenWidth * 0.85 : screenWidth * 0.7;
const legendWidth = isSmallDevice ? screenWidth * 0.4 : screenWidth * 0.3;

const db = getFirestore(app);

interface Shipment {
  createdAt: string;
  driverName: string;
  freightCost: number;
  mobileNumber: string;
  route: string;
  statusId: number;
  transporter: string;
  vehicleNo: string;
}

interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  vehicleNo?: string;
  createdAt: string;
}

const statusColors = {
  Completed: '#4CAF50',
  Pending: '#FF9800',
  Delayed: '#F44336',
};

const expenseCategories = ['Fuel', 'Maintenance', 'Tolls', 'Driver', 'Other'];

// Modern color palette
const chartColors = {
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  info: '#3B82F6', // Blue
  dark: '#1F2937', // Gray
  light: '#F3F4F6' // Light gray
};

const AnalyticsScreen: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [netRevenue, setNetRevenue] = useState<number>(0);
  const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
  const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
  const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
  const [expenseAnalysis, setExpenseAnalysis] = useState({
    byCategory: [] as { value: number; label: string; color: string }[],
    byVehicle: [] as { value: number; label: string; color: string }[],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [activeChart, setActiveChart] = useState<'routes' | 'vehicles' | 'status' | 'trend'>('routes');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'createdAt'>>({
    amount: 0,
    description: '',
    category: 'Fuel',
    date: new Date().toISOString().split('T')[0],
    vehicleNo: ''
  });
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [totalInvoiceRevenue, setTotalInvoiceRevenue] = useState<number>(0);
  const [showAllExpensesModal, setShowAllExpensesModal] = useState(false);
  const [selectedPieItem, setSelectedPieItem] = useState<{label: string, value: number} | null>(null);

  const { transporterName } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      fetchAnalyticsData();
    }, [timeFilter])
  );

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      // Fetch shipments
      const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', transporterName));
      const shipmentSnapshot = await getDocs(shipmentRef);
      const shipmentData = shipmentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt || '',
          driverName: data.driverName || '',
          freightCost: data.freightCost || 0,
          mobileNumber: data.mobileNumber || '',
          route: data.route || '',
          statusId: data.statusId || 0,
          transporter: data.transporter || '',
          vehicleNo: data.vehicleNo || ''
        } as Shipment;
      });
      setShipments(shipmentData);
  
      // Fetch invoice revenue
      const transporterQuery = query(collection(db, 'transporter'), where('name', '==', transporterName));
      const transporterSnapshot = await getDocs(transporterQuery);
      
      if (!transporterSnapshot.empty) {
        const transporterDocId = transporterSnapshot.docs[0].id;
        
        // Get all clients
        const clientsRef = collection(db, 'transporter', transporterDocId, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        
        let totalInvoiceRevenue = 0;
        
        // Fetch invoices from each client
        for (const clientDoc of clientsSnapshot.docs) {
          const invoicesRef = collection(db, 'transporter', transporterDocId, 'clients', clientDoc.id, 'invoices');
          const invoicesSnapshot = await getDocs(invoicesRef);
          
          invoicesSnapshot.forEach(invoiceDoc => {
            const invoice = invoiceDoc.data();
            const invoiceRevenue = (Number(invoice.subtotal) || 0) + (Number(invoice.totalVat) || 0);
            totalInvoiceRevenue += invoiceRevenue;
          });
        }
        
        setTotalInvoiceRevenue(totalInvoiceRevenue);
  
        // Fetch expenses
        const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
        const expenseSnapshot = await getDocs(expenseRef);
        
        const expenseData = expenseSnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = new Date().toISOString();
          
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              createdAt = data.createdAt;
            }
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt
          } as Expense;
        });
        
        // Calculate totals
        const totalFreightRevenue = shipmentData.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
        const totalRevenue = totalInvoiceRevenue;
        const totalExp = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        // Update state
        setTotalFreightRevenue(totalFreightRevenue);
        setExpenses(expenseData);
        setTotalExpenses(totalExp);
        setNetRevenue(totalRevenue - totalExp);

        // Analyze expenses
        const byCategory: Record<string, number> = {};
        const byVehicle: Record<string, number> = {};
        
        expenseData.forEach(expense => {
          // By category
          byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
          
          // By vehicle
          if (expense.vehicleNo) {
            byVehicle[expense.vehicleNo] = (byVehicle[expense.vehicleNo] || 0) + expense.amount;
          }
        });

        setExpenseAnalysis({
          byCategory: Object.keys(byCategory).map(category => ({
            value: byCategory[category],
            label: category,
            color: getCategoryColor(category)
          })),
          byVehicle: Object.keys(byVehicle).map(vehicle => ({
            value: byVehicle[vehicle],
            label: vehicle,
            color: getVehicleColor(vehicle)
          }))
        });

        // Shipment analytics
        const routeCounts: Record<string, number> = {};
        shipmentData.forEach(({ route }) => {
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
        
        setRouteFrequency(
          Object.keys(routeCounts).map(route => ({
            value: Number(routeCounts[route]) || 0,
            label: route
          }))
        );

        const vehicleCounts: Record<string, number> = {};
        shipmentData.forEach(({ vehicleNo }) => {
          vehicleCounts[vehicleNo] = (vehicleCounts[vehicleNo] || 0) + 1;
        });
        
        setVehicleUsage(
          Object.keys(vehicleCounts).map(vehicle => ({
            value: Number(vehicleCounts[vehicle]) || 0,
            label: vehicle
          }))
        );
        
        const statusCounts = { 'Completed': 0, 'Pending': 0, 'Delayed': 0 };
        shipmentData.forEach(({ statusId }) => {
          if (statusId === 4) statusCounts['Completed']++;
          else if (statusId <=3) statusCounts['Pending']++;
          else statusCounts['Delayed']++;
        });
        
        setStatusData([
          { value: statusCounts['Completed'], color: statusColors.Completed, label: 'Completed' },
          { value: statusCounts['Pending'], color: statusColors.Pending, label: 'Pending' },
          { value: statusCounts['Delayed'], color: statusColors.Delayed, label: 'Delayed' },
        ]);

        // Trend data
        const filteredData = shipmentData.filter(({ createdAt }) => {
          const date = new Date(createdAt);
          const now = new Date();
          if (timeFilter === 'week') {
            return date >= new Date(now.setDate(now.getDate() - 7));
          } else if (timeFilter === 'month') {
            return date >= new Date(now.setMonth(now.getMonth() - 1));
          }
          return true;
        });
        
        const revenueTrend: Record<string, number> = {};
        filteredData.forEach(({ createdAt, freightCost }) => {
          const dateLabel = new Date(createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          revenueTrend[dateLabel] = (revenueTrend[dateLabel] || 0) + freightCost;
        });
        
        setTrendData(
          Object.keys(revenueTrend).map(date => ({
            value: Number(revenueTrend[date]) || 0,
            label: date
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fuel': chartColors.warning,
      'Maintenance': chartColors.danger,
      'Tolls': chartColors.info,
      'Driver': chartColors.success,
      'Other': chartColors.secondary
    };
    return colors[category] || chartColors.dark;
  };

  const getVehicleColor = (vehicle: string) => {
    const hash = vehicle.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
  };

  const handleAddExpense = async () => {
    try {
      setIsSavingExpense(true);
      if (!newExpense.amount || !newExpense.description) {
        alert('Please fill all required fields');
        return;
      }

      const transporterQuery = query(
        collection(db, 'transporter'),
        where('name', '==', transporterName)
      );
      const transporterSnapshot = await getDocs(transporterQuery);
      
      if (transporterSnapshot.empty) {
        throw new Error('Transporter not found');
      }

      const transporterDocId = transporterSnapshot.docs[0].id;
      const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
      
      if (editingExpense && editingExpense.id) {
        await updateDoc(doc(expenseRef, editingExpense.id), {
          amount: Number(newExpense.amount),
          description: newExpense.description,
          category: newExpense.category,
          date: new Date(newExpense.date).toISOString(),
          vehicleNo: newExpense.vehicleNo
        });
      } else {
        await addDoc(expenseRef, {
          ...newExpense,
          amount: Number(newExpense.amount),
          date: new Date(newExpense.date).toISOString(),
          createdAt: new Date().toISOString()
        });
      }

      setShowAddExpenseModal(false);
      setShowConfirmModal(false);
      setEditingExpense(null);
      setNewExpense({
        amount: 0,
        description: '',
        category: 'Fuel',
        date: new Date().toISOString().split('T')[0],
        vehicleNo: ''
      });
      
      fetchAnalyticsData();
      Alert.alert('Success', `Expense ${editingExpense ? 'updated' : 'added'} successfully!`);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      alert(`Failed to add expense: ${error.message}`);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date.split('T')[0],
      vehicleNo: expense.vehicleNo || ''
    });
    setShowAddExpenseModal(true);
  };

  const handlePiePress = (item: {label: string, value: number}) => {
    setSelectedPieItem(item);
    Alert.alert(
      `${item.label}`,
      `Count: ${item.value}\nPercentage: ${Math.round((item.value / statusData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%`,
      [{ text: 'OK', onPress: () => setSelectedPieItem(null) }]
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="large" color={chartColors.primary} />
        </View>
      );
    }

    switch (activeChart) {
      case 'routes':
        return (
          <View style={{ width: chartSize }}>
            <BarChart 
              data={routeFrequency} 
              barWidth={isSmallDevice ? 30 : 40} 
              spacing={isSmallDevice ? 20 : 30} 
              showValuesAsTopLabel 
              isAnimated 
              animationDuration={1000}
              onPress={(item) => Alert.alert(`${item.label}`, `${item.value} trips`)}
              barBorderRadius={6}
              frontColor={chartColors.primary}
              gradientColor={chartColors.secondary}
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={4}
              yAxisTextStyle={{ color: chartColors.dark, fontSize: isSmallDevice ? 10 : 12 }}
              xAxisLabelTextStyle={{ 
                color: chartColors.dark, 
                textAlign: 'center', 
                fontSize: isSmallDevice ? 10 : 12,
                width: isSmallDevice ? 60 : 80 
              }}
              labelWidth={isSmallDevice ? 60 : 80}
              topLabelComponentStyle={{ color: chartColors.primary }}
              barStyle={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />
          </View>
        );
      case 'vehicles':
        return (
          <BarChart 
            data={vehicleUsage} 
            barWidth={isSmallDevice ? 30 : 40} 
            spacing={isSmallDevice ? 20 : 30} 
            showValuesAsTopLabel 
            isAnimated
            animationDuration={1000}
            onPress={(item) => Alert.alert(`${item.label}`, `${item.value} times used`)}
            barBorderRadius={6}
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            yAxisTextStyle={{ color: chartColors.dark, fontSize: isSmallDevice ? 10 : 12 }}
            xAxisLabelTextStyle={{ 
              color: chartColors.dark, 
              textAlign: 'center',
              fontSize: isSmallDevice ? 10 : 12 
            }}
            labelWidth={isSmallDevice ? 60 : 80}
            frontColor={chartColors.info}
            gradientColor={chartColors.primary}
            topLabelComponentStyle={{ color: chartColors.info }}
            barStyle={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          />
        );
      case 'status':
        return (
          <View style={styles.pieChartContainer}>
            <View style={{ 
              width: chartSize, 
              height: chartSize, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: isSmallDevice ? 20 : 0
            }}>
              <PieChart 
                data={statusData} 
                showValuesAsLabels 
                showText 
                textColor='white' 
                textSize={isSmallDevice ? 12 : 16} 
                fontWeight='bold' 
                showExternalLabels 
                donut 
                radius={chartSize / (isSmallDevice ? 2.5 : 2) - 20} 
                onPress={(item, index) => handlePiePress(item)}
                centerLabelComponent={() => (
                  <View style={styles.pieCenterLabel}>
                    <Text style={[styles.pieCenterText, { fontSize: isSmallDevice ? 12 : 14 }]}>
                      {selectedPieItem ? `${selectedPieItem.label}` : 'Status'}
                    </Text>
                    {selectedPieItem && (
                      <Text style={[styles.pieCenterText, { fontSize: isSmallDevice ? 10 : 12 }]}>
                        {selectedPieItem.value}
                      </Text>
                    )}
                  </View>
                )}
                focusOnPress
                selectedIndex={selectedPieItem ? statusData.findIndex(item => item.label === selectedPieItem.label) : undefined}
                innerRadius={60}
              />
            </View>
            <View style={[styles.legendContainer, { 
              flexDirection: isSmallDevice ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: isSmallDevice ? 'flex-start' : 'center'
            }]}>
              {statusData.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.legendRow}
                  onPress={() => handlePiePress(item)}
                >
                  <View style={[styles.legendColor, { 
                    backgroundColor: item.color,
                    opacity: selectedPieItem ? (selectedPieItem.label === item.label ? 1 : 0.5) : 1
                  }]} />
                  <Text style={[styles.legendText, { 
                    fontSize: isSmallDevice ? 12 : 14,
                    color: selectedPieItem ? (selectedPieItem.label === item.label ? chartColors.dark : '#9CA3AF') : chartColors.dark
                  }]}>
                    {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'trend':
        return (
          <LineChart 
            data={trendData} 
            color={chartColors.secondary} 
            curved 
            thickness={3} 
            isAnimated 
            animationDuration={1200}
            hideDataPoints 
            onPress={(item) => Alert.alert(`Revenue on ${item.label}`, `₦${item.value.toLocaleString()}`)}
            adjustToWidth
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            yAxisTextStyle={{ color: chartColors.dark, fontSize: isSmallDevice ? 10 : 12 }}
            xAxisLabelTextStyle={{ 
              color: chartColors.dark, 
              textAlign: 'center',
              fontSize: isSmallDevice ? 10 : 12 
            }}
            areaChart
            startFillColor={`${chartColors.secondary}20`}
            startOpacity={0.2}
            endFillColor={`${chartColors.secondary}10`}
            endOpacity={0.1}
            spacing={isSmallDevice ? 30 : 50}
            dataPointsColor={chartColors.secondary}
            dataPointsRadius={5}
            textColor={chartColors.dark}
            textFontSize={12}
          />
        );
      default:
        return null;
    }
  };

  const renderAllExpensesModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showAllExpensesModal}
      onRequestClose={() => setShowAllExpensesModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.fullExpensesModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Expenses</Text>
            <TouchableOpacity onPress={() => setShowAllExpensesModal(false)}>
              <MaterialIcons name="close" size={24} color={chartColors.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {expenses.map((expense) => (
              <TouchableOpacity 
                key={expense.id} 
                style={styles.expenseItem}
                onPress={() => {
                  handleEditExpense(expense);
                  setShowAllExpensesModal(false);
                }}
              >
                <View style={styles.expenseItemLeft}>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  {expense.vehicleNo && (
                    <Text style={styles.expenseVehicle}>Vehicle: {expense.vehicleNo}</Text>
                  )}
                </View>
                <View style={styles.expenseItemRight}>
                  <Text style={styles.expenseAmount}>₦{expense.amount.toLocaleString()}</Text>
                  <Text style={styles.expenseDate}>
                    {new Date(expense.date).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={fetchAnalyticsData} 
          tintColor={chartColors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>{transporterName}</Text>
      </View>

      {/* Financial Summary Cards - Always column on small devices */}
      <View style={[styles.financialSummary, isSmallDevice && { flexDirection: 'column' }]}>
        {/* Revenue Card */}
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          style={[styles.summaryCard, isSmallDevice && { width: '100%', marginBottom: 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="attach-money" size={20} color="white" />
            <Text style={styles.cardTitle}>Total Revenue</Text>
          </View>
          <Text style={styles.cardAmount}>₦{(totalInvoiceRevenue).toLocaleString()}</Text>
        </LinearGradient>

        {/* Expenses Card */}
        <LinearGradient
          colors={['#EF4444', '#F87171']}
          style={[styles.summaryCard, isSmallDevice && { width: '100%', marginBottom: 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="money-off" size={20} color="white" />
            <Text style={styles.cardTitle}>Total Expenses</Text>
          </View>
          <Text style={styles.cardAmount}>₦{totalExpenses.toLocaleString()}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddExpenseModal(true)}
          >
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Net Revenue Card */}
        <LinearGradient
          colors={['#10B981', '#34D399']}
          style={[styles.summaryCard, isSmallDevice && { width: '100%' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="account-balance" size={20} color="white" />
            <Text style={styles.cardTitle}>Net Profit</Text>
          </View>
          <Text style={styles.cardAmount}>₦{netRevenue.toLocaleString()}</Text>
        </LinearGradient>
      </View>

      {/* Time Filter */}
      <SegmentedControl
        values={['Week', 'Month', 'All']}
        selectedIndex={timeFilter === 'week' ? 0 : timeFilter === 'month' ? 1 : 2}
        onChange={(event) => {
          const index = event.nativeEvent.selectedSegmentIndex;
          setTimeFilter(index === 0 ? 'week' : index === 1 ? 'month' : 'all');
        }}
        style={styles.segmentControl}
        tintColor="#F3F4F6"
        backgroundColor="#FFFFFF"
        activeFontStyle={{ color: '#111827', fontWeight: '600' }}
        fontStyle={{ color: '#6B7280' }}
      />

      {/* Chart Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartNavContainer}
      >
        <TouchableOpacity 
          style={[styles.chartNavButton, activeChart === 'routes' && styles.chartNavButtonActive]}
          onPress={() => setActiveChart('routes')}
        >
          <MaterialIcons 
            name="map" 
            size={20} 
            color={activeChart === 'routes' ? chartColors.primary : '#6B7280'} 
          />
          <Text style={[styles.chartNavText, activeChart === 'routes' && styles.chartNavTextActive]}>
            Routes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chartNavButton, activeChart === 'vehicles' && styles.chartNavButtonActive]}
          onPress={() => setActiveChart('vehicles')}
        >
          <MaterialIcons 
            name="directions-car" 
            size={20} 
            color={activeChart === 'vehicles' ? chartColors.success : '#6B7280'} 
          />
          <Text style={[styles.chartNavText, activeChart === 'vehicles' && styles.chartNavTextActive]}>
            Vehicles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chartNavButton, activeChart === 'status' && styles.chartNavButtonActive]}
          onPress={() => setActiveChart('status')}
        >
          <MaterialIcons 
            name="pie-chart" 
            size={20} 
            color={activeChart === 'status' ? chartColors.secondary : '#6B7280'} 
          />
          <Text style={[styles.chartNavText, activeChart === 'status' && styles.chartNavTextActive]}>
            Status
          </Text>
        </TouchableOpacity>

       
      </ScrollView>

      {/* Chart Container */}
      <View style={[styles.chartContainer, { minHeight: isSmallDevice ? 320 : 400 }]}>
        {renderChart()}
      </View>

      {/* Expense Analytics Section */}
      <Text style={styles.sectionTitle}>Expense Analytics</Text>
      
      {/* Expenses by Category */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Expenses by Category</Text>
        <View style={{ 
          flexDirection: isSmallDevice ? 'column' : 'row', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <PieChart
            data={expenseAnalysis.byCategory}
            donut
            showText
            textColor="white"
            radius={isSmallDevice ? 70 : 80}
            innerRadius={isSmallDevice ? 40 : 50}
            textSize={isSmallDevice ? 10 : 12}
            centerLabelComponent={() => (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: isSmallDevice ? 12 : 14, color: chartColors.dark }}>Categories</Text>
              </View>
            )}
            onPress={(item, index) => Alert.alert(
              `${item.label}`, 
              `Amount: ₦${item.value.toLocaleString()}`
            )}
            focusOnPress
            innerRadius={isSmallDevice ? 30 : 40}
          />
          <View style={[styles.legendContainer, { 
            flex: 1,
            flexDirection: 'column',
            alignItems: isSmallDevice ? 'center' : 'flex-start'
          }]}>
            {expenseAnalysis.byCategory.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.legendItem}
                onPress={() => Alert.alert(
                  `${item.label}`, 
                  `Amount: ₦${item.value.toLocaleString()}`
                )}
              >
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { fontSize: isSmallDevice ? 12 : 14 }]}>
                  {item.label}: ₦{item.value.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Expenses by Vehicle */}
      {expenseAnalysis.byVehicle.length > 0 && (
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Expenses by Vehicle</Text>
          <BarChart
            data={expenseAnalysis.byVehicle}
            barBorderRadius={6}
            barWidth={isSmallDevice ? 60 : 80}
            spacing={isSmallDevice ? 15 : 20}
            //height={100}
            maxValue={120000}
            //initialSpacing={20}
            stepHeight={isSmallDevice ? 50 : 70}
            labelWidth={isSmallDevice ? 60 : 80}
            noOfSections={5}
            showValuesAsTopLabel
            isAnimated
            animationDuration={1500}
            gradientColor={chartColors.secondary}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: chartColors.dark, fontSize: isSmallDevice ? 10 : 12 }}
            xAxisLabelTextStyle={{ 
              color: chartColors.dark, 
              fontSize: isSmallDevice ? 10 : 12,
              width: isSmallDevice ? 60 : 80
            }}
            frontColor={chartColors.info}
            gradientColor={chartColors.primary}
            onPress={(item) => Alert.alert(
              `${item.label}`, 
              `Amount: ₦${item.value.toLocaleString()}`
            )}
            barStyle={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          />
        </View>
      )}

      {/* Recent Expenses Section */}
      <View style={styles.expenseListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.length > 3 && (
            <TouchableOpacity onPress={() => setShowAllExpensesModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {expenses.slice(0, 3).map((expense) => (
          <TouchableOpacity 
            key={expense.id} 
            style={styles.expenseItem}
            onPress={() => handleEditExpense(expense)}
          >
            <View style={styles.expenseItemLeft}>
              <Text style={styles.expenseCategory}>{expense.category}</Text>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              {expense.vehicleNo && (
                <Text style={styles.expenseVehicle}>Vehicle: {expense.vehicleNo}</Text>
              )}
            </View>
            <View style={styles.expenseItemRight}>
              <Text style={styles.expenseAmount}>₦{expense.amount.toLocaleString()}</Text>
              <Text style={styles.expenseDate}>
                {new Date(expense.date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Overview */}
      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={[styles.statsContainer, isSmallDevice && { flexDirection: 'column' }]}>
        <View style={[styles.statCard, isSmallDevice && { width: '100%', marginBottom: 10 }]}>
          <Text style={styles.statValue}>{shipments.length}</Text>
          <Text style={styles.statLabel}>Total Shipments</Text>
        </View>
        <View style={[styles.statCard, isSmallDevice && { width: '100%', marginBottom: 10 }]}>
          <Text style={styles.statValue}>
            {statusData.reduce((acc, curr) => acc + curr.value, 0) > 0 
              ? `${Math.round((statusData.find(s => s.label === 'Completed')?.value || 0) / 
                 statusData.reduce((acc, curr) => acc + curr.value, 0) * 100)}%`
              : '0%'}
          </Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
        <View style={[styles.statCard, isSmallDevice && { width: '100%' }]}>
          <Text style={styles.statValue}>{vehicleUsage.length}</Text>
          <Text style={styles.statLabel}>Active Vehicles</Text>
        </View>
      </View>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddExpenseModal}
        onRequestClose={() => {setShowAddExpenseModal(false); setEditingExpense(null);}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </Text>
            
            <Text style={styles.inputLabel}>Amount (₦)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={newExpense.amount.toString()}
              onChangeText={(text) => setNewExpense({...newExpense, amount: Number(text) || 0})}
            />
            
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this expense for?"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({...newExpense, description: text})}
            />
            
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {expenseCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    newExpense.category === cat && styles.categoryButtonSelected
                  ]}
                  onPress={() => setNewExpense({...newExpense, category: cat})}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    newExpense.category === cat && styles.categoryButtonTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Vehicle (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Vehicle number if applicable"
              value={newExpense.vehicleNo}
              onChangeText={(text) => setNewExpense({...newExpense, vehicleNo: text})}
            />
            
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newExpense.date}
              onChangeText={(text) => setNewExpense({...newExpense, date: text})}
            />
            
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddExpenseModal(false);
                  setEditingExpense(null);
                }}
                disabled={isSavingExpense}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => setShowConfirmModal(true)}
                disabled={isSavingExpense}
              >
                {isSavingExpense ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    {editingExpense ? 'Update' : 'Save'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Expense Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Confirm Expense</Text>
            <Text style={styles.confirmModalText}>
              {`Are you sure you want to ${editingExpense ? 'update' : 'add'} this expense?`}
            </Text>
            <View style={styles.confirmDetails}>
              <Text style={styles.confirmDetailLabel}>Amount:</Text>
              <Text style={styles.confirmDetailValue}>₦{newExpense.amount.toLocaleString()}</Text>
              
              <Text style={styles.confirmDetailLabel}>Category:</Text>
              <Text style={styles.confirmDetailValue}>{newExpense.category}</Text>
              
              <Text style={styles.confirmDetailLabel}>Description:</Text>
              <Text style={styles.confirmDetailValue}>{newExpense.description}</Text>
            </View>
            
            <View style={styles.confirmButtonContainer}>
              <Pressable
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.confirmSubmitButton]}
                onPress={handleAddExpense}
                disabled={isSavingExpense}
              >
                {isSavingExpense ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {editingExpense ? 'Update' : 'Confirm'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* All Expenses Modal */}
      {renderAllExpensesModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  financialSummary: {
    flexDirection: screenWidth <= 375 ? 'column' : 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardAmount: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  segmentControl: {
    marginBottom: 20,
    height: 40,
  },
  chartNavContainer: {
    paddingBottom: 12,
  },
  chartNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  chartNavButtonActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartNavText: {
    marginLeft: 8,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  chartNavTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterText: {
    color: '#1F2937',
    textAlign: 'center',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  legendContainer: {
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
    borderRadius: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#6B7280',
  },
  legendValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fullExpensesModalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    width:'90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6969',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  expenseListContainer: {
    marginBottom: 20,
  },
  expenseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  expenseItemLeft: {
    flex: 1,
  },
  expenseItemRight: {
    alignItems: 'flex-end',
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  expenseVehicle: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmDetails: {
    marginBottom: 20,
  },
  confirmDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  confirmDetailValue: {
    fontSize: 14,
    color: '#111827',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#FF6969',
    marginRight: 8,
  },
  confirmSubmitButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AnalyticsScreen;

