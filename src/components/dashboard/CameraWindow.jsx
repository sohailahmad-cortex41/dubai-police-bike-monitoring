import React, { useRef, useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { postData } from "../../api/axios";
import { toast } from "react-hot-toast";
import Loader from "../Loader";

const CameraWindow = ({ cameraType }) => {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
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
