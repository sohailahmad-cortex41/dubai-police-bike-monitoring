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

      setStatus: (status) => set({ status }),
      setFrontLaneData: (data) => set({ frontLaneData: data }),
      setBackLaneData: (data) => set({ backLaneData: data }),
      setFrontGPSData: (data) => set({ frontGPSData: data }),
      setBackGPSData: (data) => set({ backGPSData: data }),

      resetState: () =>
        set({
          otp: null,
          storeData: null,
        }),
    }),
    {
      name: "app-store", // Key used in localStorage
    }
  )
);
