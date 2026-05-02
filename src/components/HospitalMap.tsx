import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Hospital {
  name: string;
  distance: string;
  eta: string;
  lat: number;
  lng: number;
}

interface HospitalMapProps {
  userLocation: { lat: number; lng: number };
  hospitals: Hospital[];
}

const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({ userLocation, hospitals }) => {
  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10 z-0 relative">
      <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />
        
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
             <strong>Your Location</strong><br/>
             Waiting for ambulance...
          </Popup>
        </Marker>
        
        {hospitals.map((hospital, idx) => (
          <Marker key={idx} position={[hospital.lat, hospital.lng]}>
            <Popup>
              <strong>{hospital.name}</strong><br/>
              {hospital.distance} away<br/>
              ETA: {hospital.eta}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
