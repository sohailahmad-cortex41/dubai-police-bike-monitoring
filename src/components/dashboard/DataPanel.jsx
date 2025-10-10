import React, { useEffect } from "react";
import { useAppStore } from "../../../store/appStore";



const DataPanel = () => {
  const status = useAppStore((state) => state.status);
  const frontLaneData = useAppStore((state) => state.frontLaneData);
  const backLaneData = useAppStore((state) => state.backLaneData);
  const frontGPSData = useAppStore((state) => state.frontGPSData);
  const backGPSData = useAppStore((state) => state.backGPSData);
  const speedLimit = useAppStore((state) => state.speedLimit);
  const violationHistory = useAppStore((state) => state.violationHistory);

  // console.log("Front Lane Data:", frontLaneData);
  // console.log("Back Lane Data:", backLaneData);
  // console.log("Front GPS Data:", frontGPSData);
  // console.log("Back GPS Data:", backGPSData);

  // WebSocket connection (violations are handled automatically by the hook)


  return (
    <div className="data-panel">
      {/* Violation Alerts Card */}
      <div className="data-card">
        <div className="card-title">
          <i className="fas fa-exclamation-triangle"></i>
          Traffic Violations
        </div>
        <div
          id="violationsList"
          style={{ maxHeight: 150, overflowY: "auto", padding: 10 }}
        >
          {violationHistory.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6c757d", padding: 20 }}>
              <i
                className="fas fa-check-circle"
                style={{
                  fontSize: "1.5em",
                  marginBottom: 10,
                  display: "block",
                  color: "#28a745",
                }}
              ></i>
              No violations detected
            </div>
          ) : (
            violationHistory.map((violation, index) => (
              <div key={index} style={{ marginBottom: 8, backgroundColor: "#f8d7da", padding: 8, borderRadius: 4 }}>
                <strong style={{ color: "#e74c3c" }}>

                  {violation?.violation_type?.replace(/_/g, " ").toUpperCase()}
                </strong>
                <div style={{ fontSize: "0.9em", opacity: 0.8 }}>
                  {violation.description || "No additional details."}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Speed Monitor Card */}
      <div className="data-card speed-card">
        <div className="card-title">
          <i className="fas fa-tachometer-alt"></i>
          Speed Monitor
        </div>
        <div className="speed-display">
          <div className="speed-value" id="currentSpeed">
            {frontGPSData?.speed || backGPSData?.speed || "--"} km/h
          </div>
          <div className="speed-limit">
            Speed Limit: <span id="displaySpeedLimit">{speedLimit}</span> km/h
          </div>
        </div>
      </div>

      {/* Lane Detection Card */}
      <div className="data-card">
        <div className="card-title">
          <i className="fas fa-road"></i>
          Lane Detection
        </div>
        <div className="data-content">
          <div className="data-item">
            <span className="data-label">Vehicle Position:</span>
            <span className="data-value" id="vehiclePosition">
              {frontLaneData?.vehicle_status ||
                backLaneData?.vehicle_status ||
                "Unknown"}
            </span>
          </div>

          {/* <div className="data-item">
            <span className="data-label">Left Lane:</span>
            <span className="data-value" id="leftLane">
              {frontLaneData?.left_class_name ||
                backLaneData?.left_class_name ||
                "None"}
            </span>
          </div> */}

          {/* <div className="data-item">
            <span className="data-label">Right Lane:</span>
            <span className="data-value" id="rightLane">
              {frontLaneData?.right_class_name ||
                backLaneData?.right_class_name ||
                "None"}
            </span>
          </div> */}
          <div className="data-item">
            <span className="data-label">Time in Lane:</span>
            <span className="data-value" id="timeInLane">
              {frontLaneData?.current_lane_duration ||
                backLaneData?.current_lane_duration ||
                "0"}
              {" seconds"}
            </span>
          </div>
          <div className="data-item">
            <span className="data-label">Motion Status:</span>
            <span className="data-value" id="motionStatus">
              {frontLaneData?.motion_confirmed_state ||
                backLaneData?.motion_confirmed_state ||
                "Unknown"}
            </span>
          </div>
        </div>
      </div>



      {/* GPS Coordinates Card */}
      <div className="data-card gps-card">
        <div className="card-title">
          <i className="fas fa-crosshairs"></i>
          GPS Coordinates
        </div>
        <div className="coordinates-grid">
          <div className="coord-item">
            <div className="coord-label">Latitude</div>
            <div className="coord-value" id="latitude">
              {frontGPSData?.latitude?.toFixed(4) ||
                backGPSData?.latitude?.toFixed(4) ||
                "--"}
            </div>
          </div>
          <div className="coord-item">
            <div className="coord-label">Longitude</div>
            <div className="coord-value" id="longitude">
              {frontGPSData?.longitude?.toFixed(4) ||
                backGPSData?.longitude?.toFixed(4) ||
                "--"}
            </div>
          </div>
        </div>
        <div
          id="locationAccuracy"
          style={{ textAlign: "center", fontSize: "0.85em", opacity: 0.7 }}
        >
          {/* {!(frontGPSData?.latitude || backGPSData?.latitude) &&
            "Waiting for GPS data..."} */}
        </div>
      </div>

      {/* Processing Log Card */}
      {/* <div className="data-card log-card">
        <div className="card-title">
          <i className="fas fa-list-alt"></i>
          Processing Log
        </div>
        <div className="log-content" id="logContent">
          <div style={{ color: "#3498db" }}>
            System ready. Upload a video file to begin processing.
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default DataPanel;
