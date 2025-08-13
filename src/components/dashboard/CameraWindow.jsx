import React, { useRef } from "react";
import { useAppStore } from "../../../store/appStore";

const CameraWindow = ({ cameraType }) => {
  const fileInputRef = useRef();
  const isFront = cameraType === "front";
  const color = isFront ? "#007bff" : "#28a745";
  const label = isFront ? "Front" : "Back";

  const status = useAppStore((state) => state.status);

  return (
    <div className="camera-window">
      <div className="camera-header">
        <div className="camera-title">
          <i className="fas fa-video" style={{ color }}></i>
          {label} Camera
        </div>
        <div
          className={`camera-status ${
            status?.[cameraType] ? "active" : "inactive"
          }`}
          id={`${cameraType}CameraStatus`}
        >
          {status?.[cameraType] ? "Active" : "Inactive"}
        </div>
      </div>
      <div className="video-display">
        <img
          id={`${cameraType}VideoStream`}
          className="video-stream"
          style={{ display: "none" }}
          alt={`${label} camera stream`}
        />
        <div className="video-placeholder" id={`${cameraType}VideoPlaceholder`}>
          <i
            className="fas fa-video"
            style={{ fontSize: "2em", marginBottom: 10, display: "block" }}
          ></i>
          {label} Camera Feed
          <br />
          <small>Waiting for video...</small>
        </div>
      </div>
      <div className="upload-section">
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
        >
          <i className="fas fa-upload"></i> Upload {label} Camera Video
        </button>
        <input
          type="file"
          id={`${cameraType}VideoFile`}
          accept="video/*,.ts,.m2ts,.mts"
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <div
          id={`${cameraType}SelectedFile`}
          style={{
            fontSize: "0.7em",
            color,
            marginTop: 5,
            textAlign: "center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default CameraWindow;
