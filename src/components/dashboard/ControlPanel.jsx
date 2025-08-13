import React, { use } from "react";
import { useAppStore } from "../../../store/appStore";
import { postData } from "../../api/axios";

const ControlPanel = () => {
  const status = useAppStore((state) => state.status);
  const setStatus = useAppStore((state) => state.setStatus);

  const videoPath =
    "app/uploads/back_vlc-record-2025-07-25-17h07m24s-B20250502164251.ts-.ts";

  const handleStartCamera = async (type) => {
    setStatus({ ...status, [type]: true });

    const apiData = {
      file_path: videoPath,
      camera_type: type,
      detect_mode: "last",
    };

    const response = await postData("start-processing", apiData, "form");
    console.log(`Camera ${type} started:`, response);
  };

  const handleStopCamera = (type) => {
    setStatus({ ...status, [type]: false });
  };

  const handleStopAll = () => {
    setStatus({ front: false, back: false });
  };

  return (
    <div className="control-panel">
      {/* Motorcycle Monitoring Section */}
      <div className="panel-section">
        <div className="panel-title">
          <i className="fas fa-motorcycle"></i>
          Motorcycle Monitoring
        </div>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "0.9em",
              color: "#495057",
            }}
          >
            Active Cameras
          </label>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: 8,
                background: "rgba(0,123,255,0.1)",
                borderRadius: 6,
                border: "1px solid rgba(0,123,255,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8em",
                  color: "#007bff",
                  fontWeight: "bold",
                }}
              >
                Front
              </div>
              <div
                id="frontCameraCount"
                style={{ fontSize: "1.2em", color: "#007bff" }}
              >
                {status?.front ? 1 : 0}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: 8,
                background: "rgba(40,167,69,0.1)",
                borderRadius: 6,
                border: "1px solid rgba(40,167,69,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8em",
                  color: "#28a745",
                  fontWeight: "bold",
                }}
              >
                Back
              </div>
              <div
                id="backCameraCount"
                style={{ fontSize: "1.2em", color: "#28a745" }}
              >
                {status?.back ? 1 : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Controls Section */}
      <div className="panel-section">
        <div className="panel-title">
          <i className="fas fa-play-circle"></i>
          Monitoring Controls
        </div>
        <div className="control-buttons">
          <div className="camera-controls">
            <button
              id="startFrontBtn"
              onClick={() => handleStartCamera("front")}
              className="btn btn-primary btn-sm"
              disabled={status?.front}
            >
              <i className="fas fa-play"></i> Start Front Camera
            </button>
            <button
              id="stopFrontBtn"
              className="btn btn-danger btn-sm"
              disabled={!status?.front}
              onClick={() => handleStopCamera("front")}
            >
              <i className="fas fa-stop"></i> Stop
            </button>
          </div>
          <div className="camera-controls">
            <button
              id="startBackBtn"
              onClick={() => handleStartCamera("back")}
              className="btn btn-primary btn-sm"
              disabled={status?.back}
            >
              <i className="fas fa-play"></i> Start Back Camera
            </button>
            <button
              id="stopBackBtn"
              className="btn btn-danger btn-sm"
              disabled={!status?.back}
              onClick={() => handleStopCamera("back")}
            >
              <i className="fas fa-stop"></i> Stop
            </button>
          </div>
          <button
            id="stopAllBtn"
            className="btn btn-danger"
            disabled={!status?.front && !status?.back}
            onClick={handleStopAll}
          >
            <i className="fas fa-stop"></i> Stop All
          </button>
          {/* <button id="testVideoBtn" className="btn btn-info">
            <i className="fas fa-test-tube"></i> Test Video Stream
          </button> */}
          <button id="clearBtn" className="btn btn-secondary">
            <i className="fas fa-trash"></i> Clear Data
          </button>
        </div>
      </div>

      {/* Lane Detection Settings Section */}
      <div className="panel-section">
        <div className="panel-title">
          <i className="fas fa-road"></i>
          Lane Detection
        </div>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "0.9em",
              color: "#495057",
            }}
          >
            Detection Mode
          </label>
          <select
            id="detectionMode"
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 5,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <option value="last">Last (Furthest from Vehicle)</option>
            <option value="first">First (Closest to Vehicle)</option>
          </select>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "0.9em",
              color: "#495057",
            }}
          >
            Lane Confidence
          </label>
          <input
            type="range"
            id="laneConfidence"
            min="0.1"
            max="0.8"
            step="0.1"
            defaultValue="0.3"
            style={{ width: "100%", accentColor: "#007bff" }}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: 5,
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            <span id="laneConfidenceValue">0.3</span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="panel-section">
        <div className="panel-title">
          <i className="fas fa-cog"></i>
          Settings
        </div>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "0.9em",
              color: "#495057",
            }}
          >
            Path Smoothing
          </label>
          <input
            type="range"
            id="smoothingSlider"
            min="0"
            max="0.8"
            step="0.1"
            defaultValue="0.3"
            style={{ width: "100%", accentColor: "#28a745" }}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: 5,
              color: "#28a745",
              fontWeight: "bold",
            }}
          >
            <span id="smoothingValue">0.3</span>
          </div>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "0.9em",
              color: "#495057",
            }}
          >
            Speed Limit (km/h)
          </label>
          <input
            type="number"
            id="speedLimit"
            defaultValue="90"
            min="30"
            max="200"
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 5,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "rgba(255,255,255,0.8)",
              color: "#495057",
            }}
          />
        </div>
      </div>

      {/* Statistics Section */}
      <div className="panel-section">
        <div className="panel-title">
          <i className="fas fa-chart-line"></i>
          Session Stats
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.05)",
            padding: 15,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: "0.85em", color: "#495057" }}>
              Processing Time:
            </span>
            <span
              id="processingTime"
              style={{ color: "#28a745", fontWeight: "bold" }}
            >
              00:00
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: "0.85em", color: "#495057" }}>
              Violations:
            </span>
            <span
              id="totalViolations"
              style={{ color: "#dc3545", fontWeight: "bold" }}
            >
              0
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85em", color: "#495057" }}>
              Avg Speed:
            </span>
            <span
              id="avgSpeed"
              style={{ color: "#fd7e14", fontWeight: "bold" }}
            >
              -- km/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
