
import React from 'react';

interface MapContainerProps {
  mapContainer: React.RefObject<HTMLDivElement>;
}

export const MapContainer: React.FC<MapContainerProps> = ({ mapContainer }) => {
  return (
    <div
      ref={mapContainer}
      // Mobil: fyll kartkortets höjd (LayoutContent ger Card h-[85dvh]) — låg 60vh gav annars ett
      // grått fält i botten där de flytande kontrollerna hamnade "över kartan" (Daniel). Desktop oförändrat.
      className="w-full h-[85dvh] min-h-[360px] md:h-[600px] rounded-b-lg relative z-0"
      style={{
        background: '#f8f9fa'
      }}
    />
  );
};
