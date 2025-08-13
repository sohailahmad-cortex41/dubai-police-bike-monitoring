import React from "react";
import { useAppStore } from "../../../store/appStore";

const DashboardHeader = () => {
  const status = useAppStore((state) => state.status);
  return (
    <header className="dashboard-header">
      <div className="logo-section">
        <i
          className="fas fa-helicopter"
          style={{ color: "#00ff88", fontSize: "1.5em" }}
        ></i>
        <h1>Dubai Police Motorcycle Monitoring</h1>
      </div>
      <div className="status-section">
        <div className="connection-indicator">
          <div
            className={`status-dot ${
              status?.front || status?.back ? "connected" : "disconnected"
            }`}
            id="connectionDot"
          ></div>
          <span id="connectionText">
            {status?.front || status?.back ? "Connected" : "Disconnected"}
          </span>
        </div>
        {/* <div style={{ fontSize: "0.9em", opacity: 0.7 }}>
          <i className="fas fa-clock"></i>
          <span id="currentTime"></span>
        </div> */}
      </div>
    </header>
  );
};

export default DashboardHeader;
