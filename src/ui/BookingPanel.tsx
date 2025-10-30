import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

type Props = {
  insets: EdgeInsets;
  onSearch: (origin: string, destination: string) => void;
  currentLocation?: { latitude: number; longitude: number } | null;
  onPickupChange?: (text: string) => void;
};

const BookingPanel: React.FC<Props> = ({ insets, onSearch, currentLocation, onPickupChange }) => {
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const didAutofillRef = useRef(false);

  // When we first get the device location, auto-fill the pickup input for clarity
  useEffect(() => {
    if (!didAutofillRef.current && !pickupText && currentLocation) {
      setPickupText('Current location');
      didAutofillRef.current = true; // only once; user can clear afterward
    }
  }, [currentLocation, pickupText]);

  const handleSearch = () => {
    const useGPS = pickupText.trim().length === 0 || pickupText === 'Current location';
    const origin = useGPS && currentLocation
      ? `${currentLocation.latitude},${currentLocation.longitude}`
      : pickupText;
    if (!origin || !dropoffText) return;
    onSearch(origin, dropoffText);
  };

  return (
    <View style={[styles.card, { top: insets.top + 16, left: 16 }]}> 
      <Text style={styles.header}>Get a ride</Text>

      <View style={styles.inputRow}>
        <Text style={styles.bullet}>•</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup location"
          value={pickupText}
          onChangeText={(t) => { setPickupText(t); onPickupChange && onPickupChange(t); }}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        <Pressable onPress={() => { setPickupText('Current location'); onPickupChange && onPickupChange('Current location'); }} style={styles.quickBtn}>
          <Text style={styles.quickTxt}>Use current</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.bullet}>+</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={dropoffText}
          onChangeText={setDropoffText}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputRowBare}>
        <Text style={styles.tag}>Pickup now</Text>
        <Text style={styles.tag}>For me</Text>
      </View>

      <Pressable onPress={handleSearch} style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}> 
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    zIndex: 10,
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 8,
  },
  inputRowBare: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 12,
  },
  bullet: { fontSize: 18, color: '#6b7280', width: 18, textAlign: 'center' },
  input: { flex: 1, fontSize: 15, paddingVertical: 6 },
  tag: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    color: '#111',
  },
  quickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginLeft: 6,
  },
  quickTxt: { fontSize: 12, color: '#111' },
  button: {
    backgroundColor: '#111',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default BookingPanel;


