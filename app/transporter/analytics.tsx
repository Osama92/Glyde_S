// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
// import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
// import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
// import { app } from "../firebase";
// import { useFocusEffect } from '@react-navigation/native';
// import { useLocalSearchParams } from 'expo-router';

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

// const AnalyticsScreen: React.FC<{ transporter: string }> = ({ transporter }) => {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
//   const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
//   const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
//   const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
//   const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');


//   const {transporterName} = useLocalSearchParams();

//   useFocusEffect(
//     useCallback(() => {
//       fetchAnalyticsData();
//     }, [timeFilter])
//   );

//   const fetchAnalyticsData = async () => {
//     setRefreshing(true);
//     const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', transporterName));
//     const snapshot = await getDocs(shipmentRef);
//     const data = snapshot.docs.map(doc => doc.data() as Shipment);
//     setShipments(data);

//     // Total Freight Revenue
//     const totalRevenue = data.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
//     setTotalFreightRevenue(totalRevenue);

//     // Route Frequency
//     const routeCounts: Record<string, number> = {};
//     data.forEach(({ route }) => {
//       routeCounts[route] = (routeCounts[route] || 0) + 1;
//     });
    
//     setRouteFrequency(
//       Object.keys(routeCounts).map(route => ({
//         value: Number(routeCounts[route]) || 0,
//         label: route
//       }))
//     );
    

//     // Vehicle Utilization
//     const vehicleCounts: Record<string, number> = {};
//     data.forEach(({ vehicleNo }) => {
//       vehicleCounts[vehicleNo] = (vehicleCounts[vehicleNo] || 0) + 1;
//     });
    
//     setVehicleUsage(
//       Object.keys(vehicleCounts).map(vehicle => ({
//         value: Number(vehicleCounts[vehicle]) || 0,
//         label: vehicle
//       }))
//     );
    
//     // Delivery Status
//     const statusCounts = { 'Completed': 0, 'Pending': 0, 'Delayed': 0 };
//     data.forEach(({ statusId }) => {
//       if (statusId === 1) statusCounts['Completed']++;
//       else if (statusId === 0) statusCounts['Pending']++;
//       else statusCounts['Delayed']++;
//     });
//     setStatusData([
//       { value: statusCounts['Completed'], color: '#4CAF50', label: 'Completed' },
//       { value: statusCounts['Pending'], color: '#FF9800', label: 'Pending' },
//       { value: statusCounts['Delayed'], color: '#F44336', label: 'Delayed' },
//     ]);

//     // Trend Analysis
//     const filteredData = data.filter(({ createdAt }) => {
//       const date = new Date(createdAt);
//       const now = new Date();
//       if (timeFilter === 'week') {
//         return date >= new Date(now.setDate(now.getDate() - 7));
//       } else if (timeFilter === 'month') {
//         return date >= new Date(now.setMonth(now.getMonth() - 1));
//       }
//       return true;
//     });
//     const revenueTrend: Record<string, number> = {};
//     filteredData.forEach(({ createdAt, freightCost }) => {
//       const dateLabel = new Date(createdAt).toLocaleDateString();
//       revenueTrend[dateLabel] = (revenueTrend[dateLabel] || 0) + freightCost;
//     });
    
//     setTrendData(
//       Object.keys(revenueTrend).map(date => ({
//         value: Number(revenueTrend[date]) || 0,
//         label: date
//       }))
//     );
    
//     setRefreshing(false);
//   };

//   return (
//     <ScrollView style={{ padding: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAnalyticsData} />}>
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop:20 }}>Analytics</Text>

//       <View style={{width:'100%', height: 130, backgroundColor:'lightgrey', borderRadius:15, marginTop:10}}>
//       <Text style={{ marginTop: 20, fontWeight: '600', marginLeft:15 }}>Total Freight Revenue</Text>
//       <Text style={{ marginTop: 10, fontWeight: '600', marginLeft:15, fontSize: 50 }}>₦{totalFreightRevenue.toLocaleString()}.00</Text>
//       </View>
      
//       {/* Filter Options */}
//       <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
//         {['week', 'month', 'all'].map(filter => (
//           <TouchableOpacity key={filter} onPress={() => setTimeFilter(filter as 'week' | 'month' | 'all')}>
//             <Text style={{ padding: 10, color: timeFilter === filter ? 'blue' : 'black' }}>{filter.toUpperCase()}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
      
     

