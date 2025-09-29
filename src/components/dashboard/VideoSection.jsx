import React from "react";
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
