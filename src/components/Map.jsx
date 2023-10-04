import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../context/CittiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./button";
import { useUrlPosition } from "../hooks/useUrlPosition";
function Map() {
  const {
    position: geoPosition,
    isLoading: geoIsLoading,
    getPosition,
  } = useGeolocation();
  const [lat, lng] = useUrlPosition();
  const [position, setPosition] = useState([40, 0]);
  const { filteredCities, nearestCity } = useCities();
  const redOptions = { color: "red" };

  useEffect(
    function () {
      if (lat && lng) setPosition([lat, lng]);
    },
    [lat, lng]
  );

  useEffect(
    function () {
      if (geoPosition.lng) setPosition([geoPosition.lat, geoPosition.lng]);
    },
    [geoPosition]
  );

  return (
    <div className={styles.mapContainer}>
      {!geoPosition.lat && (
        <Button type="position" onClick={getPosition}>
          {geoIsLoading ? "Loading..." : "Use Your Location"}
        </Button>
      )}
      {geoPosition.lat && (
        <Button type="position" onClick={() => nearestCity(geoPosition)}>
          Nearest City
        </Button>
      )}
      <MapContainer
        className={styles.mapContainer}
        center={position}
        zoom={1}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredCities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              {city.emoji} <br /> {city.cityName}
            </Popup>
          </Marker>
        ))}
        {geoPosition.lat && (
          <CircleMarker
            center={[geoPosition.lat, geoPosition.lng]}
            pathOptions={redOptions}
            radius={5}
          >
            <Popup>Present Location</Popup>
          </CircleMarker>
        )}
        <ChangeView position={position} zoom={13} />
        <DetectMapClick />
      </MapContainer>
    </div>
  );
}

function ChangeView({ position, zoom }) {
  const map = useMap();
  map.setView(position, zoom);
}

function DetectMapClick() {
  const navigate = useNavigate();
  useMapEvent({
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  });
}

export default Map;
