declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export const PROVIDER_GOOGLE: string;

  export interface MapViewProps extends ViewProps {
    initialRegion?: Region;
    style?: StyleProp<ViewStyle>;
    provider?: any;
    showsCompass?: boolean;
    showsScale?: boolean;
    showsUserLocation?: boolean;
    zoomEnabled?: boolean;
    scrollEnabled?: boolean;
    zoomControlEnabled?: boolean; // Android only
    showsMyLocationButton?: boolean;
    toolbarEnabled?: boolean;
    pitchEnabled?: boolean;
    rotateEnabled?: boolean;
    showsBuildings?: boolean;
    customMapStyle?: any[];
    onRegionChangeComplete?: (region: Region) => void;
    onUserLocationChange?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
  }

  export default class MapView extends React.Component<MapViewProps> {
    fitToCoordinates(coordinates: { latitude: number; longitude: number }[], options?: any): void;
    animateCamera(camera: { center?: { latitude: number; longitude: number } }, opts?: { duration?: number }): void;
  }

  export interface MarkerProps {
    coordinate: { latitude: number; longitude: number };
    anchor?: { x: number; y: number };
    children?: React.ReactNode;
    title?: string;
    description?: string;
    pinColor?: string;
    zIndex?: number;
  }

  export class Marker extends React.Component<MarkerProps> {}

  export interface PolylineProps {
    coordinates: { latitude: number; longitude: number }[];
    strokeColor?: string;
    strokeWidth?: number;
  }

  export class Polyline extends React.Component<PolylineProps> {}
}


