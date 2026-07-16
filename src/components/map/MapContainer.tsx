
import React from 'react';

interface MapContainerProps {
  mapContainer: React.RefObject<HTMLDivElement>;
}

export const MapContainer: React.FC<MapContainerProps> = ({ mapContainer }) => {
  return (
    <div
      ref={mapContainer}
      className="w-full h-[60vh] min-h-[360px] md:h-[600px] rounded-b-lg relative z-0"
      style={{
        background: '#f8f9fa'
      }}
    />
  );
};
