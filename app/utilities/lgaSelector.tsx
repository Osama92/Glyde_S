import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { MaterialIcons } from '@expo/vector-icons';

const LGASelector = ({ lga, selectedLGA, setSelectedLGA }) => {
  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>LGA</Text>
      
      {/* Searchable Dropdown */}
      <SearchableDropdown
        onItemSelect={(item: any) => setSelectedLGA(item)}
        containerStyle={styles.dropdownContainer}
        textInputStyle={styles.dropdownInput}
        itemStyle={styles.dropdownItem}
        itemTextStyle={styles.dropdownItemText}
        items={lga}
        placeholderTextColor="#999"
        placeholder='Select a LGA'
        resetValue={false}
        underlineColorAndroid="transparent"
      />
      
      {/* Selected Item Display */}
      {selectedLGA && (
        <View style={styles.selectedItemContainer}>
          <MaterialIcons name="flag" size={20} color="#4A90E2" />
          <View style={styles.selectedItemTextContainer}>
            <Text style={styles.selectedItemName}>{selectedLGA.name}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  dropdownContainer: {
    padding: 0,
    marginBottom: 10,
  },
  dropdownInput: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFF',
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  dropdownItemText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E0E8FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  selectedItemTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Nunito',
  },
  selectedItemAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Nunito',
  },
  selectedItemCoordinates: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Nunito',
  },
});

export default LGASelector;