//       <Text style={{ marginTop: 20 }}>Route Frequency</Text>
//       <BarChart data={routeFrequency} barWidth={100} spacing={15} showValuesAsTopLabel isAnimated onPress={(item) => alert(`${item.label}: ${item.value} trips`)} />

//       <Text style={{ marginTop: 20 }}>Vehicle Utilization</Text>
//       <BarChart data={vehicleUsage} barWidth={100} spacing={15} showValuesAsTopLabel isAnimated onPress={(item) => alert(`${item.label}: ${item.value} times used`)} />
      
//       <Text style={{ marginTop: 20 }}>Delivery Status Distribution</Text>
//       <PieChart data={statusData} showValuesAsLabels showText textColor='white' textSize={20} fontWeight='bold' showExternalLabels donut radius={130} onPress={(item) => alert(`${item.label}: ${item.value}`)} />
      
//       <Text style={{ marginTop: 20 }}>Revenue Trend</Text>
//       <LineChart data={trendData} color='#2196F3' curved thickness={3} isAnimated hideDataPoints onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value}`)} adjustToWidth/>
     
//     </ScrollView>
//   );
// };

// export default AnalyticsScreen;


// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, Pressable } from 'react-native';
// import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
// import { collection, getDocs, query, where, getFirestore, addDoc } from 'firebase/firestore';
// import { app } from "../firebase";
// import { useFocusEffect } from '@react-navigation/native';
// import { useLocalSearchParams } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import SegmentedControl from '@react-native-segmented-control/segmented-control';

// const { width: screenWidth } = Dimensions.get('window');
// const chartSize = screenWidth * 0.6; // Takes 60% of screen width
// const legendWidth = screenWidth * 0.3; // Takes 30% of screen width

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

// const AnalyticsScreen: React.FC = () => {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
//   const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
//   const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
//   const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
//   const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
//   const [activeChart, setActiveChart] = useState<'routes' | 'vehicles' | 'status' | 'trend'>('routes');
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [totalExpenses, setTotalExpenses] = useState<number>(0);
//   const [netRevenue, setNetRevenue] = useState<number>(0);
//   const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
//   const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'createdAt'>>({
//     amount: 0,
//     description: '',
//     category: 'Fuel',
//     date: new Date().toISOString().split('T')[0],
//     vehicleNo: ''
//   });
//   const [expenseAnalysis, setExpenseAnalysis] = useState({
//     byCategory: [],
//     byVehicle: [],
//     revenueVsExpense: [],
//     monthlyTrend: []
//   });

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
      
//       const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', transporterName));
//       const snapshot = await getDocs(shipmentRef);
//       const data = snapshot.docs.map(doc => doc.data() as Shipment);
//       setShipments(data);

//       // Total Freight Revenue
//       const totalRevenue = data.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
//       setTotalFreightRevenue(totalRevenue);

      
//       // Fetch expenses from the correct transporter document
//       const transporterQuery = query(collection(db, 'transporter'), where('name', '==', transporterName));
//       const transporterSnapshot = await getDocs(transporterQuery);
      
//       if (!transporterSnapshot.empty) {
//         const transporterDocId = transporterSnapshot.docs[0].id;
//         const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
//         const expenseSnapshot = await getDocs(expenseRef);
//         const expenseData = expenseSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
//         })) as Expense[];
        
//         setExpenses(expenseData);
//         const totalExp = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
//         setTotalExpenses(totalExp);
//         setNetRevenue(totalRevenue - totalExp);

//         // Perform expense analysis
//         const analysis: any = analyzeExpenses(expenseData, data);
//         setExpenseAnalysis(analysis);
//       }

//       // Route Frequency
//       const routeCounts: Record<string, number> = {};
//       data.forEach(({ route }) => {
//         routeCounts[route] = (routeCounts[route] || 0) + 1;
//       });
      
//       setRouteFrequency(
//         Object.keys(routeCounts).map(route => ({
//           value: Number(routeCounts[route]) || 0,
//           label: route
//         }))
//       );

