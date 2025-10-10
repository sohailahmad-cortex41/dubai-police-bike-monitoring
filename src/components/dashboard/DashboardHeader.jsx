import React from "react";
import { useAppStore } from "../../../store/appStore";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/police.jpg"; // Adjust the path as necessary

const DashboardHeader = () => {
  const status = useAppStore((state) => state.status);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the dashboard page
  const isDashboardPage = location.pathname === '/dashboard';

  // Get bikerId from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const bikerId = urlParams.get('bikerId');

  // Handle navigation to rides page
  const handlePreviousRidesClick = () => {
    if (bikerId) {
      navigate(`/rides?bikerId=${bikerId}`);
    } else {
      navigate('/rides');
    }
  };

  return (
    <header className="dashboard-header">
      <div className="logo-section">
        {/* <i
          className="fas fa-helicopter"
          style={{ color: "#00ff88", fontSize: "1.5em" }}
        ></i> */}
        <img src={logo} width="40px" alt="dubai police logo" />
        <h1>Dubai Police Motorcycle Monitoring</h1>
      </div>



      <div className="status-section">
        {/* Previous Rides Button - Only show on dashboard page */}
        {isDashboardPage && (
          <button
            className="previous-rides-btn"
            onClick={handlePreviousRidesClick}
            title="View previous rides for this biker"
          >
            <i className="fas fa-history"></i>
            <span>Previous Rides</span>
          </button>
        )}

        {/* <div className="connection-indicator">
          <div
            className={`status-dot ${status?.front || status?.back ? "connected" : "disconnected"
              }`}
            id="connectionDot"
          ></div>
          <span id="connectionText">
            {status?.front || status?.back ? "Connected" : "Disconnected"}
          </span>
        </div> */}
        {/* <div style={{ fontSize: "0.9em", opacity: 0.7 }}>
          <i className="fas fa-clock"></i>
          <span id="currentTime"></span>
        </div> */}
      </div>
    </header>
  );
};

export default DashboardHeader;
