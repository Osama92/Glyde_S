import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, ActivityIndicator, Image } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import {router} from 'expo-router'

const db = getFirestore(app);

const MissingLoadingPointScreen = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]); // Stores documents with missing LoadingPoint
  const [selectedDoc, setSelectedDoc] = useState<any>(null); // Selected document for updating
  const [loadingPoint, setLoadingPoint] = useState(""); // TextInput value for LoadingPoint
  const [isModalVisible, setIsModalVisible] = useState(false); // Controls modal visibility

  // Fetch documents with missing LoadingPoint field
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "DriverOnBoarding"));
      const querySnapshot = await getDocs(q);

      // Filter documents that do not have the LoadingPoint field
      const docsWithMissingField = querySnapshot.docs
        .filter((doc) => !doc.data().LoadingPoint)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setDocuments(docsWithMissingField);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the LoadingPoint field for a document
  const updateLoadingPoint = async () => {
    if (!selectedDoc || !loadingPoint) return;

    try {
      setLoading(true);
      const docRef = doc(db, "DriverOnBoarding", selectedDoc.id);
      await updateDoc(docRef, { LoadingPoint: loadingPoint });
      console.log("Document updated successfully!");

      // Refresh the list of documents
      await fetchDocuments();
      setIsModalVisible(false); // Close the modal
      setLoadingPoint(""); // Clear the input field
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal to update LoadingPoint for a document
  const handleDocumentPress = (doc: any) => {
    setSelectedDoc(doc);
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={styles.topSection}>
                      
                        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop:20 }}>Back</Text>
                      
                      <TouchableOpacity onPress={() => router.back()} style={{marginLeft:20, marginTop:20}}>
                      <Image
                        source={require("../../assets/images/Back.png")}
                        style={{ width: 30, resizeMode: "contain", marginRight: 10 }}
                      />
                      </TouchableOpacity>
                    </View>
      <Text style={styles.title}>Pending Loading Points</Text>

      {/* List of documents with missing LoadingPoint */}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDocumentPress(item)} style={styles.documentItem}>
            <Text style={styles.documentText}>Document ID: {item.id}</Text>
            <Text style={styles.documentText}>Driver Name: {item.driverName || "N/A"}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No documents with missing LoadingPoint found.</Text>
        }
      />

      {/* Modal to update LoadingPoint */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Loading Point</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Loading Point"
              value={loadingPoint}
              onChangeText={setLoadingPoint}
            />
            <TouchableOpacity onPress={updateLoadingPoint} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MissingLoadingPointScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  documentItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentText: {
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  topSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom:15
  },
});