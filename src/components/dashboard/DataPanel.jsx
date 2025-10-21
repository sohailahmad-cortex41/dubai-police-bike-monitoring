import React, { useEffect, useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { useLocation } from 'react-router-dom';
import { getData } from '../../api/axios';
import { FaShieldAlt, FaChartBar, FaListAlt, FaTimes, FaCheckCircle, FaClock, FaExclamationTriangle, FaVideo } from 'react-icons/fa';



const DataPanel = () => {
  const status = useAppStore((state) => state.status);
  const frontLaneData = useAppStore((state) => state.frontLaneData);
  const backLaneData = useAppStore((state) => state.backLaneData);
  const frontGPSData = useAppStore((state) => state.frontGPSData);
  const backGPSData = useAppStore((state) => state.backGPSData);
  const speedLimit = useAppStore((state) => state.speedLimit);
  const violationHistory = useAppStore((state) => state.violationHistory);

  // Violations state
  const [violationsData, setViolationsData] = useState([]);
  const [showViolationsModal, setShowViolationsModal] = useState(false);
  const [violationsLoading, setViolationsLoading] = useState(false);

  const location = useLocation();

  // Get rideId from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const rideId = urlParams.get('rideId');

  // Fetch violations data
  const getViolations = async (rideId) => {
    if (!rideId || rideId === '0') return [];

    try {
      setViolationsLoading(true);
      const response = await getData(`violations/?ride_id=${rideId}`);
      if (response?.status === 'success') {
        return response.violations || [];
      }
    } catch (error) {
      console.error(`Error fetching violations for ride ${rideId}:`, error);
    } finally {
      setViolationsLoading(false);
    }
    return [];
  };

  // Get violation statistics
  const getViolationStats = (violations) => {
    const stats = {};
    violations.forEach(violation => {
      if (!stats[violation.violation_type]) {
        stats[violation.violation_type] = 0;
      }
      stats[violation.violation_type]++;
    });
    return {
      overall: stats,
      total: violations.length
    };
  };

  // Format violation type for display
  const formatViolationType = (type) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get violation type color
  const getViolationTypeColor = (type) => {
    switch (type) {
      case 'fast_lane_violation': return '#e74c3c';
      case 'lane_switch_violation': return '#f39c12';
      case 'speed_violation': return '#8e44ad';
      default: return '#95a5a6';
    }
  };

  // Get violation type icon
  const getViolationTypeIcon = (type) => {
    switch (type) {
      case 'fast_lane_violation': return '🚗';
      case 'lane_switch_violation': return '↔️';
      case 'speed_violation': return '⚡';
      default: return '⚠️';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get video-wise statistics
  const getVideoWiseStats = (violations) => {
    const videoStats = {};
    violations.forEach(violation => {
      if (!videoStats[violation.video_id]) {
        videoStats[violation.video_id] = {};
      }
      if (!videoStats[violation.video_id][violation.violation_type]) {
        videoStats[violation.video_id][violation.violation_type] = 0;
      }
      videoStats[violation.video_id][violation.violation_type]++;
    });
    return videoStats;
  };

  // Get video type name (Front/Back)
  const getVideoTypeName = (videoId) => {
    // Simple logic to determine if it's front or back camera
    // You can enhance this based on your video naming convention
    const videoIdNum = parseInt(videoId);
    if (videoIdNum % 2 === 1) {
      return 'Front Camera';
    } else {
      return 'Back Camera';
    }
  };

  // Fetch violations on component mount and every 3 second if cameras are active
  useEffect(() => {
    if (!rideId || rideId === "0") {
      setViolationsData([]);
      return;
    }

    // Always fetch once initially
    getViolations(rideId).then(setViolationsData);

    // Only set up interval if any camera is active
    if (status.front || status.back) {
      const interval = setInterval(() => {
        getViolations(rideId).then(setViolationsData);
      }, 3000);

      return () => clearInterval(interval);
    }

    // Cleanup if no interval created
    return () => { };
  }, [rideId, status.front, status.back]);


  // console.log("Front Lane Data:", frontLaneData);
  // console.log("Back Lane Data:", backLaneData);
  // console.log("Front GPS Data:", frontGPSData);
  // console.log("Back GPS Data:", backGPSData);

  // WebSocket connection (violations are handled automatically by the hook)


  return (
    <div className="data-panel">
      {/* Violation Alerts Card */}
      <div className="data-card" >
        <div className="card-title">
          <i className="fas fa-exclamation-triangle"></i>
          Traffic Violations
          {violationsLoading && <span className="loading-indicator">...</span>}
        </div>

        {rideId && rideId !== '0' ? (
          <div>
            {/* Enhanced Violations Summary */}
            {violationsData.length > 0 ? (
              <div className="violations-compact-summary">
                {/* Total Violations */}
                <div className="violations-total-compact">
                  <span className="total-number-compact">{violationsData.length}</span>
                  <span className="total-label-compact">Total Violations</span>
                </div>

                {/* Compact Category Chips */}
                <div className="violations-chips-compact">
                  {Object.entries(getViolationStats(violationsData).overall).map(([type, count]) => (
                    <span
                      key={type}
                      className="violation-chip-compact"
                      style={{ backgroundColor: getViolationTypeColor(type) }}
                    >
                      {getViolationTypeIcon(type)} {formatViolationType(type)}: {count}
                    </span>
                  ))}
                </div>

                {/* Compact View Details Button */}
                <button
                  className="view-details-mini-btn"
                  onClick={() => setShowViolationsModal(true)}
                >
                  <FaListAlt />
                  View Details
                </button>
              </div>
            ) : (
              <div className="no-violations-compact" >
                <FaCheckCircle className="no-violations-icon-compact" />
                <span className="no-violations-text-compact">No violations detected</span>
              </div>
            )}
          </div>
        ) : (
          <div
            id="violationsList"
            style={{ maxHeight: 150, overflowY: "auto", padding: 10 }}
          >
            {violationHistory.length === 0 ? (
              <div style={{ textAlign: "center", color: "#6c757d", padding: 20 }}>
                <i
                  className="fas fa-check-circle"
                  style={{
                    fontSize: "1.5em",
                    marginBottom: 10,
                    display: "block",
                    color: "#28a745",
                  }}
                ></i>
                No violations detected
              </div>
            ) : (
              violationHistory.map((violation, index) => (
                <div key={index} style={{ marginBottom: 8, backgroundColor: "#f8d7da", padding: 8, borderRadius: 4 }}>
                  <strong style={{ color: "#e74c3c" }}>
                    {violation?.violation_type?.replace(/_/g, " ").toUpperCase()}
                  </strong>
                  <div style={{ fontSize: "0.9em", opacity: 0.8 }}>
                    {violation.description || "No additional details."}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Speed Monitor Card */}
      <div className="data-card speed-card">
        <div className="card-title">
          <i className="fas fa-tachometer-alt"></i>
          Speed Monitor
        </div>
        <div className="speed-display">
          <div className="speed-value" id="currentSpeed">
            {frontGPSData?.speed || backGPSData?.speed || "--"} km/h
          </div>
          <div className="speed-limit">
            Speed Limit: <span id="displaySpeedLimit">{speedLimit}</span> km/h
          </div>
        </div>
      </div>

      {/* Lane Detection Card */}
      <div className="data-card">
        <div className="card-title">
          <i className="fas fa-road"></i>
          Lane Detection
        </div>
        <div className="data-content">
          <div className="data-item">
            <span className="data-label">Vehicle Position:</span>
            <span className="data-value" id="vehiclePosition">
              {frontLaneData?.vehicle_status ||
                backLaneData?.vehicle_status ||
                "Unknown"}
            </span>
          </div>

          {/* <div className="data-item">
            <span className="data-label">Left Lane:</span>
            <span className="data-value" id="leftLane">
              {frontLaneData?.left_class_name ||
                backLaneData?.left_class_name ||
                "None"}
            </span>
          </div> */}

          {/* <div className="data-item">
            <span className="data-label">Right Lane:</span>
            <span className="data-value" id="rightLane">
              {frontLaneData?.right_class_name ||
                backLaneData?.right_class_name ||
                "None"}
            </span>
          </div> */}
          <div className="data-item">
            <span className="data-label">Time in Lane:</span>
            <span className="data-value" id="timeInLane">
              {frontLaneData?.current_lane_duration ||
                backLaneData?.current_lane_duration ||
                "0"}
              {" seconds"}
            </span>
          </div>
          <div className="data-item">
            <span className="data-label">Motion Status:</span>
            <span className="data-value" id="motionStatus">
              {frontLaneData?.motion_confirmed_state ||
                backLaneData?.motion_confirmed_state ||
                "Unknown"}
            </span>
          </div>
        </div>
      </div>



      {/* GPS Coordinates Card */}
      <div className="data-card gps-card">
        <div className="card-title">
          <i className="fas fa-crosshairs"></i>
          GPS Coordinates
        </div>
        <div className="coordinates-grid">
          <div className="coord-item">
            <div className="coord-label">Latitude</div>
            <div className="coord-value" id="latitude">
              {frontGPSData?.latitude?.toFixed(4) ||
                backGPSData?.latitude?.toFixed(4) ||
                "--"}
            </div>
          </div>
          <div className="coord-item">
            <div className="coord-label">Longitude</div>
            <div className="coord-value" id="longitude">
              {frontGPSData?.longitude?.toFixed(4) ||
                backGPSData?.longitude?.toFixed(4) ||
                "--"}
            </div>
          </div>
        </div>
        <div
          id="locationAccuracy"
          style={{ textAlign: "center", fontSize: "0.85em", opacity: 0.7 }}
        >
          {/* {!(frontGPSData?.latitude || backGPSData?.latitude) &&
            "Waiting for GPS data..."} */}
        </div>
      </div>

      {/* Processing Log Card */}
      {/* <div className="data-card log-card">
        <div className="card-title">
          <i className="fas fa-list-alt"></i>
          Processing Log
        </div>
        <div className="log-content" id="logContent">
          <div style={{ color: "#3498db" }}>
            System ready. Upload a video file to begin processing.
          </div>
        </div>
      </div> */}

      {/* Violations Modal */}
      {showViolationsModal && violationsData.length > 0 && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowViolationsModal(false)}>
          <div className="violations-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <FaShieldAlt />
                Violations for Ride {rideId}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowViolationsModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="violations-modal-content">
              {/* Overall Summary */}
              <div className="violations-summary">
                <h3 className="summary-title">
                  <FaChartBar />
                  Overall Summary
                </h3>
                <div className="summary-stats">
                  <div className="total-violations">
                    <span className="stat-number">{violationsData.length}</span>
                    <span className="stat-label">Total Violations</span>
                  </div>
                  <div className="violation-types-summary">
                    {Object.entries(getViolationStats(violationsData).overall).map(([type, count]) => (
                      <div key={type} className="type-summary">
                        <span className="type-icon">{getViolationTypeIcon(type)}</span>
                        <span className="type-name">{formatViolationType(type)}</span>
                        <span className="type-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video-wise breakdown */}
              <div className="video-violations-breakdown">
                <h3 className="breakdown-title">
                  <FaVideo />
                  Video-wise Breakdown
                </h3>
                {Object.entries(getVideoWiseStats(violationsData)).map(([videoId, violations]) => (
                  <div key={videoId} className="video-violation-card">
                    <div className="video-card-header">
                      <FaVideo />
                      <span className="video-card-name">{getVideoTypeName(videoId)}</span>
                      <span className="video-violation-total">
                        {Object.values(violations).reduce((a, b) => a + b, 0)} violations
                      </span>
                    </div>
                    <div className="video-violation-types">
                      {Object.entries(violations).map(([type, count]) => (
                        <div key={type} className="violation-type-item">
                          <span className="violation-icon">{getViolationTypeIcon(type)}</span>
                          <span className="violation-name">{formatViolationType(type)}</span>
                          <span className="violation-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed violations list */}
              <div className="detailed-violations">
                <h3 className="details-title">
                  <FaListAlt />
                  Detailed Violations ({violationsData.length})
                </h3>
                <div className="violations-table">
                  <div className="table-header">
                    <span>ID</span>
                    <span>Video</span>
                    <span>Type</span>
                    <span>Video Time</span>
                    <span>Occurred At</span>
                    <span>Detected At</span>
                  </div>
                  <div className="table-body">
                    {violationsData.map((violation) => (
                      <div key={violation.id} className="violation-row">
                        <span className="violation-id">#{violation.id}</span>
                        <span className="violation-video">
                          <FaVideo className="video-type-icon" />
                          {getVideoTypeName(violation.video_id)}
                        </span>
                        <span className="violation-type">
                          <span
                            className="type-badge"
                            style={{ backgroundColor: getViolationTypeColor(violation.violation_type) }}
                          >
                            {getViolationTypeIcon(violation.violation_type)}
                            {formatViolationType(violation.violation_type)}
                          </span>
                        </span>
                        <span className="violation-video-time">{violation.violation_video_time}</span>
                        <span className="violation-occur-time">
                          {violation.violation_occur_time ?
                            formatDate(violation.violation_occur_time) :
                            'N/A'
                          }
                        </span>
                        <span className="violation-created-at">
                          {formatDate(violation.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPanel;
