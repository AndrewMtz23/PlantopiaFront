import React from 'react';
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Ubicacion = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: 20.6539445,
    lng: -100.4241182
  };
  

  const markers = [
    { lat: 20.6539445, lng: -100.4241182, title: "UTEQ" },

  ];

  return (
    <section className="location-section container">
      <h2><FontAwesomeIcon icon={faMapMarkerAlt} /> Nuestras Ubicaciones</h2>
      <LoadScript googleMapsApiKey="AIzaSyA5LvY3kYfQ-L2dPGvf6AnUphjewMzjPQk">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
        >
          {markers.map((marker, index) => {
            const customMarkerIcon = {
              path: window.google?.maps?.SymbolPath?.CIRCLE || '',
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 10,
            };

            return (
              <Marker 
                key={index} 
                position={{ lat: marker.lat, lng: marker.lng }} 
                title={marker.title}
                icon={customMarkerIcon}
                label={{
                  text: marker.title,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              />
            );
          })}
        </GoogleMap>
      </LoadScript>
    </section>
  );
};

export default Ubicacion;
