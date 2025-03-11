// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// type WaybillProps = {
//   shipment: {
//     id: string;
//     vehicleNo: string;
//     deliveries?: Array<{
//       id: string;
//       [key: string]: any;
//     }>;
//     [key: string]: any;
//   };
// };

// const Waybill: React.FC<WaybillProps> = ({ shipment }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>DELIVERY NOTE</Text>
//       <Text style={styles.subHeader}>Lorem Ipsum Dolor</Text>
//       <Text>Your address, ABC-123</Text>
//       <Text>+1234 56 789</Text>
//       <Text>mail@company.com</Text>
//       <Text>www.website.com</Text>

//       <Text style={styles.sectionHeader}>Reference No.</Text>
//       <Text>Invoice Date</Text>
//       <Text>Order No.</Text>
//       <Text>Client No.</Text>
//       <Text>Carrier</Text>
//       <Text>Delivery Method</Text>
//       <Text>Total Weight</Text>

//       <Text style={styles.sectionHeader}>Name</Text>
//       <Text>Address</Text>
//       <Text>City, State</Text>
//       <Text>ZIP</Text>

//       <View style={styles.table}>
//         <View style={styles.tableRow}>
//           <Text style={styles.tableHeader}>No.</Text>
//           <Text style={styles.tableHeader}>Item Code</Text>
//           <Text style={styles.tableHeader}>Item Description</Text>
//           <Text style={styles.tableHeader}>Quantity</Text>
//           <Text style={styles.tableHeader}>Total</Text>
//         </View>
//         {shipment.deliveries?.map((delivery, index) => (
//           <View key={delivery.id} style={styles.tableRow}>
//             <Text>{index + 1}</Text>
//             <Text>{delivery.id}</Text>
//             <Text>Item Description</Text>
//             <Text>Quantity</Text>
//             <Text>Total</Text>
//           </View>
//         ))}
//       </View>

//       <Text style={styles.sectionHeader}>Items received by:</Text>
//       <Text>Print Name: ______</Text>
//       <Text>Signature: Date: ______</Text>

//       <Text style={styles.footer}>
//         Returns must be made within 30 days. Please use the included return label. Thank you!
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subHeader: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   table: {
//     marginTop: 10,
//   },
//   tableRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 5,
//   },
//   tableHeader: {
//     fontWeight: "bold",
//   },
//   footer: {
//     marginTop: 20,
//     fontStyle: "italic",
//   },
// });

// export default Waybill;

import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Delivery = {
  deliveryNumber: string;
  address: string;
  customer: string;
  materials: Array<{
    name: string;
    totalWeight: number;
  }>;
  createdAt: string;
  shipment: string;
};

type WaybillProps = {
  delivery: Delivery;
};

const Waybill: React.FC<WaybillProps> = ({ delivery }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>DELIVERY NOTE</Text>
      <Text style={styles.subHeader}>Lorem Ipsum Dolor</Text>
      <Text>Your address, ABC-123</Text>
      <Text>+1234 56 789</Text>
      <Text>mail@company.com</Text>
      <Text>www.website.com</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Delivery Details</Text>
        <Text>Delivery Number: {delivery.deliveryNumber}</Text>
        <Text>Customer: {delivery.customer}</Text>
        <Text>Address: {delivery.address}</Text>
        <Text>Shipment: {delivery.shipment}</Text>
        <Text>Created At: {new Date(delivery.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Materials</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.tableCell]}>No.</Text>
            <Text style={[styles.tableHeader, styles.tableCell]}>Material Name</Text>
            <Text style={[styles.tableHeader, styles.tableCell]}>Total Weight (kg)</Text>
          </View>
          {delivery.materials.map((material, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{material.name}</Text>
              <Text style={styles.tableCell}>{material.totalWeight}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Items received by:</Text>
        <Text>Print Name: ______</Text>
        <Text>Signature: Date: ______</Text>
      </View>

      <Text style={styles.footer}>
        Returns must be made within 30 days. Please use the included return label. Thank you!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default Waybill;