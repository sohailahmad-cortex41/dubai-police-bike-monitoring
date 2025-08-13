import React, { useEffect } from "react";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardContainer from "./dashboard/DashboardContainer";
import "../styles/dashboard.css";
import { useAppStore } from "../../store/appStore";
import { getData } from "../api/axios";

const Dashboard = () => {
  const status = useAppStore((state) => state.status);

  const setFrontLaneData = useAppStore((state) => state.setFrontLaneData);
  const setBackLaneData = useAppStore((state) => state.setBackLaneData);
  const setFrontGPSData = useAppStore((state) => state.setFrontGPSData);
  const setBackGPSData = useAppStore((state) => state.setBackGPSData);

  const fetchData = async () => {
    try {
      if (status?.front) {
        const [laneResponse, gpsResponse] = await Promise.all([
          getData("lane-data?camera_type=front"),
          getData("ocr-data?camera_type=front"),
        ]);
        laneResponse?.lane_data && setFrontLaneData(laneResponse.lane_data);
        gpsResponse?.gps_data && setFrontGPSData(gpsResponse.gps_data);
      }

      if (status?.back) {
        const [laneResponse, gpsResponse] = await Promise.all([
          getData("lane-data?camera_type=back"),
          getData("ocr-data?camera_type=back"),
        ]);
        laneResponse?.lane_data && setBackLaneData(laneResponse.lane_data);
        gpsResponse?.gps_data && setBackGPSData(gpsResponse.gps_data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    let intervalId;

    if (status?.front || status?.back) {
      // fetch immediately once
      fetchData();

      // then repeat every 3 seconds
      intervalId = setInterval(fetchData, 1000);
    }

    // cleanup when status changes or component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status]); // runs when status changes

  return (
    <div className="dashboard-root">
      <DashboardHeader />
      <DashboardContainer />
    </div>
  );
};

export default Dashboard;
