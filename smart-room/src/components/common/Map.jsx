import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export default function Map({ location }) {
  // Giả sử location là string địa chỉ, bạn cần convert thành lat/lng
  // Hoặc backend trả về trực tiếp lat/lng
  const center = {
    lat: 10.762622,  // Default to HCMC
    lng: 106.660172
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}
