import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      status: {
        front: false,
        back: false,
      },
      frontLaneData: null,
      backLaneData: null,
      frontGPSData: null,
      backGPSData: null,
      frontCameraFilePath: null,
      backCameraFilePath: null,
      speedLimit: 90,
      laneConfidence: 0.3,
      pathSmoothing: 0.3,
      detectionMode: "last",
      violationHistory: [],
      gpsHistory: [],
      ride_id: null,
      rideData: {},

      // Actions

      setStatus: (status) => set({ status }),
      setFrontLaneData: (data) => set({ frontLaneData: data }),
      setBackLaneData: (data) => set({ backLaneData: data }),
      setFrontGPSData: (data) => set({ frontGPSData: data }),
      setBackGPSData: (data) => set({ backGPSData: data }),
      setSpeedLimit: (limit) => set({ speedLimit: limit }),
      setLaneConfidence: (confidence) => set({ laneConfidence: confidence }),
      setPathSmoothing: (smoothing) => set({ pathSmoothing: smoothing }),
      setDetectionMode: (mode) => set({ detectionMode: mode }),
      setFrontCameraFilePath: (filePath) =>
        set({ frontCameraFilePath: filePath }),
      setBackCameraFilePath: (filePath) =>
        set({ backCameraFilePath: filePath }),
      addViolation: (violation) =>
        set((state) => ({
          violationHistory: [violation, ...state.violationHistory],
        })),
      clearViolations: () => set({ violationHistory: [] }),
      addGpsEntry: (entry) =>
        set((state) => ({
          gpsHistory: [...state.gpsHistory, entry],
        })),
      clearGpsHistory: () => set({ gpsHistory: [] }),
      setRideId: (id) => set({ ride_id: id }),
      setRideData: (data) => set({ rideData: data }),


      resetState: () =>
        set({
          gpsHistory: [],
          violationHistory: [],
          frontLaneData: null,
          backLaneData: null,
          frontGPSData: null,
          backGPSData: null,
          frontCameraFilePath: null,
          backCameraFilePath: null,
          ride_id: null
        }),
    }),
    {
      name: "app-store", // Key used in localStorage
    }
  )
);
