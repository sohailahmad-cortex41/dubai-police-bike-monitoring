import React, { useRef, useState, useEffect } from "react";
import { useAppStore } from "../../../store/appStore";
import { postData } from "../../api/axios";
import { toast } from "react-hot-toast";
import Loader from "../Loader";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useWebSocket from "../../hooks/useWebSocket";


const CameraWindow = ({ cameraType, videoFrame }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isConnected } = useWebSocket(cameraType);

  const bikerId = searchParams.get("bikerId");
  const rideId = searchParams.get("rideId");

  const fileInputRef = useRef();
  const videoRef = useRef();
  const imgRef = useRef();
  const timeoutRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [hasVideoStream, setHasVideoStream] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const isFront = cameraType === "front";
  const color = isFront ? "#007bff" : "#28a745";
  const label = isFront ? "Front" : "Back";

  const status = useAppStore((state) => state.status);
  const frontCameraFilePath = useAppStore((state) => state.frontCameraFilePath);
  const backCameraFilePath = useAppStore((state) => state?.backCameraFilePath);
  const setFrontCameraFilePath = useAppStore(
    (state) => state.setFrontCameraFilePath
  );
  const setBackCameraFilePath = useAppStore(
    (state) => state.setBackCameraFilePath
  );
  const setRideId = useAppStore((state) => state.setRideId);  // Handle video frame updates from WebSocket
  useEffect(() => {
    // Only process video frames if camera status is active
    if (videoFrame && videoFrame.frame && videoFrame.camera_type === cameraType && status?.[cameraType]) {
      console.log(`📷 Received video frame for ${cameraType} camera:`, videoFrame.size, 'bytes');

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        // Clean up previous video URL to prevent memory leaks
        if (currentVideoUrl) {
          URL.revokeObjectURL(currentVideoUrl);
        }

        // Create object URL from blob
        const videoUrl = URL.createObjectURL(videoFrame.frame);
        setCurrentVideoUrl(videoUrl);
        setHasVideoStream(true);
        setStreamError("");

        // Update the img element with the new frame
        if (imgRef.current) {
          imgRef.current.src = videoUrl;
        }

        // Set timeout to show placeholder if no new frame received in 5 seconds
        timeoutRef.current = setTimeout(() => {
          console.warn(`⏰ No video frame received for ${cameraType} camera in 5 seconds`);
          setHasVideoStream(false);
          setStreamError("Video stream timeout - no frames received");
        }, 5000);

      } catch (error) {
        console.error(`❌ Error processing video frame for ${cameraType}:`, error);
        setHasVideoStream(false);
        setStreamError("Error processing video frame");
      }
    }
  }, [videoFrame, cameraType, currentVideoUrl, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
      }
    };
  }, [currentVideoUrl]);

  // Handle camera status changes
  useEffect(() => {
    if (!status?.[cameraType]) {
      // Camera is inactive, stop video stream and show appropriate message
      console.log(`📴 ${cameraType} camera status is inactive, stopping video stream`);
      setHasVideoStream(false);
      setStreamError("Camera is inactive");

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clean up current video URL
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
        setCurrentVideoUrl(null);
      }
    } else {
      // Camera is active, reset to waiting state
      console.log(`🔄 ${cameraType} camera status is active, ready for video frames`);
      setStreamError("Waiting for video frames...");
    }
  }, [status, cameraType, currentVideoUrl]);

  // Initialize video stream state
  useEffect(() => {
    setHasVideoStream(false);
    setStreamError(status?.[cameraType] ? "Waiting for video frames..." : "Camera is inactive");
    console.log(`🔄 Initializing video display for ${cameraType} camera`);
  }, [cameraType, status]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    setSelectedFile(file);
    setUploadError("");
    setUploading(true);
    setUploadedFileName("");
    try {
      if (rideId == 0 || rideId === "0") {
        const formData = new FormData();
        Array.from(e.target.files).forEach((file, idx) => {
          formData.append("files", file);
        });
        formData.append("camera_type", cameraType);
        if (bikerId) {
          formData.append("biker_id", bikerId);
        }
        // number plate 
        // for now generate a random number plate
        const randomPlate = `D${Math.floor(1000 + Math.random() * 9000)}XX`;
        formData.append("plate_number", randomPlate);
        formData.append("folder_name", randomPlate);
        const response = await postData("rides-with-videos/", formData, "form");

        setUploadedFileName(file.name);

        setRideId(response?.ride_id);

        if (cameraType === "front") {
          setFrontCameraFilePath(response?.files[0]?.rel_path);
        } else {
          setBackCameraFilePath(response?.files[0]?.rel_path);
        }
        toast.success(`${label} camera video uploaded successfully!`);
        navigate(`/dashboard?bikerId=${bikerId}&rideId=${response?.ride_id}`);
      } else {

        const formData = new FormData();
        Array.from(e.target.files).forEach((file, idx) => {
          formData.append("files", file);
        });
        formData.append("camera_type", cameraType);
        formData.append("ride_id", rideId);

        formData.append("folder_name", 'ride_' + rideId);
        const response = await postData("upload-multiple-videos/", formData, "form");

        setUploadedFileName(file.name);


        if (cameraType === "front") {
          setFrontCameraFilePath(response?.files[0]?.rel_path);
        } else {
          setBackCameraFilePath(response?.files[0]?.rel_path);
        }


        toast.success(`${label} camera video uploaded successfully!`);
        navigate(`/dashboard?bikerId=${bikerId}&rideId=${rideId}`);
      }

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
          {/* <div
            className={`connection-status ${isConnected ? "connected" : "disconnected"
              }`}
            title={`WebSocket ${isConnected ? "Connected" : "Disconnected"}`}
          >
            <i className={`fas ${isConnected ? "fa-wifi" : "fa-wifi"}`}
              style={{ color: isConnected ? "#28a745" : "#dc3545" }}></i>
          </div> */}
        </div>
      </div>
      <div className="video-display">
        <img
          ref={imgRef}
          id={`${cameraType}VideoStream`}
          className="video-stream"
          alt={`${label} camera stream`}
          style={{
            display: hasVideoStream ? "block" : "none",
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "8px",
            backgroundColor: "#000"
          }}
          onLoad={() => {
            console.log(`✅ Video frame displayed for ${cameraType} camera`);
          }}
          onError={() => {
            console.error(`❌ Error displaying video frame for ${cameraType} camera`);
            setHasVideoStream(false);
            setStreamError("Error displaying video frame");
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
            ) : (
              <span style={{ color: "#6c757d" }}>
                <i className="fas fa-plug"></i> Waiting for video frames...
              </span>
            )}
          </small>
          <button
            onClick={() => {
              console.log(`🔄 Resetting video display for ${cameraType} camera`);
              setHasVideoStream(false);
              setStreamError("Waiting for video frames...");

              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
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
            <i className="fas fa-refresh"></i> Reset
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
          {/* {uploadedFileName && !uploading && (
            <span>Uploaded: {uploadedFileName}</span>
          )} */}
          <span> {label == 'Front' ? frontCameraFilePath?.split("/").pop() : backCameraFilePath?.split("/").pop()}</span>
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
