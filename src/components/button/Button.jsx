// components/Button.js
import React from "react";
import "./Button.css"; // Make sure path is correct

const Button = ({
  label,
  onClick,
  disabled,
  style,
  googleButton,
  className = "",
  size = "default", // default size
  type,
}) => {
  return (
    <button
      className={`custom-button ${size} ${disabled ? "button-disabled" : ""
        } ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      type={type}
    >
      {googleButton && (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
          alt="Google Logo"
          className="google-logo"
          width={20}
        />
      )}
      {label}
    </button>
  );
};

export default Button;
