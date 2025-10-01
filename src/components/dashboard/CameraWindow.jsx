import React, { useRef, useState, useEffect } from "react";
import { useAppStore } from "../../../store/appStore";
import { postData } from "../../api/axios";
import { toast } from "react-hot-toast";
import Loader from "../Loader";
import useWebSocket from "../../hooks/useWebSocket";

const CameraWindow = ({ cameraType }) => {
  const fileInputRef = useRef();
  const videoRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [hasVideoStream, setHasVideoStream] = useState(false);
  const [streamError, setStreamError] = useState("");
  const isFront = cameraType === "front";
  const color = isFront ? "#007bff" : "#28a745";
  const label = isFront ? "Front" : "Back";

  const status = useAppStore((state) => state.status);
  const setFrontCameraFilePath = useAppStore(
    (state) => state.setFrontCameraFilePath
  );
  const setBackCameraFilePath = useAppStore(
    (state) => state.setBackCameraFilePath
  );

  // Get the video stream URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5455';
  const videoStreamUrl = `${API_BASE_URL}/viewer?camera_type=${cameraType}`;

  // WebSocket connection for video streaming (keep for status monitoring)
  const { isConnected, videoFrame, onVideoFrame } = useWebSocket(cameraType);

  // Initialize video stream state
  useEffect(() => {
    setHasVideoStream(false);
    setStreamError("");
    console.log(`🔄 Initializing video stream for ${cameraType} camera: ${videoStreamUrl}`);
  }, [cameraType, videoStreamUrl]);

  // Handle connection status changes
  useEffect(() => {
    if (!isConnected) {
      setHasVideoStream(false);
      setStreamError(isConnected === false ? "Connection lost" : "Connecting...");
    }
  }, [isConnected]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    setSelectedFile(file);
    setUploadError("");
    setUploading(true);
    setUploadedFileName("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("camera_type", cameraType);
      const response = await postData("upload-video/", formData, "form");

      setUploadedFileName(file.name);
      if (cameraType === "front") {
        setFrontCameraFilePath(response?.file_path);
      } else {
        setBackCameraFilePath(response?.file_path);
      }
      toast.success(`${label} camera video uploaded successfully!`);
    } catch (err) {
      const errorMsg =
        err?.message || "Failed to upload video. Please try again.";
      setUploadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="camera-window">
      <div className="camera-header">
        <div className="camera-title">
          <i className="fas fa-video" style={{ color }}></i>
          {label} Camera
        </div>
        <div className="camera-status-container">
          <div
            className={`camera-status ${status?.[cameraType] ? "active" : "inactive"
              }`}
            id={`${cameraType}CameraStatus`}
          >
            {status?.[cameraType] ? "Active" : "Inactive"}
          </div>
          <div
            className={`connection-status ${isConnected ? "connected" : "disconnected"
              }`}
            title={`WebSocket ${isConnected ? "Connected" : "Disconnected"}`}
          >
            <i className={`fas ${isConnected ? "fa-wifi" : "fa-wifi"}`}
              style={{ color: isConnected ? "#28a745" : "#dc3545" }}></i>
          </div>
        </div>
      </div>
      <div className="video-display">
        <iframe
          ref={videoRef}
          id={`${cameraType}VideoStream`}
          className="video-stream"
          src={videoStreamUrl}
          style={{
            display: hasVideoStream ? "block" : "none",
            width: "100%",
            height: "400px",
            border: "none",
            borderRadius: "8px"
          }}
          title={`${label} camera stream`}
          onLoad={(e) => {
            // Check if iframe actually loaded content
            try {
              const iframe = e.target;
              // Add a delay to check if content is actually loading
              setTimeout(() => {
                try {
                  // Check if iframe has content
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.trim() !== '') {
                    setHasVideoStream(true);
                    setStreamError("");
                    console.log(`✅ Video stream loaded for ${cameraType} camera`);
                  } else {
                    setHasVideoStream(false);
                    setStreamError("Video stream not available");
                    console.warn(`⚠️ Video stream not available for ${cameraType} camera`);
                  }
                } catch (accessError) {
                  // Cross-origin iframe access denied, try to detect by checking src
                  if (iframe.src === videoStreamUrl) {
                    // Give it a chance - might be working even if we can't access content
                    setTimeout(() => {
                      // If no explicit error after 3 seconds, assume it's working
                      if (!streamError && iframe.src === videoStreamUrl) {
                        setHasVideoStream(true);
                        setStreamError("");
                        console.log(`✅ Video stream assumed working for ${cameraType} camera`);
                      }
                    }, 3000);
                  } else {
                    setHasVideoStream(false);
                    setStreamError("Video stream not available");
                  }
                }
              }, 2000);
            } catch (error) {
              setHasVideoStream(false);
              setStreamError("Failed to access video stream");
              console.error(`❌ Error accessing video stream for ${cameraType} camera:`, error);
            }
          }}
          onError={() => {
            setHasVideoStream(false);
            setStreamError("Failed to load video stream");
            console.error(`❌ Failed to load video stream for ${cameraType} camera`);
          }}
        />
        <div
          className="video-placeholder"
          id={`${cameraType}VideoPlaceholder`}
          style={{
            display: hasVideoStream ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            backgroundColor: "black",
            borderRadius: "8px",
            color: "#6c757d"
          }}
        >
          <i
            className="fas fa-video"
            style={{ fontSize: "3em", marginBottom: "10px", color: color }}
          ></i>
          <div style={{ fontSize: "1.2em", fontWeight: "bold", marginBottom: "5px" }}>
            {label} Camera Feed
          </div>
          <small style={{ textAlign: "center", lineHeight: "1.4" }}>
            {streamError ? (
              <span style={{ color: "#dc3545" }}>
                <i className="fas fa-exclamation-triangle"></i> {streamError}
              </span>
            ) : isConnected ? (
              <span style={{ color: "#ffc107" }}>
                <i className="fas fa-spinner fa-spin"></i> Loading video stream...
              </span>
            ) : (
              <span style={{ color: "#6c757d" }}>
                <i className="fas fa-plug"></i> Connecting to camera...
              </span>
            )}
          </small>
          <button
            onClick={() => {
              console.log(`🔄 Retrying connection for ${cameraType} camera`);
              setHasVideoStream(false);
              setStreamError("");

              // Force iframe reload by changing src
              if (videoRef.current) {
                const currentSrc = videoRef.current.src;
                videoRef.current.src = "";
                setTimeout(() => {
                  videoRef.current.src = currentSrc;
                }, 100);
              }
            }}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: color,
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9em"
            }}
          >
            <i className="fas fa-refresh"></i> Retry Connection
          </button>
        </div>
      </div>
      <div className="upload-section">
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <i className="fas fa-upload"></i> Upload {label} Camera Video
        </button>
        <input
          type="file"
          id={`${cameraType}VideoFile`}
          accept="video/*,.ts,.m2ts,.mts"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div
          id={`${cameraType}SelectedFile`}
          style={{
            fontSize: "0.7em",
            color,
            marginTop: 5,
            textAlign: "center",
          }}
        >
          {uploading && "Uploading..."}
          {uploadedFileName && !uploading && (
            <span>Uploaded: {uploadedFileName}</span>
          )}
          {uploadError && (
            <span style={{ color: "#dc3545" }}>{uploadError}</span>
          )}
        </div>
      </div>
      {uploading && <Loader loading={uploading} />}
    </div>
  );
};

export default CameraWindow;
