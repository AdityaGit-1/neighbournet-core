import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function LocalityMap({ center, posts = [], onMapClick }) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {posts.map((post) => (
        <Marker
          key={post._id}
          position={[post.location.coordinates[1], post.location.coordinates[0]]}
        >
          <Popup>
            <strong>{post.title}</strong>
            <br />
            {post.category}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default LocalityMap;