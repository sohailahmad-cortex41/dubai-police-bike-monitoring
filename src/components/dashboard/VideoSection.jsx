import React from "react";
import CameraWindow from "./CameraWindow";
import useWebSocket from "../../hooks/useWebSocket";

const VideoSection = () => {
  // Get video frames directly from WebSocket hooks
  const { videoFrame: frontVideoFrame } = useWebSocket('front');
  const { videoFrame: backVideoFrame } = useWebSocket('back');

  return (
    <div className="video-section">
      <CameraWindow cameraType="front" videoFrame={frontVideoFrame} />
      <CameraWindow cameraType="back" videoFrame={backVideoFrame} />
    </div>
  );
};

export default VideoSection;
