import { useMap } from "react-leaflet";
import { useEffect } from "react";

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

export default RecenterMap;
