import React from 'react';
import { Marker } from 'react-map-gl';

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  onClick: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ latitude, longitude, onClick }) => {
  return (
    <Marker latitude={latitude} longitude={longitude}>
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <img src="/assets/marker-icon.png" alt="Location Marker" />
      </div>
    </Marker>
  );
};

export default LocationMarker;