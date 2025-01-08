// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { getFirestore, collection, addDoc } from "firebase/firestore";
// import { app } from "../firebase"; // Ensure you have configured Firebase in this file

// // Firestore initialization
// const db = getFirestore(app);

// export default function CreateMaterialScreen() {
//   const [materialName, setMaterialName] = useState<string>("");
//   const [originName, setOriginName] = useState<string>("");
//   const [isSaving, setIsSaving] = useState<boolean>(false);

//   const handleSaveMaterial = async () => {
//     if (!materialName.trim()) {
//       Alert.alert("Error", "Material name cannot be empty.");
//       return;
//     }

//     setIsSaving(true);

//     try {
//       await addDoc(collection(db, `originPoint/${originName}/materials`), {
//         name: materialName,
//         createdAt: new Date().toISOString(),
//       });
//       Alert.alert("Success", "Material saved successfully.");
//       setMaterialName("");
//       setOriginName(""); // Clear the input field
//     } catch (error) {
//       console.error("Error saving material:", error);
//       Alert.alert("Error", "Failed to save material. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Create Material</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Origin Name"
//         value={originName}
//         onChangeText={(text) => setOriginName(text)}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Enter Material Name"
//         value={materialName}
//         onChangeText={(text) => setMaterialName(text)}
//       />


//       <TouchableOpacity
//         style={styles.saveButton}
//         onPress={handleSaveMaterial}
//         disabled={isSaving}
//       >
//         <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save Material"}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   input: {
//     width: "100%",
//     height: 50,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//     backgroundColor: "#fff",
//   },
//   saveButton: {
//     backgroundColor: "#007BFF",
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase"; // Ensure you have configured Firebase in this file

// Firestore initialization
const db = getFirestore(app);

export default function CreateMaterialScreen() {
  const [materialName, setMaterialName] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveMaterial = async () => {
    if (!materialName.trim() || !originName.trim()) {
      Alert.alert("Error", "Origin name and material name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const materialsRef = collection(db, `originPoint/${originName}/materials`);
      const q = query(materialsRef, where("name", "==", materialName));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Material already exists under the origin
        Alert.alert("Info", "This material already exists for the specified origin.");
      } else {
        // Add new material to the materials sub-collection
        await addDoc(materialsRef, {
          name: materialName,
          createdAt: new Date().toISOString(),
        });
        Alert.alert("Success", "Material added successfully.");
      }

      setMaterialName("");
      setOriginName(""); // Clear input fields
    } catch (error) {
      console.error("Error saving material:", error);
      Alert.alert("Error", "Failed to save material. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Material</Text>

      <TextInput
        style={styles.input}
        placeholder="Origin Name"
        value={originName}
        onChangeText={(text) => setOriginName(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Material Name"
        value={materialName}
        onChangeText={(text) => setMaterialName(text)}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveMaterial}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Material"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
