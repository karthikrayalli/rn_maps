import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Marker, Region } from 'react-native-maps';

type Props = {
  seed: number;
  center: Region;
};

const VehicleMarker: React.FC<Props> = ({ seed, center }) => {
  const progress = useRef(new Animated.Value(0)).current; // 0..1 looping
  const radius = 0.02 + (seed % 5) * 0.003;
  const [coord, setCoord] = useState({ latitude: center.latitude, longitude: center.longitude });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 14000 + (seed % 4) * 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();
    const sub = progress.addListener(({ value }) => {
      const theta = value * Math.PI * 2; // radians
      const latitude = center.latitude + radius * Math.sin(theta);
      const longitude = center.longitude + radius * 1.2 * Math.cos(theta);
      setCoord({ latitude, longitude });
    });
    return () => {
      loop.stop();
      progress.removeListener(sub);
    };
  }, [progress, seed, center.latitude, center.longitude, radius]);

  return (
    <Marker coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.car} />
    </Marker>
  );
};

const styles = StyleSheet.create({
  car: {
    width: 18,
    height: 10,
    backgroundColor: '#111',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default VehicleMarker;