//       // Vehicle Utilization
//       const vehicleCounts: Record<string, number> = {};
//       data.forEach(({ vehicleNo }) => {
//         vehicleCounts[vehicleNo] = (vehicleCounts[vehicleNo] || 0) + 1;
//       });
      
//       setVehicleUsage(
//         Object.keys(vehicleCounts).map(vehicle => ({
//           value: Number(vehicleCounts[vehicle]) || 0,
//           label: vehicle
//         }))
//       );
      
//       // Delivery Status
//       const statusCounts = { 'Completed': 0, 'Pending': 0, 'Delayed': 0 };
//       data.forEach(({ statusId }) => {
//         if (statusId === 4) statusCounts['Completed']++;
//         else if (statusId <=3) statusCounts['Pending']++;
//         else statusCounts['Delayed']++;
//       });
//       setStatusData([
//         { value: statusCounts['Completed'], color: statusColors.Completed, label: 'Completed' },
//         { value: statusCounts['Pending'], color: statusColors.Pending, label: 'Pending' },
//         { value: statusCounts['Delayed'], color: statusColors.Delayed, label: 'Delayed' },
//       ]);

//       // Trend Analysis
//       const filteredData = data.filter(({ createdAt }) => {
//         const date = new Date(createdAt);
//         const now = new Date();
//         if (timeFilter === 'week') {
//           return date >= new Date(now.setDate(now.getDate() - 7));
//         } else if (timeFilter === 'month') {
//           return date >= new Date(now.setMonth(now.getMonth() - 1));
//         }
//         return true;
//       });

      
//       const revenueTrend: Record<string, number> = {};
//       filteredData.forEach(({ createdAt, freightCost }) => {
//         const dateLabel = new Date(createdAt).toLocaleDateString('en-US', {
//           month: 'short',
//           day: 'numeric'
//         });
//         revenueTrend[dateLabel] = (revenueTrend[dateLabel] || 0) + freightCost;
//       });
      
