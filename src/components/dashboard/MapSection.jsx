import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import RecenterMap from "./RecenterMap";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "../../../store/appStore";

const DEFAULT_POSITION = [25.0428, 55.2786]; // Example: Dubai`

const MapSection = () => {
  const [position, setPosition] = React.useState(DEFAULT_POSITION);
  const frontGPSData = useAppStore((state) => state.frontGPSData);
  const backGPSData = useAppStore((state) => state.backGPSData);
  const speedLimit = useAppStore((state) => state.speedLimit);
  const gpsHistory = useAppStore((state) => state.gpsHistory);

  // Remove redundant GPS entries and process unique positions
  const uniqueGpsHistory = useMemo(() => {
    if (!gpsHistory || !Array.isArray(gpsHistory)) return [];

    const unique = [];
    const seen = new Set();

    gpsHistory.forEach(entry => {
      if (entry?.latitude && entry?.longitude) {
        // Create a unique key based on latitude and longitude (rounded to avoid floating point issues)
        const key = `${entry.latitude.toFixed(6)}_${entry.longitude.toFixed(6)}`;

        if (!seen.has(key)) {
          seen.add(key);
          unique.push({
            ...entry,
            lat: parseFloat(entry.latitude),
            lng: parseFloat(entry.longitude),
            speed: parseFloat(entry.speed) || 0
          });
        }
      }
    });

    return unique;
  }, [gpsHistory]);

  // Create polyline coordinates from GPS history
  const polylineCoordinates = useMemo(() => {
    return uniqueGpsHistory.map(point => [point.lat, point.lng]);
  }, [uniqueGpsHistory]);

  // Create colored line segments based on speed
  const coloredLineSegments = useMemo(() => {
    if (uniqueGpsHistory.length < 2) return [];

    const segments = [];

    for (let i = 0; i < uniqueGpsHistory.length - 1; i++) {
      const currentPoint = uniqueGpsHistory[i];
      const nextPoint = uniqueGpsHistory[i + 1];

      // Determine if each point is a speed violation
      const currentIsViolation = currentPoint.speed > 70;
      const nextIsViolation = nextPoint.speed > 70;

      // Determine line color based on both points
      let color;
      if (currentIsViolation && nextIsViolation) {
        // Both points are violations - Red line
        color = "#dc3545";
      } else if (!currentIsViolation && !nextIsViolation) {
        // Both points are normal speed - Green line
        color = "#28a745";
      } else {
        // Mixed: one violation, one normal - Blue line
        color = "#007bff";
      }

      segments.push({
        positions: [
          [currentPoint.lat, currentPoint.lng],
          [nextPoint.lat, nextPoint.lng]
        ],
        color: color,
        currentSpeed: currentPoint.speed,
        nextSpeed: nextPoint.speed
      });
    }

    return segments;
  }, [uniqueGpsHistory]);

  // Get the latest position from GPS history or fallback to current GPS data
  useEffect(() => {
    if (uniqueGpsHistory.length > 0) {
      const latestPoint = uniqueGpsHistory[uniqueGpsHistory.length - 1];
      setPosition([latestPoint.lat, latestPoint.lng]);
    } else if (frontGPSData?.latitude && frontGPSData?.longitude) {
      setPosition([
        +frontGPSData?.latitude?.toFixed(4),
        +frontGPSData?.longitude?.toFixed(4),
      ]);
    } else if (backGPSData?.latitude && backGPSData?.longitude) {
      setPosition([
        +backGPSData?.latitude?.toFixed(4),
        +backGPSData?.longitude?.toFixed(4),
      ]);
    } else {
      setPosition(DEFAULT_POSITION);
    }
  }, [uniqueGpsHistory, frontGPSData, backGPSData]);

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
        zoom={16}
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

        {/* Draw colored polyline segments based on speed */}
        {coloredLineSegments.map((segment, index) => (
          <Polyline
            key={`segment-${index}`}
            positions={segment.positions}
            color={segment.color}
            weight={4}
            opacity={0.8}
          />
        ))}

        {/* Render GPS history points with color based on speed */}
        {uniqueGpsHistory.map((point, index) => {
          const isSpeedViolation = point.speed > 70;
          const color = isSpeedViolation ? "#dc3545" : "#28a745"; // Red for >70, Green for ≤70

          return (
            <CircleMarker
              key={`${point.lat}-${point.lng}-${index}`}
              center={[point.lat, point.lng]}
              radius={6}
              color={color}
              fillColor={color}
              fillOpacity={0.8}
              weight={2}
            >
              <Popup>
                <div>
                  <strong>GPS Point {index + 1}</strong><br />
                  <strong>Speed:</strong> {point.speed.toFixed(1)} km/h<br />
                  <strong>Coordinates:</strong> {point.coordinates_text || `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`}<br />
                  {point.confidence && <><strong>Confidence:</strong> {(point.confidence * 100).toFixed(1)}%<br /></>}
                  <strong>Status:</strong> {isSpeedViolation ? "Speed Violation" : "Normal Speed"}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Current position marker (latest point) */}
        {uniqueGpsHistory.length > 0 && (
          <Marker position={position}>
            <Popup>
              <div>
                <strong>Current Position</strong><br />
                Latest GPS reading
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#28a745" }}></div>
          <span>Normal Speed Route (≤70 km/h)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#dc3545" }}></div>
          <span>Speed Violation Route (&gt;70 km/h)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#007bff" }}></div>
          <span>Transition (Mixed Speed)</span>
        </div>
        <div className="legend-item">
          <i className="fas fa-map-marker-alt" style={{ color: "#333", fontSize: "16px" }}></i>
          <span>Current Position</span>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
