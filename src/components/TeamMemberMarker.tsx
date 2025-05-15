import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TeamMember } from '../types/social';
import { Marker } from 'react-native-maps';

interface TeamMemberMarkerProps {
  member: TeamMember;
  location: { lat: number; lng: number };
  onPress?: () => void;
}

const TeamMemberMarker: React.FC<TeamMemberMarkerProps> = ({ member, location, onPress }) => {
  // Výpočet, jak staré jsou polohy - pro určení průhlednosti markeru
  const locationAge = member.lastLocation 
    ? Math.min(Math.max(Date.now() - member.lastLocation.timestamp, 0) / (15 * 60 * 1000), 1)
    : 1; // 15 minut = plná průhlednost
  
  const opacity = 1 - locationAge * 0.7;

  return (
    <Marker
      coordinate={{
        latitude: location.lat,
        longitude: location.lng,
      }}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View style={[
          styles.markerBubble, 
          { opacity }, 
          member.isLeader ? styles.leaderMarker : null
        ]}>
          <Text style={styles.markerText}>{member.name.substring(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.markerName}>{member.name}</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4287f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  leaderMarker: {
    backgroundColor: '#f5a742',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  markerName: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
});

export default TeamMemberMarker;
