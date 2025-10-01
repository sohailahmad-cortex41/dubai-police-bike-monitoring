import React from "react";
import VideoSection from "./VideoSection";
import ControlPanel from "./ControlPanel";
import MapSection from "./MapSection";
import DataPanel from "./DataPanel";

const DashboardContainer = () => (
  <div className="dashboard-container">
    {/* Left Section - Control Panel */}
    <div className="dashboard-left">
      <ControlPanel />
    </div>

    {/* Right Section - Video + Bottom */}
    <div className="dashboard-right">
      {/* Video Section - Full width on top */}
      <VideoSection />

      {/* Bottom Section - Map + Data side by side */}
      <div className="dashboard-bottom">
        <MapSection />
        <DataPanel />
      </div>
    </div>
  </div>
);

export default DashboardContainer;