//       setTrendData(
//         Object.keys(revenueTrend).map(date => ({
//           value: Number(revenueTrend[date]) || 0,
//           label: date
//         }))
//       );
//     } catch (error) {
//       console.error('Error fetching analytics data:', error);
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   const analyzeExpenses = (expenseData: Expense[], shipmentData: Shipment[]) => {
//     const byCategory: Record<string, number> = {};
//     const byVehicle: Record<string, number> = {};
//     const revenueVsExpense: any[] = [];
//     const monthlyTrend: Record<string, number> = {};
    
//     // Process expenses
//     expenseData.forEach(expense => {
//       // By category
//       byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
      
//       // By vehicle (if specified)
//       if (expense.vehicleNo) {
//         byVehicle[expense.vehicleNo] = (byVehicle[expense.vehicleNo] || 0) + expense.amount;
//       }
      
//       // Monthly trend (group by month)
//       const expenseDate = new Date(expense.createdAt);
//       const monthYear = expenseDate.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short'
//       });
//       monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + expense.amount;
//     });
    
//     // Process revenue by month for comparison
//     const revenueByMonth: Record<string, number> = {};
//     shipmentData.forEach(shipment => {
//       const shipmentDate = new Date(shipment.createdAt);
//       const monthYear = shipmentDate.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short'
//       });
//       revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + shipment.freightCost;
//     });
    
//     // Combine monthly data for comparison chart
//     const allMonths = new Set([
//       ...Object.keys(monthlyTrend),
//       ...Object.keys(revenueByMonth)
//     ]);
    
//     Array.from(allMonths).forEach(month => {
//       revenueVsExpense.push({
//         month,
//         revenue: revenueByMonth[month] || 0,
//         expense: monthlyTrend[month] || 0,
//         profit: (revenueByMonth[month] || 0) - (monthlyTrend[month] || 0)
//       });
//     });
    
//     // Sort by date
//     revenueVsExpense.sort((a, b) => {
//       return new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime();
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
//       revenueVsExpense,
//       monthlyTrend: Object.keys(monthlyTrend).map(month => ({
//         value: monthlyTrend[month],
//         label: month
//       }))
//     };
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

//   // Modified handleAddExpense function
// const handleAddExpense = async () => {
//   try {
//     if (!newExpense.amount || !newExpense.description) {
//       alert('Please fill all required fields');
//       return;
//     }

//     const transporterQuery = query(
//       collection(db, 'transporter'),
//       where('name', '==', transporterName)
//     );
//     const transporterSnapshot = await getDocs(transporterQuery);
    
//     if (transporterSnapshot.empty) {
//       throw new Error('Transporter not found');
//     }

//     const transporterDocId = transporterSnapshot.docs[0].id;
//     const expenseRef = collection(db, 'transporter', transporterDocId, 'Expenses');
    
//     await addDoc(expenseRef, {
//       ...newExpense,
//       amount: Number(newExpense.amount),
//       date: new Date(newExpense.date).toISOString(),
//       createdAt: new Date().toISOString() // Add creation timestamp
//     });

//     // Reset and close modal
//     setShowAddExpenseModal(false);
//     setNewExpense({
//       amount: 0,
//       description: '',
//       category: 'Fuel',
//       date: new Date().toISOString().split('T')[0],
//       vehicleNo: ''
//     });
    
//     fetchAnalyticsData(); // Refresh data
//   } catch (error: any) {
//     console.error('Error adding expense:', error);
//     alert(`Failed to add expense: ${error.message}`);
//   }
// };

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
//           <View style={{width:chartSize}}>
//           <BarChart 
//             data={routeFrequency} 
//             barWidth={40} 
//             spacing={30} 
//             showValuesAsTopLabel 
//             isAnimated 
//             onPress={(item) => alert(`${item.label}: ${item.value} trips`)}
//             barBorderRadius={4}
//             frontColor="#3A82F6"
//             yAxisThickness={0}
//             xAxisThickness={0}
//             noOfSections={4}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center', width:'100%' }}
//             labelWidth={80}
//           />
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
//             frontColor="#10B981"
//             yAxisThickness={0}
//             xAxisThickness={0}
//             noOfSections={4}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
//             labelWidth={80}
//           />
//         );
//       case 'status':
//         return (
//           <View style={styles.pieChartContainer}>
//             <View style={{ width: chartSize, height: chartSize, justifyContent: 'center', alignItems: 'center' }}>
//             <PieChart 
//               data={statusData} 
//               showValuesAsLabels 
//               showText 
//               textColor='white' 
//               textSize={16} 
//               fontWeight='bold' 
//               showExternalLabels 
//               donut 
//               radius={chartSize/ 2- 20} 
//               onPress={(item) => alert(`${item.label}: ${item.value}`)}
//               centerLabelComponent={() => (
//                 <View style={styles.pieCenterLabel}>
//                   <Text style={styles.pieCenterText}>Status</Text>
//                 </View>
//               )}
//             />
//              <View style={styles.legendContainer}>
//         {statusData.map((item, index) => (
//           <View key={index} style={styles.legendRow}>
//             <View style={[styles.legendColor, { backgroundColor: item.color }]} />
//             <Text style={styles.legendText}>
//               {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
//             </Text>
//           </View>
//         ))}
//       </View>
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

//       {/* Revenue Card */}
//       <LinearGradient
//         colors={['#3A82F6', '#5D9DFF']}
//         style={styles.revenueCard}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//       >
//         <View style={styles.revenueHeader}>
//           <MaterialIcons name="attach-money" size={24} color="white" />
//           <Text style={styles.revenueTitle}>Total Freight Revenue</Text>
//         </View>
//         <Text style={styles.revenueAmount}>₦{totalFreightRevenue.toLocaleString()}</Text>
//         <View style={styles.revenueFooter}>
//           <Text style={styles.revenueTimeFilter}>
//             {timeFilter === 'week' ? 'Last 7 days' : 
//              timeFilter === 'month' ? 'Last 30 days' : 
//              'All time'}
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Expense and Net Revenue Cards */}
//       <View style={styles.expenseRow}>
//         <LinearGradient
//           colors={['#EF4444', '#F87171']}
//           style={[styles.revenueCard, styles.expenseCard]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.revenueHeader}>
//             <MaterialIcons name="money-off" size={24} color="white" />
//             <Text style={styles.revenueTitle}>Total Expenses</Text>
//           </View>
//           <Text style={styles.revenueAmount}>₦{totalExpenses.toLocaleString()}</Text>
//           <TouchableOpacity 
//             style={styles.addButton}
//             onPress={() => setShowAddExpenseModal(true)}
//           >
//             <Text style={styles.addButtonText}>Add Expense</Text>
//           </TouchableOpacity>
//         </LinearGradient>

