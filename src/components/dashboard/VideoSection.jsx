import React from "react";
import OptimizedCameraWindow from "./OptimizedCameraWindow";
import CameraWindow from "./CameraWindow";

const VideoSection = () => {
  return (
    <div className="video-section">
      <CameraWindow cameraType="front" />
      <CameraWindow cameraType="back" />
    </div>
  );
};

export default VideoSection;
