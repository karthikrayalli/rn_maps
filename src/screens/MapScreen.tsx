import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, useColorScheme, Platform, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import type { EdgeInsets } from 'react-native-safe-area-context';
import BookingPanel from '../ui/BookingPanel';
import { getCityDefaultRegion, getRouteBetween } from '../utils/geo';
import VehicleMarker from '../ui/VehicleMarker.tsx';
import RideOptionsSheet from '../ui/RideOptionsSheet';
import NearbyVehiclesLayer from '../ui/NearbyVehiclesLayer';

type Props = { safeAreaInsets: EdgeInsets };

const MapScreen: React.FC<Props> = ({ safeAreaInsets }) => {
  const isDark = useColorScheme() === 'dark';
  const mapRef = useRef<MapView | null>(null);

  const [pickup, setPickup] = useState<{ lat: number; lng: number; title?: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; title?: string } | null>(null);

  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  const initialRegion: Region = useMemo(() => getCityDefaultRegion('bengaluru'), []);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  // Driver (person coming to user) state
  const [driverCoord, setDriverCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [driverPath, setDriverPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [driverTotals, setDriverTotals] = useState<{ distanceM: number; durationS: number }>({ distanceM: 0, durationS: 0 });
  const [driverIndex, setDriverIndex] = useState(0);

  // Simulated vehicle that travels along the route once a search is made
  const [carCoord, setCarCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => {
    if (routeCoords.length === 0) {
      setCarCoord(null);
      return;
    }
    let idx = 0;
    setCarCoord(routeCoords[0]);
    const timer = setInterval(() => {
      idx = Math.min(idx + 1, routeCoords.length - 1);
      const next = routeCoords[idx];
      setCarCoord(next);
      if (idx >= routeCoords.length - 1) {
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [routeCoords]);

  // Animate driver along its path and compute remaining ETA/distance
  const [driverRemaining, setDriverRemaining] = useState<{ meters: number; seconds: number }>({ meters: 0, seconds: 0 });
  useEffect(() => {
    if (driverPath.length === 0) return;
    let idx = 0;
    setDriverCoord(driverPath[0]);
    setDriverRemaining({ meters: driverTotals.distanceM, seconds: driverTotals.durationS });
    const stepMs = 700;
    const timer = setInterval(() => {
      idx = Math.min(idx + 1, driverPath.length - 1);
      const next = driverPath[idx];
      setDriverCoord(next);
      const ratio = driverPath.length <= 1 ? 0 : 1 - idx / (driverPath.length - 1);
      setDriverRemaining({ meters: Math.round(driverTotals.distanceM * ratio), seconds: Math.round(driverTotals.durationS * ratio) });
      if (idx >= driverPath.length - 1) clearInterval(timer);
    }, stepMs);
    return () => clearInterval(timer);
  }, [driverPath, driverTotals.distanceM, driverTotals.durationS]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        zoomEnabled
        scrollEnabled
        zoomControlEnabled
        showsCompass
        showsScale={true}
        showsMyLocationButton={true}
        toolbarEnabled={true}
        pitchEnabled
        rotateEnabled
        showsBuildings
        customMapStyle={isDark ? darkMap : undefined}
        onRegionChangeComplete={setRegion}
        onUserLocationChange={(e) => {
          if (userLoc) return;
          const { latitude, longitude } = e.nativeEvent.coordinate;
          const here = { latitude, longitude };
          setUserLoc(here);
          setPickup({ lat: here.latitude, lng: here.longitude, title: 'Current location' });
          // Center the camera once when we first get location
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([here], {
              edgePadding: { top: 80, left: 80, right: 80, bottom: 80 },
              animated: true,
            });
          }
        }}
      >
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
            pinColor={'#0a84ff'}
            title={'Pickup'}
            description={pickup.title}
          />
        )}
        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
            pinColor={'#34c759'}
            title={'Destination'}
            description={dropoff.title}
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor={isDark ? '#ffffff' : '#111111'}
          />
        )}

        {/* Driver to pickup route */}
        {driverPath.length > 0 && (
          <Polyline
            coordinates={driverPath}
            strokeWidth={4}
            strokeColor={'#3b82f6'}
          />
        )}

        {/* Nearby vehicles only when not on an active route */}
        {/* <NearbyVehiclesLayer center={region} /> */}

        {/* Active car moving along the route */}
        {carCoord && (
          <Marker coordinate={carCoord} anchor={{ x: 0.5, y: 0.5 }} zIndex={999}>
            <View style={styles.carDot} />
          </Marker>
        )}

        {/* Moving driver marker */}
        {driverCoord && (
          <Marker coordinate={driverCoord} anchor={{ x: 0.5, y: 0.5 }} zIndex={998}>
            <View style={styles.driverDot} />
          </Marker>
        )}
      </MapView>

      {/* ETA chip for driver-to-pickup */}
      {driverPath.length > 0 && (
        <View style={styles.etaChip}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.etaDot} />
            <View>
              <Text style={styles.etaTitle}>Driver to pickup</Text>
              <Text style={styles.etaValue}>{Math.max(1, Math.round(driverRemaining.seconds / 60))} min • {(driverRemaining.meters / 1000).toFixed(1)} km</Text>
            </View>
          </View>
        </View>
      )}

      <BookingPanel
        insets={safeAreaInsets}
        currentLocation={userLoc}
        onPickupChange={(text) => {
          // If user types coordinates "lat,lng" update pickup marker live
          const match = text.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            setPickup({ lat, lng, title: 'Custom pickup' });
          }
        }}
        onSearch={async (origin, destination) => {
          try {
            const res = await getRouteBetween(origin, destination);
            setRouteCoords(res.coordinates);
            setPickup({ lat: res.start.latitude, lng: res.start.longitude, title: res.start.address });
            setDropoff({ lat: res.end.latitude, lng: res.end.longitude, title: res.end.address });
            // Also spawn a driver ~600m away and route it to the pickup
            const angle = Math.random() * Math.PI * 2;
            const r = 0.006; // ~600m
            const dlat = r * Math.sin(angle);
            const dlng = r * Math.cos(angle);
            const driverStart = { latitude: res.start.latitude + dlat, longitude: res.start.longitude + dlng };
            setDriverCoord(driverStart);
            const dRes = await getRouteBetween(`${driverStart.latitude},${driverStart.longitude}`, `${res.start.latitude},${res.start.longitude}`);
            setDriverPath(dRes.coordinates);
            setDriverTotals({ distanceM: dRes.distanceMeters, durationS: dRes.durationSeconds });
            setDriverIndex(0);
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(res.coordinates, {
                edgePadding: {
                  top: 120 + safeAreaInsets.top,
                  left: 80 + safeAreaInsets.left,
                  right: 80 + safeAreaInsets.right,
                  bottom: 160 + safeAreaInsets.bottom,
                },
                animated: true,
              });
            }
          } catch (e) {
            // no-op for now
          }
        }}
      />

      {/* <RideOptionsSheet visible={routeCoords.length > 0} onClose={() => {}} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  carDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffcc00',
    borderWidth: 2,
    borderColor: '#111',
  },
  driverDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pin: {},
  pinPickup: {},
  pinDrop: {},
  etaChip: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  etaDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb', marginRight: 8 },
  etaTitle: { color: '#9aa0a6', fontSize: 12 },
  etaValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// Minimal dark style similar to Uber
const darkMap = [
  { elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa0a6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#183a1d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b3d5c' }] },
];

export default MapScreen;


