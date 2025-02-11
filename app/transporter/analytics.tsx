import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { app } from "../firebase";
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

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

  const sampleTrendData = [
    { value: 120000, label: 'Mon' },
    { value: 150000, label: 'Tue' },
    { value: 100000, label: 'Wed' },
    { value: 180000, label: 'Thu' },
    { value: 220000, label: 'Fri' },
    { value: 170000, label: 'Sat' },
    { value: 90000, label: 'Sun' },
  ];

  const {transporterName} = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      fetchAnalyticsData();
    }, [timeFilter])
  );

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    console.log(transporterName)
    const shipmentRef = query(collection(db, 'Shipment'), where('transporter', '==', transporterName));
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
      <LineChart data={trendData} color='#2196F3' curved thickness={3} isAnimated hideDataPoints onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value}`)} adjustToWidth/>
      {/* <LineChart
        data={sampleTrendData}
        color='#FF6B6B'
        thickness={3}
        isAnimated
        hideDataPoints
        areaChart
        startFillColor='rgba(255, 107, 107, 0.3)'
        endFillColor='rgba(255, 107, 107, 0)'
        startOpacity={0.8}
        endOpacity={0.2}
        curved
        xAxisLabelTexts={sampleTrendData.map(item => item.label)}
        yAxisOffset={5}
        onPress={(item) => alert(`Revenue on ${item.label}: ₦${item.value}`)}
      /> */}
    </ScrollView>
  );
};

export default AnalyticsScreen;
