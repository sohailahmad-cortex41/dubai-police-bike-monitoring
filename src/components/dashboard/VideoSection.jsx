import React from "react";
import CameraWindow from "./CameraWindow";

const VideoSection = () => (
  <div className="video-section">
    <CameraWindow cameraType="front" />
    <CameraWindow cameraType="back" />
  </div>
);

export default VideoSection;
