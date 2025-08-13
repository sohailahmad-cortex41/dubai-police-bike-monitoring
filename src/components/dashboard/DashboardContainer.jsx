import React from "react";
import VideoSection from "./VideoSection";
import ControlPanel from "./ControlPanel";
import MapSection from "./MapSection";
import DataPanel from "./DataPanel";

const DashboardContainer = () => (
  <div className="dashboard-container">
    <div style={{ gridArea: "control" }}>
      <ControlPanel />
    </div>
    <div style={{ gridArea: "video" }}>
      <VideoSection />
    </div>
    <div style={{ gridArea: "map" }}>
      <MapSection />
    </div>
    <div style={{ gridArea: "data" }}>
      <DataPanel />
    </div>
  </div>
);

export default DashboardContainer;
