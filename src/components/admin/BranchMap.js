import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5935, -100.3903];
const DEFAULT_ZOOM = 12;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const parsePosition = (latitud, longitud) => {
  const latitude = Number(latitud);
  const longitude = Number(longitud);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
};

const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
};

const MapAutoFocus = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
};

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(event) {
      onPick?.({
        latitud: Number(event.latlng.lat.toFixed(8)),
        longitud: Number(event.latlng.lng.toFixed(8)),
      });
    },
  });

  return null;
};

const BranchMap = ({
  branches = [],
  selectedPosition = null,
  onPickLocation,
  interactivePicker = false,
  className = "",
}) => {
  const validBranches = branches
    .map((branch) => ({
      ...branch,
      position: parsePosition(branch.latitud, branch.longitud),
    }))
    .filter((branch) => branch.position);
  const pickerPosition = selectedPosition
    ? parsePosition(selectedPosition.latitud, selectedPosition.longitud)
    : null;
  const center = pickerPosition || validBranches[0]?.position || DEFAULT_CENTER;

  return (
    <div className={`branch-map ${className}`}>
      <MapContainer center={center} zoom={DEFAULT_ZOOM} scrollWheelZoom className="branch-map__canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <MapAutoFocus position={pickerPosition} />
        {interactivePicker && <LocationPicker onPick={onPickLocation} />}

        {validBranches.map((branch) => (
          <Marker key={branch.id} position={branch.position} icon={markerIcon}>
            <Popup>
              <strong>{branch.nombre}</strong>
              <br />
              {branch.direccion}
              <br />
              Tel. {branch.telefono}
            </Popup>
          </Marker>
        ))}

        {pickerPosition && (
          <Marker position={pickerPosition} icon={markerIcon}>
            <Popup>Ubicacion seleccionada</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default BranchMap;