//         <LinearGradient
//           colors={['#10B981', '#34D399']}
//           style={[styles.revenueCard, styles.netRevenueCard]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.revenueHeader}>
//             <MaterialIcons name="account-balance" size={24} color="white" />
//             <Text style={styles.revenueTitle}>Net Revenue</Text>
//           </View>
//           <Text style={styles.revenueAmount}>₦{netRevenue.toLocaleString()}</Text>
//           <View style={styles.revenueFooter}>
//             <Text style={styles.revenueTimeFilter}>
//               {timeFilter === 'week' ? 'Last 7 days' : 
//                timeFilter === 'month' ? 'Last 30 days' : 
//                'All time'}
//             </Text>
//           </View>
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
//       {/* Revenue vs Expenses Comparison */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Revenue vs Expenses</Text>
//         <BarChart
//           data={expenseAnalysis.revenueVsExpense.map((item, index) => ({
//             stacks: [
//               { value: item.revenue, color: '#3A82F6' },
//               { value: -item.expense, color: '#EF4444' }
//             ],
//             label: item.month
//           }))}
//           barWidth={30}
//           spacing={20}
//           xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
//           yAxisTextStyle={{ color: '#6B7280' }}
//           noOfSections={5}
//           showValuesAsTopLabel
//           topLabelTextStyle={{ color: '#111827', fontSize: 10 }}
//           height={200}
//           initialSpacing={10}
//         />
//         <View style={styles.legendContainer}>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#3A82F6' }]} />
//             <Text style={styles.legendText}>Revenue</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
//             <Text style={styles.legendText}>Expenses</Text>
//           </View>
//         </View>
//       </View>

//       {/* Expenses by Category */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Expenses by Category</Text>
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
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Expenses by Vehicle</Text>
//           <BarChart
//             data={expenseAnalysis.byVehicle}
//             barWidth={40}
//             spacing={20}
//             xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
//             yAxisTextStyle={{ color: '#6B7280' }}
//             noOfSections={5}
//             showValuesAsTopLabel
//             topLabelTextStyle={{ color: '#111827', fontSize: 10 }}
//             height={200}
//             initialSpacing={10}
//             barBorderRadius={4}
//             isAnimated
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

//       {/* Monthly Expense Trend */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Monthly Expense Trend</Text>
//         <LineChart
//           data={expenseAnalysis.monthlyTrend}
//           color="#EF4444"
//           thickness={3}
//           curved
//           isAnimated
//           hideDataPoints
//           yAxisThickness={0}
//           xAxisThickness={0}
//           noOfSections={4}
//           yAxisTextStyle={{ color: '#6B7280' }}
//           xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
//           areaChart
//           startFillColor="rgba(239, 68, 68, 0.1)"
//           startOpacity={0.1}
//           endFillColor="rgba(239, 68, 68, 0.05)"
//           endOpacity={0.05}
//           height={200}
//         />
//       </View>

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
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showAddExpenseModal}
//         onRequestClose={() => setShowAddExpenseModal(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add New Expense</Text>
            
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
//               {['Fuel', 'Maintenance', 'Tolls', 'Driver', 'Other'].map((cat) => (
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
//               <Pressable
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => setShowAddExpenseModal(false)}
//               >
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 style={[styles.modalButton, styles.submitButton]}
//                 onPress={handleAddExpense}
//               >
//                 <Text style={styles.modalButtonText}>Add Expense</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
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
//   revenueCard: {
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   revenueHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   revenueTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   revenueAmount: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 16,
//   },
//   revenueFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   revenueTimeFilter: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 14,
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
//   legendContainer: {
//     flexDirection: 'row',
//     marginTop: 16,
   
//   },
//   legendRow: {
//     flexDirection: 'row',
//     alignItems: 'center',


//   },
//   legendItem: {
//     flexDirection: 'row',
//     //alignSelf: 'center',
//     marginBottom: 8,
    
