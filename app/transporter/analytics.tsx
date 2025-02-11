// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, RefreshControl } from 'react-native';
// import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
// import { collection, getDocs, getFirestore } from 'firebase/firestore';
// import { app } from "../firebase";

// interface ChartData {
//   value: number;
//   color?: string;
//   label: string;
// }

// const db = getFirestore(app);

// const AnalyticsScreen: React.FC = () => {
//   const [deliveries, setDeliveries] = useState<any[]>([]);
//   const [revenueData, setRevenueData] = useState<ChartData[]>([]);
//   const [statusData, setStatusData] = useState<ChartData[]>([]);
//   const [routeFrequency, setRouteFrequency] = useState<ChartData[]>([]);
//   const [avgDeliveryTime, setAvgDeliveryTime] = useState<ChartData[]>([]);
//   const [vehicleUtilization, setVehicleUtilization] = useState<ChartData[]>([]);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   const fetchAnalyticsData = async () => {
//     try {
//       const deliveryRef = collection(db, 'deliveries');
//       const snapshot = await getDocs(deliveryRef);
//       const data = snapshot.docs.map(doc => doc.data());
//       setDeliveries(data);

//       // Mock data processing
//       setRevenueData([
//         { value: 40, color: 'red', label: 'Route A' },
//         { value: 30, color: 'blue', label: 'Route B' },
//         { value: 20, color: 'green', label: 'Route C' }
//       ]);

//       setStatusData([
//         { value: 50, color: 'green', label: 'Completed' },
//         { value: 30, color: 'orange', label: 'Pending' },
//         { value: 20, color: 'red', label: 'Delayed' }
//       ]);

//       setRouteFrequency([
//         { value: 10, label: 'Route A' },
//         { value: 8, label: 'Route B' },
//         { value: 5, label: 'Route C' }
//       ]);

//       setAvgDeliveryTime([
//         { value: 20, label: 'Mon' },
//         { value: 15, label: 'Tue' },
//         { value: 10, label: 'Wed' },
//         { value: 13, label: 'Thu' },
//         { value: 25, label: 'Fri' },
//         { value: 10, label: 'Sat' }

//       ]);

//       setVehicleUtilization([
//         { value: 12, label: 'Truck 1' },
//         { value: 15, label: 'Truck 2' },
//         { value: 9, label: 'Truck 3' }
//       ]);
//     } catch (error) {
//       console.error('Error fetching analytics data:', error);
//     }
//   };

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, []);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchAnalyticsData();
//     setRefreshing(false);
//   }, []);

//   return (
//     <ScrollView 
//       style={{ padding: 20 }}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Analytics</Text>

//       <Text style={{ marginTop: 20 }}>Total Deliveries Over Time</Text>
//       <BarChart data={routeFrequency} barWidth={50} spacing={15} />

//       <Text style={{ marginTop: 20 }}>Revenue Breakdown</Text>
//       <PieChart data={revenueData} showText donut/>

//       <Text style={{ marginTop: 20 }}>Top Routes by Frequency</Text>
//       <BarChart data={routeFrequency} barWidth={30} spacing={15} />

//       <Text style={{ marginTop: 20 }}>Delivery Status Distribution</Text>
//       <PieChart data={statusData} showText />

//       <Text style={{ marginTop: 20 }}>Average Delivery Time per Route</Text>
//       <LineChart data={avgDeliveryTime} />

//       <Text style={{ marginTop: 20 }}>Vehicle Utilization Rate</Text>
//       <BarChart data={vehicleUtilization} barWidth={30} spacing={15} />
//     </ScrollView>
//   );
// };

// export default AnalyticsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { app } from "../firebase";
import { useFocusEffect } from '@react-navigation/native';

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

