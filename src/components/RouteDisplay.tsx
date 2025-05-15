import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Polyline, Marker } from 'react-native-maps';
import { Route } from '../types/social';
import { formatDistance, formatDuration } from '../utils/formatters';

interface RouteDisplayProps {
  route: Route;
  isActive?: boolean;
  onClose?: () => void;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({ 
  route, 
  isActive = false, 
  onClose 
}) => {
  if (!route || route.points.length === 0) return null;

  const startPoint = route.points[0];
  const endPoint = route.points[route.points.length - 1];

  const formattedDistance = formatDistance(route.totalDistance);
  const formattedDuration = formatDuration(route.duration);

  // Příprava bodů pro Polyline
  const coordinates = route.points.map(point => ({
    latitude: point.lat,
    longitude: point.lng,
  }));

  return (
    <>
      {/* Cesta zobrazená jako čára na mapě */}
      <Polyline
        coordinates={coordinates}
        strokeWidth={5}
        strokeColor={isActive ? '#4287f5' : '#8ab4ff'}
        lineJoin="round"
      />

      {/* Označení počátečního bodu */}
      <Marker
        coordinate={{
          latitude: startPoint.lat,
          longitude: startPoint.lng,
        }}
        pinColor="green"
        title="Start"
        description={`${new Date(startPoint.timestamp).toLocaleTimeString()}`}
      />

      {/* Označení koncového bodu */}
      <Marker
        coordinate={{
          latitude: endPoint.lat,
          longitude: endPoint.lng,
        }}
        pinColor="red"
        title="Konec"
        description={`${new Date(endPoint.timestamp).toLocaleTimeString()}`}
      />

      {/* Informační panel o trase */}
      {isActive && onClose && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelContent}>
            <View>
              <Text style={styles.routeName}>{route.name}</Text>
              <Text style={styles.routeStats}>
                {formattedDistance} • {formattedDuration} • {route.points.length} bodů
              </Text>
              {route.isImported && (
                <Text style={styles.importedLabel}>Importovaná trasa</Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
  },
  infoPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  routeStats: {
    fontSize: 14,
    color: '#666',
  },
  importedLabel: {
    color: '#4287f5',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#333',
  },
});

export default RouteDisplay;
