import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from "../firebase";

interface ChartData {
  value: number;
  color?: string;
  label: string;
}

const db = getFirestore(app);

const AnalyticsScreen: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [routeFrequency, setRouteFrequency] = useState<ChartData[]>([]);
  const [avgDeliveryTime, setAvgDeliveryTime] = useState<ChartData[]>([]);
  const [vehicleUtilization, setVehicleUtilization] = useState<ChartData[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalyticsData = async () => {
    try {
      const deliveryRef = collection(db, 'deliveries');
      const snapshot = await getDocs(deliveryRef);
      const data = snapshot.docs.map(doc => doc.data());
      setDeliveries(data);

      // Mock data processing
      setRevenueData([
        { value: 40, color: 'red', label: 'Route A' },
        { value: 30, color: 'blue', label: 'Route B' },
        { value: 20, color: 'green', label: 'Route C' }
      ]);

      setStatusData([
        { value: 50, color: 'green', label: 'Completed' },
        { value: 30, color: 'orange', label: 'Pending' },
        { value: 20, color: 'red', label: 'Delayed' }
      ]);

      setRouteFrequency([
        { value: 10, label: 'Route A' },
        { value: 8, label: 'Route B' },
        { value: 5, label: 'Route C' }
      ]);

      setAvgDeliveryTime([
        { value: 20, label: 'Mon' },
        { value: 15, label: 'Tue' },
        { value: 10, label: 'Wed' },
        { value: 13, label: 'Thu' },
        { value: 25, label: 'Fri' },
        { value: 10, label: 'Sat' }

      ]);

      setVehicleUtilization([
        { value: 12, label: 'Truck 1' },
        { value: 15, label: 'Truck 2' },
        { value: 9, label: 'Truck 3' }
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView 
      style={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Analytics</Text>

      <Text style={{ marginTop: 20 }}>Total Deliveries Over Time</Text>
      <BarChart data={routeFrequency} barWidth={50} spacing={15} />

      <Text style={{ marginTop: 20 }}>Revenue Breakdown</Text>
      <PieChart data={revenueData} showText donut/>

      <Text style={{ marginTop: 20 }}>Top Routes by Frequency</Text>
      <BarChart data={routeFrequency} barWidth={30} spacing={15} />

      <Text style={{ marginTop: 20 }}>Delivery Status Distribution</Text>
      <PieChart data={statusData} showText />

      <Text style={{ marginTop: 20 }}>Average Delivery Time per Route</Text>
      <LineChart data={avgDeliveryTime} />

      <Text style={{ marginTop: 20 }}>Vehicle Utilization Rate</Text>
      <BarChart data={vehicleUtilization} barWidth={30} spacing={15} />
    </ScrollView>
  );
};

export default AnalyticsScreen;