const AnalyticsScreen: React.FC<{ transporter: string }> = ({ transporter }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
  const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
  const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
  const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      fetchAnalyticsData();
    }, [timeFilter])
  );

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', "Bukky Vent"));
    const snapshot = await getDocs(shipmentRef);
    const data = snapshot.docs.map(doc => doc.data() as Shipment);
    setShipments(data);

    // Total Freight Revenue
    const totalRevenue = data.reduce((acc, curr) => acc + (curr.freightCost || 0), 0);
    setTotalFreightRevenue(totalRevenue);

    // Route Frequency
    const routeCounts: Record<string, number> = {};
    data.forEach(({ route }) => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    // setRouteFrequency(Object.keys(routeCounts).map(route => ({ value: routeCounts[route], label: route })));
    setRouteFrequency(
      Object.keys(routeCounts).map(route => ({
        value: Number(routeCounts[route]) || 0,
        label: route
      }))
    );
    

    // Vehicle Utilization
    const vehicleCounts: Record<string, number> = {};
    data.forEach(({ vehicleNo }) => {
      vehicleCounts[vehicleNo] = (vehicleCounts[vehicleNo] || 0) + 1;
    });
    //setVehicleUsage(Object.keys(vehicleCounts).map(vehicle => ({ value: vehicleCounts[vehicle], label: vehicle })));
    setVehicleUsage(
      Object.keys(vehicleCounts).map(vehicle => ({
        value: Number(vehicleCounts[vehicle]) || 0,
        label: vehicle
      }))
    );
    
    // Delivery Status
    const statusCounts = { 'Completed': 0, 'Pending': 0, 'Delayed': 0 };
    data.forEach(({ statusId }) => {
      if (statusId === 1) statusCounts['Completed']++;
      else if (statusId === 0) statusCounts['Pending']++;
      else statusCounts['Delayed']++;
    });
    setStatusData([
      { value: statusCounts['Completed'], color: '#4CAF50', label: 'Completed' },
      { value: statusCounts['Pending'], color: '#FF9800', label: 'Pending' },
      { value: statusCounts['Delayed'], color: '#F44336', label: 'Delayed' },
    ]);

    // Trend Analysis
    const filteredData = data.filter(({ createdAt }) => {
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
      const dateLabel = new Date(createdAt).toLocaleDateString();
      revenueTrend[dateLabel] = (revenueTrend[dateLabel] || 0) + freightCost;
    });
    //setTrendData(Object.keys(revenueTrend).map(date => ({ value: revenueTrend[date], label: date })));
    setTrendData(
      Object.keys(revenueTrend).map(date => ({
        value: Number(revenueTrend[date]) || 0,
        label: date
      }))
    );
    
    setRefreshing(false);
  };

  return (
    <ScrollView style={{ padding: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAnalyticsData} />}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Analytics</Text>
      
      {/* Filter Options */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        {['week', 'month', 'all'].map(filter => (
          <TouchableOpacity key={filter} onPress={() => setTimeFilter(filter as 'week' | 'month' | 'all')}>
            <Text style={{ padding: 10, color: timeFilter === filter ? 'blue' : 'black' }}>{filter.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={{ marginTop: 20, fontWeight: '600' }}>Total Freight Revenue: ₦{totalFreightRevenue.toLocaleString()}</Text>

      <Text style={{ marginTop: 20 }}>Route Frequency</Text>
      <BarChart data={routeFrequency} barWidth={100} spacing={15} showValuesAsTopLabel isAnimated onPress={(item) => alert(`${item.label}: ${item.value} trips`)} />

      <Text style={{ marginTop: 20 }}>Vehicle Utilization</Text>
      <BarChart data={vehicleUsage} barWidth={100} spacing={15} showValuesAsTopLabel isAnimated onPress={(item) => alert(`${item.label}: ${item.value} times used`)} />
      
      <Text style={{ marginTop: 20 }}>Delivery Status Distribution</Text>
      <PieChart data={statusData} showValuesAsLabels showText textColor='white' textSize={20} fontWeight='bold' showExternalLabels donut radius={130} onPress={(item) => alert(`${item.label}: ${item.value}`)} />
      
      <Text style={{ marginTop: 20 }}>Revenue Trend</Text>
      <LineChart data={trendData} color='#2196F3' thickness={3} isAnimated hideDataPoints onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value}`)} />
    </ScrollView>
  );
};

export default AnalyticsScreen;
