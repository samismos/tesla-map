import { useMapEvents } from 'react-leaflet';

const MapEvent = ({ handleMapClick }) => {
  useMapEvents({
    click: handleMapClick,
  });

  return null;
};

export default MapEvent;
