import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng); // { lat, lng }
    },
  });
  return null;
}

function LocationPicker({ center, selected, onPick }) {
  return (
    <MapContainer center={center} zoom={14} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {selected && <Marker position={[selected.lat, selected.lng]} />}
    </MapContainer>
  );
}

export default LocationPicker;