//   },
//   legendColor: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     marginRight: 8,
//     marginLeft: 8,
//   },
//   legendText: {
//     fontSize: 14,
//     color: '#6B7280',
//     flexShrink:1
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
//   expenseRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   expenseCard: {
//     flex: 1,
//     marginRight: 8,
//   },
//   netRevenueCard: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   addButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//     marginTop: 8,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
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
//     backgroundColor: '#FF6969',
//     marginRight: 8,
//   },
//   submitButton: {
//     backgroundColor: '#3B82F6',
//     marginLeft: 8,
//   },
//   modalButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//     color:'#fff'
//   },
//   cancelButtonText: {
//     color: '#6B7280',
//   },
//   submitButtonText: {
//     color: 'white',
//   },
//   card: {
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
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 16,
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

const { width: screenWidth } = Dimensions.get('window');
const chartSize = screenWidth * 0.6;
const legendWidth = screenWidth * 0.3;

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
    revenueVsExpense: [] as { month: string; revenue: number; expense: number; profit: number }[],
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
      const shipmentData = shipmentSnapshot.docs.map(doc => doc.data() as Shipment);
      setShipments(shipmentData);

      // Calculate total freight revenue
      const totalRevenue = shipmentData.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
      setTotalFreightRevenue(totalRevenue);

      // Fetch expenses from the correct transporter document
      const transporterQuery = query(collection(db, 'transporter'), where('name', '==', transporterName));
      const transporterSnapshot = await getDocs(transporterQuery);
      
      if (!transporterSnapshot.empty) {
        const transporterDocId = transporterSnapshot.docs[0].id;
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
        
        setExpenses(expenseData);
        const totalExp = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setTotalExpenses(totalExp);
        setNetRevenue(totalRevenue - totalExp);

        // Analyze expenses
        const byCategory: Record<string, number> = {};
        const byVehicle: Record<string, number> = {};
        const revenueVsExpense: { month: string; revenue: number; expense: number; profit: number }[] = [];
        
        // Process expenses
        expenseData.forEach(expense => {
          // By category
          byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
          
          // By vehicle
          if (expense.vehicleNo) {
            byVehicle[expense.vehicleNo] = (byVehicle[expense.vehicleNo] || 0) + expense.amount;
          }
        });
        
        // Process revenue by month
        const revenueByMonth: Record<string, number> = {};
        shipmentData.forEach(shipment => {
          const date = new Date(shipment.createdAt);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + (shipment.freightCost || 0);
        });
        
        // Process expenses by month
        const expenseByMonth: Record<string, number> = {};
        expenseData.forEach(expense => {
          const date = new Date(expense.createdAt);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + (expense.amount || 0);
        });
        
        // Combine data
        expenseData.forEach(expense => {
          const date = new Date(expense.createdAt);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + (expense.amount || 0);
        });
        setExpenseAnalysis(prev => ({
          ...prev,
          revenueVsExpense,
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
        }));
      }

      // Rest of your analytics calculations
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
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fuel': '#F59E0B',
      'Maintenance': '#EF4444',
      'Tolls': '#3B82F6',
      'Driver': '#10B981',
      'Other': '#8B5CF6'
    };
    return colors[category] || '#6B7280';
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

      // Get the transporter document ID
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
        // Update existing expense
        await updateDoc(doc(expenseRef, editingExpense.id), {
          amount: Number(newExpense.amount),
          description: newExpense.description,
          category: newExpense.category,
          date: new Date(newExpense.date).toISOString(),
          vehicleNo: newExpense.vehicleNo
        });
      } else {
        // Add new expense
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

  const analyzeExpenses = (expenseData: Expense[], shipmentData: Shipment[]) => {
    const byCategory: Record<string, number> = {};
    const byVehicle: Record<string, number> = {};
    const revenueVsExpense: { month: string; revenue: number; expense: number }[] = [];
    
    // Group revenue by month
    const revenueByMonth: Record<string, number> = {};
    shipmentData.forEach(shipment => {
      const date = new Date(shipment.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + (shipment.freightCost || 0);
    });
  
    // Group expenses by month
    const expenseByMonth: Record<string, number> = {};
    expenseData.forEach(expense => {
      const date = new Date(expense.date);
      if (isNaN(date.getTime())) return;
      
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + (expense.amount || 0);
    });
  
    // Combine all months
    const allMonths = new Set([
      ...Object.keys(revenueByMonth),
      ...Object.keys(expenseByMonth)
    ]);
  
    // Create the data array
    Array.from(allMonths).forEach(month => {
      revenueVsExpense.push({
        month,
        revenue: revenueByMonth[month] || 0,
        expense: expenseByMonth[month] || 0
      });
    });
  
    // Sort by date
    revenueVsExpense.sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  
    return {
      byCategory: Object.keys(byCategory).map(category => ({
        value: byCategory[category],
        label: category,
        color: getCategoryColor(category)
      })),
      byVehicle: Object.keys(byVehicle).map(vehicle => ({
        value: byVehicle[vehicle],
        label: vehicle,
        color: getVehicleColor(vehicle)
      })),
      revenueVsExpense
    };
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

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="large" color="#3A82F6" />
        </View>
      );
    }

    switch (activeChart) {
      case 'routes':
        return (
          <View style={{width: chartSize}}>
            <BarChart 
              data={routeFrequency} 
              barWidth={40} 
              spacing={30} 
              showValuesAsTopLabel 
              isAnimated 
              onPress={(item) => alert(`${item.label}: ${item.value} trips`)}
              barBorderRadius={4}
              frontColor="#3A82F6"
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={4}
              yAxisTextStyle={{ color: '#6B7280' }}
              xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center', width:'100%' }}
              labelWidth={80}
            />
          </View>
        );
      case 'vehicles':
        return (
          <BarChart 
            data={vehicleUsage} 
            barWidth={40} 
            spacing={30} 
            showValuesAsTopLabel 
            isAnimated 
            onPress={(item) => alert(`${item.label}: ${item.value} times used`)}
            barBorderRadius={4}
            frontColor="#10B981"
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            yAxisTextStyle={{ color: '#6B7280' }}
            xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
            labelWidth={80}
          />
        );
      case 'status':
        return (
          <View style={styles.pieChartContainer}>
            <View style={{ width: chartSize, height: chartSize, justifyContent: 'center', alignItems: 'center' }}>
              <PieChart 
                data={statusData} 
                showValuesAsLabels 
                showText 
                textColor='white' 
                textSize={16} 
                fontWeight='bold' 
                showExternalLabels 
                donut 
                radius={chartSize/ 2- 20} 
                onPress={(item) => alert(`${item.label}: ${item.value}`)}
                centerLabelComponent={() => (
                  <View style={styles.pieCenterLabel}>
                    <Text style={styles.pieCenterText}>Status</Text>
                  </View>
                )}
              />
              <View style={styles.legendContainer}>
                {statusData.map((item, index) => (
                  <View key={index} style={styles.legendRow}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>
                      {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      case 'trend':
        return (
          <LineChart 
            data={trendData} 
            color='#8B5CF6' 
            curved 
            thickness={3} 
            isAnimated 
            hideDataPoints 
            onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value.toLocaleString()}`)}
            adjustToWidth
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            yAxisTextStyle={{ color: '#6B7280' }}
            xAxisLabelTextStyle={{ color: '#6B7280', textAlign: 'center' }}
            areaChart
            startFillColor="rgba(139, 92, 246, 0.1)"
            startOpacity={0.1}
            endFillColor="rgba(139, 92, 246, 0.05)"
            endOpacity={0.05}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={fetchAnalyticsData} 
          tintColor="#3A82F6"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>{transporterName}</Text>
      </View>

      {/* Financial Summary Cards */}
      <View style={styles.financialSummary}>
        {/* Revenue Card */}
        <LinearGradient
          colors={['#3A82F6', '#5D9DFF']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="attach-money" size={20} color="white" />
            <Text style={styles.cardTitle}>Total Revenue</Text>
          </View>
          <Text style={styles.cardAmount}>₦{totalFreightRevenue.toLocaleString()}</Text>
        </LinearGradient>

        {/* Expenses Card */}
        <LinearGradient
          colors={['#EF4444', '#F87171']}
          style={styles.summaryCard}
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
          style={styles.summaryCard}
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
            color={activeChart === 'routes' ? '#3A82F6' : '#6B7280'} 
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
            color={activeChart === 'vehicles' ? '#10B981' : '#6B7280'} 
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
            color={activeChart === 'status' ? '#8B5CF6' : '#6B7280'} 
          />
          <Text style={[styles.chartNavText, activeChart === 'status' && styles.chartNavTextActive]}>
            Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chartNavButton, activeChart === 'trend' && styles.chartNavButtonActive]}
          onPress={() => setActiveChart('trend')}
        >
          <MaterialIcons 
            name="trending-up" 
            size={20} 
            color={activeChart === 'trend' ? '#F59E0B' : '#6B7280'} 
          />
          <Text style={[styles.chartNavText, activeChart === 'trend' && styles.chartNavTextActive]}>
            Trends
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Chart Container */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Expense Analytics Section */}
      <Text style={styles.sectionTitle}>Expense Analytics</Text>
      
      {/* Revenue vs Expenses Chart */}
      <View style={styles.analyticsCard}>
  <Text style={styles.analyticsTitle}>Revenue vs Expenses</Text>
  {expenseAnalysis.revenueVsExpense.length > 0 ? (
    <BarChart
      data={expenseAnalysis.revenueVsExpense.map(item => ({
        value: item.revenue,
        label: item.month,
        frontColor: '#3A82F6',
        topLabelComponent: () => (
          <Text style={{ color: '#3A82F6', fontSize: 10 }}>
            ₦{item.revenue.toLocaleString()}
          </Text>
        ),
        labelTextStyle: { color: '#6B7280', fontSize: 10 }
      }))}
        lineData2={expenseAnalysis.revenueVsExpense.map(item => ({
        value: item.expense,
        frontColor: '#EF4444',
        topLabelComponent: () => (
          <Text style={{ color: '#EF4444', fontSize: 10 }}>
            ₦{item.expense.toLocaleString()}
          </Text>
        )
      }))}
      barWidth={20}
      spacing={30}
      height={200}
      noOfSections={5}
      yAxisThickness={0}
      xAxisThickness={0}
      yAxisTextStyle={{ color: '#6B7280' }}
      xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
      showReferenceLine1
      referenceLine1Position={0}
      referenceLine1Config={{ color: 'gray', dashWidth: 2, dashGap: 3 }}
      initialSpacing={10}
    />
  ) : (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No revenue/expense data available</Text>
    </View>
  )}
  <View style={styles.legendContainer}>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: '#3A82F6' }]} />
      <Text style={styles.legendText}>Revenue</Text>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
      <Text style={styles.legendText}>Expenses</Text>
    </View>
  </View>
</View>
      <View style={styles.expenseListContainer}>
  <Text style={styles.sectionTitle}>Recent Expenses</Text>
  {expenses.slice(0, 5).map((expense) => (
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


      {/* Expenses by Category */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Expenses by Category</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PieChart
            data={expenseAnalysis.byCategory}
            donut
            showText
            textColor="white"
            radius={80}
            innerRadius={50}
            textSize={12}
            centerLabelComponent={() => (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Categories</Text>
              </View>
            )}
          />
          <View style={styles.legendContainer}>
            {expenseAnalysis.byCategory.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.label}: ₦{item.value.toLocaleString()}
                </Text>
              </View>
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
            barWidth={40}
            spacing={20}
            height={200}
            noOfSections={5}
            showValuesAsTopLabel
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: '#6B7280' }}
            xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
          />
          <View style={styles.legendContainer}>
            {expenseAnalysis.byVehicle.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.label}: ₦{item.value.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Stats Overview */}
      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{shipments.length}</Text>
          <Text style={styles.statLabel}>Total Shipments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {statusData.reduce((acc, curr) => acc + curr.value, 0) > 0 
              ? `${Math.round((statusData.find(s => s.label === 'Completed')?.value || 0) / 
                 statusData.reduce((acc, curr) => acc + curr.value, 0) * 100)}%`
              : '0%'}
          </Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
        <View style={styles.statCard}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
  },
  chartNavButtonActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  chartNavText: {
    marginLeft: 8,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  chartNavTextActive: {
    color: '#111827',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 400,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  chartPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
    height: chartSize*1.6,
    justifyContent: 'center',
  },
  pieCenterLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
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
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  confirmCancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  confirmSubmitButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#6B7280',
    fontSize: 14,
  },
  
});

export default AnalyticsScreen;