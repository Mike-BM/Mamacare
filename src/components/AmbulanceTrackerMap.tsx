import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Alert {
  id: number;
  patient: string;
  severity: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
}

interface AmbulanceTrackerMapProps {
  hospitalLocation: { lat: number; lng: number };
  activeAlerts: Alert[];
}

const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export const AmbulanceTrackerMap: React.FC<AmbulanceTrackerMapProps> = ({ hospitalLocation, activeAlerts }) => {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer center={[hospitalLocation.lat, hospitalLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={hospitalLocation.lat} lng={hospitalLocation.lng} />
        
        {/* Hospital Location */}
        <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
          <Popup>
             <strong>City Medical Center</strong><br/>
             Dispatch Center
          </Popup>
        </Marker>
        
        {/* Active Emergencies */}
        {activeAlerts.map((alert) => (
          <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={emergencyIcon}>
            <Popup>
              <strong>{alert.patient}</strong> <span className="uppercase text-xs text-red-500 font-bold">({alert.severity})</span><br/>
              {alert.location}<br/>
              <em>Reported: {alert.time}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
