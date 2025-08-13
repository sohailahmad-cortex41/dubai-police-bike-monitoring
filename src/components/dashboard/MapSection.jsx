import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import RecenterMap from "./RecenterMap";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "../../../store/appStore";

const DEFAULT_POSITION = [25.0428, 55.2786]; // Example: Dubai`

const MapSection = () => {
  const [position, setPosition] = React.useState(DEFAULT_POSITION);
  const frontGPSData = useAppStore((state) => state.frontGPSData);
  const backGPSData = useAppStore((state) => state.backGPSData);

  useEffect(() => {
    if (frontGPSData) {
      setPosition([
        +frontGPSData?.latitude?.toFixed(4),
        +frontGPSData?.longitude?.toFixed(4),
      ]);
    } else if (backGPSData) {
      setPosition([
        +backGPSData?.latitude?.toFixed(4),
        +backGPSData?.longitude?.toFixed(4),
      ]);
    }
  }, [frontGPSData, backGPSData]);

  console.log("Current GPS Position:", position);

  return (
    <div className="map-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-map-marked-alt"></i>
          Real-Time GPS Tracking
        </div>
        <div style={{ fontSize: "0.8em", opacity: 0.7 }}>
          <i className="fas fa-satellite"></i>
          Live Tracking Active
        </div>
      </div>
      <MapContainer
        center={position}
        zoom={18}
        style={{
          minHeight: 500,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.1)",
          width: "100%",
        }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={position} />
        <Marker position={position}>
          <Popup>Current Position</Popup>
        </Marker>
      </MapContainer>
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#007bff" }}></div>
          <span>Normal Speed (≤90 km/h)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#dc3545" }}></div>
          <span>Speed Violation (&gt;90 km/h)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#28a745" }}></div>
          <span>Current Position</span>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
