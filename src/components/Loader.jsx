import React from "react";
import { ClipLoader } from "react-spinners";

const Loader = ({
  loading = false,
  size = 60,
  color = "#000",
  overlayColor = "bg-gray-800/50",
}) => {
  if (!loading) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-50 ${overlayColor} flex items-center justify-center`}
    >
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Loader;
