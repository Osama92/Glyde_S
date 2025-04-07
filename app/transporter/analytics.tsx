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


import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { app } from "../firebase";
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const { width: screenWidth } = Dimensions.get('window');
const chartSize = screenWidth * 0.6; // Takes 60% of screen width
const legendWidth = screenWidth * 0.3; // Takes 30% of screen width

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

const statusColors = {
  Completed: '#4CAF50',
  Pending: '#FF9800',
  Delayed: '#F44336',
};

const AnalyticsScreen: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalFreightRevenue, setTotalFreightRevenue] = useState<number>(0);
  const [routeFrequency, setRouteFrequency] = useState<{ value: number; label: string }[]>([]);
  const [statusData, setStatusData] = useState<{ value: number; color: string; label: string }[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<{ value: number; label: string }[]>([]);
  const [trendData, setTrendData] = useState<{ value: number; label: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [activeChart, setActiveChart] = useState<'routes' | 'vehicles' | 'status' | 'trend'>('routes');

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
        if (statusId === 4) statusCounts['Completed']++;
        else if (statusId <=3) statusCounts['Pending']++;
        else statusCounts['Delayed']++;
      });
      setStatusData([
        { value: statusCounts['Completed'], color: statusColors.Completed, label: 'Completed' },
        { value: statusCounts['Pending'], color: statusColors.Pending, label: 'Pending' },
        { value: statusCounts['Delayed'], color: statusColors.Delayed, label: 'Delayed' },
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
          <View style={{width:chartSize}}>
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

      {/* Revenue Card */}
      <LinearGradient
        colors={['#3A82F6', '#5D9DFF']}
        style={styles.revenueCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.revenueHeader}>
          <MaterialIcons name="attach-money" size={24} color="white" />
          <Text style={styles.revenueTitle}>Total Freight Revenue</Text>
        </View>
        <Text style={styles.revenueAmount}>₦{totalFreightRevenue.toLocaleString()}</Text>
        <View style={styles.revenueFooter}>
          <Text style={styles.revenueTimeFilter}>
            {timeFilter === 'week' ? 'Last 7 days' : 
             timeFilter === 'month' ? 'Last 30 days' : 
             'All time'}
          </Text>
        </View>
      </LinearGradient>

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
  revenueCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  revenueAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueTimeFilter: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
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
  legendContainer: {
    flexDirection: 'row',
    marginTop: 16,
   
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',


  },
  legendItem: {
    flexDirection: 'row',
    //alignSelf: 'center',
    marginBottom: 8,
    
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    marginLeft: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    flexShrink:1
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
});

export default AnalyticsScreen;