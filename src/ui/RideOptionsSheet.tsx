import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const RideOptionsSheet: React.FC<Props> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Choose a trip</Text>
        <Option name="Auto" eta="1 min" price="₹78" />
        <Option name="Bike" eta="2 min" price="₹54" />
        <Option name="Sedan" eta="3 min" price="₹142" />
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

const Option = ({ name, eta, price }: { name: string; eta: string; price: string }) => (
  <View style={styles.option}>
    <Text style={styles.optionName}>{name}</Text>
    <View style={{ flex: 1 }} />
    <Text style={styles.eta}>{eta}</Text>
    <Text style={styles.price}>{price}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: '#111',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1b1b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  optionName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  eta: { color: '#9aa0a6', marginRight: 10 },
  price: { color: '#fff', fontWeight: '700' },
  close: { alignSelf: 'center', marginTop: 10, padding: 10 },
  closeText: { color: '#9aa0a6' },
});

export default RideOptionsSheet;


