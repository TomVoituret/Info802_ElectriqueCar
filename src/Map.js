import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useEffect, useRef } from "react";

const MyMap = ({ routeGeometry, routeName }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Mettre à jour le centre de la carte lorsque routeGeometry change
    if (mapRef.current && routeGeometry && routeGeometry.features.length > 0) {
      const coordinates = routeGeometry.features[0].geometry.coordinates;
      if (coordinates.length > 0) {
        const middleIndex = Math.floor(coordinates.length / 2);
        const center = [
          coordinates[middleIndex][1],
          coordinates[middleIndex][0],
        ];
        mapRef.current.setView(center, 6);
      }
    }
  }, [routeGeometry]);

  return (
    <MapContainer
      ref={mapRef}
      center={[46.227638, 2.213749]}
      zoom={6}
      style={{
        height: "95vh",
        width: "100%",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {routeGeometry && (
        <React.Fragment>
          <Polyline
            positions={routeGeometry.features[0].geometry.coordinates.map(
              (coord) => [coord[1], coord[0]]
            )}
            color="blue"
          />
          {routeGeometry.metadata.query.coordinates.map((coord, index) => (
            <Marker
              key={index}
              position={[coord[1], coord[0]]}
              icon={L.icon({
                iconUrl:
                  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
                shadowUrl:
                  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              })}
            >
              <Popup>{routeName[index]}</Popup>
            </Marker>
          ))}
        </React.Fragment>
      )}
    </MapContainer>
  );
};

export default MyMap;
