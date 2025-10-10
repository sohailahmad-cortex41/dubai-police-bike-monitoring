import React from "react";
import CameraWindow from "./CameraWindow";
import { useAppStore } from "../../../store/appStore";

const VideoSection = () => {
  //getting rideData from global store
  const rideData = useAppStore((state) => state.rideData);

  console.log("Ride Data in VideoSection:", rideData);

  let rideVideos = rideData?.ride_videos ? JSON.parse(rideData.ride_videos) : null;
  return (
    <div className="video-section">
      <CameraWindow cameraType="front" />
      <CameraWindow cameraType="back" />
    </div>
  );
};

export default VideoSection;
