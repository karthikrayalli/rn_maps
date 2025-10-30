export function getCityDefaultRegion(city: 'bengaluru') {
  // Center around Bengaluru city
  return {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };
}

// Directions API integration
import { GOOGLE_MAPS_API_KEY } from '../config';

export type DirectionsResult = {
  coordinates: { latitude: number; longitude: number }[];
  start: { latitude: number; longitude: number; address: string };
  end: { latitude: number; longitude: number; address: string };
  distanceMeters: number;
  durationSeconds: number;
};

export async function getRouteBetween(origin: string, destination: string): Promise<DirectionsResult> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.routes?.length) throw new Error('No route found');
  const route = json.routes[0];
  const leg = route.legs[0];
  const points = decodePolyline(route.overview_polyline.points);
  return {
    coordinates: points.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
    start: { latitude: leg.start_location.lat, longitude: leg.start_location.lng, address: leg.start_address },
    end: { latitude: leg.end_location.lat, longitude: leg.end_location.lng, address: leg.end_address },
    distanceMeters: leg.distance?.value ?? 0,
    durationSeconds: leg.duration?.value ?? 0,
  };
}

// Polyline decoder (Google polyline algorithm)
function decodePolyline(str: string): [number, number][] {
  let index = 0; let lat = 0; let lng = 0; const coordinates: [number, number][] = [];
  while (index < str.length) {
    let b; let shift = 0; let result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    shift = 0; result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    coordinates.push([lat / 1e5, lng / 1e5]);
  }
  return coordinates;
}


