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

  // useEffect(() => {
  //   let intervalId;

  //   if (status?.front || status?.back) {
  //     fetchData();

  //     intervalId = setInterval(fetchData, 1000);
  //   }

  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [status]); 

  return (
    <div className="dashboard-root">
      <DashboardHeader />
      <DashboardContainer />
    </div>
  );
};

export default Dashboard;
