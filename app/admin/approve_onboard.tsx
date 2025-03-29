import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  ScrollView,
  Alert
} from "react-native";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getFirestore 
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SearchableDropdown from "react-native-searchable-dropdown";

const db = getFirestore(app);

const MissingLoadingPointScreen = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loadingPoint, setLoadingPoint] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [originPoints, setOriginPoints] = useState<any[]>([]);
  const [loadingOriginPoints, setLoadingOriginPoints] = useState(false);

  // Fetch documents with missing LoadingPoint field
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "DriverOnBoarding"));
      const querySnapshot = await getDocs(q);

      const docsWithMissingField = querySnapshot.docs.filter((doc) => !doc.data().LoadingPoint).map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure these fields exist in your Firestore documents
        driverPhoto: doc.data().driverPhoto || null,
        licencePhoto: doc.data().licencePhoto || null
      }));

      setDocuments(docsWithMissingField);
    } catch (error) {
      console.error("Error fetching documents: ", error);
      Alert.alert("Error", "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };


  // Fetch origin points from Firestore
  const fetchOriginPoints = async () => {
    try {
      setLoadingOriginPoints(true);
      const q = query(collection(db, "originPoint"));
      const querySnapshot = await getDocs(q);
      
      const points = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id
      }));
      
      setOriginPoints(points);
    } catch (error) {
      console.error("Error fetching origin points: ", error);
      Alert.alert("Error", "Failed to fetch origin points");
    } finally {
      setLoadingOriginPoints(false);
    }
  };

  // Update the LoadingPoint field for a document
  const updateLoadingPoint = async () => {
    if (!selectedDoc || !loadingPoint) {
      Alert.alert("Error", "Please select a loading point");
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, "DriverOnBoarding", selectedDoc.id);
      await updateDoc(docRef, { 
        LoadingPoint: loadingPoint,
        updatedAt: new Date().toISOString()
      });

      Alert.alert("Success", "Loading point updated successfully!");
      await fetchDocuments();
      setIsModalVisible(false);
      setLoadingPoint("");
    } catch (error) {
      console.error("Error updating document: ", error);
      Alert.alert("Error", "Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchOriginPoints();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Loading Points</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            <Text style={styles.emptyText}>All documents have loading points assigned</Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedDoc(item);
                  setIsModalVisible(true);
                }} 
                style={styles.documentCard}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.documentId}>ID: {item.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>
                
                <Text style={styles.driverName}>{item.driverName || "Unknown Driver"}</Text>
                <Text style={styles.vehicleInfo}>Vehicle: {item.vehicleNo}</Text>
                
                {/* Image Previews */}
                <View style={styles.imagePreviewContainer}>
                  {item.driverPhoto ? (
                    <Image source={{ uri: item.driverPhoto }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="person" size={24} color="#aaa" />
                    </View>
                  )}
                  
                  {item.licencePhoto ? (
                    <Image source={{ uri: item.licencePhoto }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialIcons name="card-membership" size={24} color="#aaa" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* Update Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Loading Point</Text>
            
            <Text style={styles.selectedDriver}>{selectedDoc?.driverName}</Text>
            <Text style={styles.selectedVehicle}>{selectedDoc?.vehicleNo}</Text>
            
            {loadingOriginPoints ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <SearchableDropdown
                onTextChange={(text: string) => setLoadingPoint(text)}
                onItemSelect={(item: any) => setLoadingPoint(item.name)}
                containerStyle={styles.dropdownContainer}
                textInputStyle={styles.dropdownInput}
                items={originPoints}
                placeholder="Select Origin Point"
                placeholderTextColor="#888"
                resetValue={false}
                itemStyle={styles.dropdownItem}
                underlineColorAndroid="transparent"
              />
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)} 
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={updateLoadingPoint} 
                style={[styles.modalButton, styles.updateButton]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  documentId: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  statusBadge: {
    backgroundColor: "#FFA000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  driverName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  imagePlaceholder: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  selectedDriver: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  selectedVehicle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    color: "#333",
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 12,
    marginTop: 2,
    backgroundColor: "#f9f9f9",
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 8,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  updateButton: {
    backgroundColor: "#4A90E2",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MissingLoadingPointScreen;