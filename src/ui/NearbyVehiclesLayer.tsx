import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { Marker, Region } from 'react-native-maps';
import { getRouteBetween } from '../utils/geo';

type Vehicle = {
  id: string;
  type: 'car' | 'scooter' | 'auto';
  latitude: number;
  longitude: number;
  path: { latitude: number; longitude: number }[];
  pathIndex: number;
};

type Props = {
  center: Region;
  count?: number;
};

/**
 * NearbyVehiclesLayer renders a cloud of lightweight markers (cars/scooters)
 * around the given center and makes them drift slightly to feel alive.
 */
const NearbyVehiclesLayer: React.FC<Props> = ({ center, count = 12 }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Seed initial positions around the center and request a short road path for each
  useEffect(() => {
    let isCancelled = false;
    async function seed() {
      const seeded: Vehicle[] = [];
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2;
        const r = 0.004 + (i % 5) * 0.001; // ~100-400m
        const lat = center.latitude + r * Math.sin(angle);
        const lng = center.longitude + r * Math.cos(angle);
        const destLat = center.latitude + (r + 0.002) * Math.sin(angle + Math.PI / 3);
        const destLng = center.longitude + (r + 0.002) * Math.cos(angle + Math.PI / 3);
        let path: { latitude: number; longitude: number }[] = [];
        try {
          const res = await getRouteBetween(`${lat},${lng}`, `${destLat},${destLng}`);
          path = res.coordinates;
        } catch (e) {
          path = [{ latitude: lat, longitude: lng }];
        }
        seeded.push({
          id: String(i),
          type: i % 3 === 0 ? 'scooter' : i % 3 === 1 ? 'car' : 'auto',
          latitude: path[0].latitude,
          longitude: path[0].longitude,
          path,
          pathIndex: 0,
        });
      }
      if (!isCancelled) setVehicles(seeded);
    }
    seed();
    return () => {
      isCancelled = true;
    };
  }, [center.latitude, center.longitude, count]);

  // Move along path and request a new short segment when reaching the end
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.path.length <= 1) return v;
        const nextIndex = Math.min(v.pathIndex + 1, v.path.length - 1);
        const next = v.path[nextIndex];
        const out: Vehicle = { ...v, latitude: next.latitude, longitude: next.longitude, pathIndex: nextIndex };
        // If reached end, ask for a new micro route continuing in a new random direction
        if (nextIndex >= v.path.length - 1) {
          const bearing = Math.random() * Math.PI * 2;
          const dLat = 0.002 * Math.sin(bearing);
          const dLng = 0.002 * Math.cos(bearing);
          const origin = `${next.latitude},${next.longitude}`;
          const dest = `${next.latitude + dLat},${next.longitude + dLng}`;
          getRouteBetween(origin, dest).then(res => {
            out.path = res.coordinates;
            out.pathIndex = 0;
          }).catch(() => {
            out.path = [next];
            out.pathIndex = 0;
          });
        }
        return out;
      }));
    }, 700);
    return () => clearInterval(timer);
  }, []);

  const iconFor = (t: Vehicle['type']) => (t === 'car' ? '🚗' : t === 'scooter' ? '🛵' : '🚕');

  return (
    <>
      {vehicles.map(v => (
        <Marker key={v.id} coordinate={{ latitude: v.latitude, longitude: v.longitude }} anchor={{ x: 0.5, y: 0.5 }} zIndex={10}>
          <Text style={{ fontSize: 18 }}>{iconFor(v.type)}</Text>
        </Marker>
      ))}
    </>
  );
};

export default NearbyVehiclesLayer;


