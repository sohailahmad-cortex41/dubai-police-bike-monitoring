// components/Input.js
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Input.css'; // Make sure the path is correct

const Input = ({ label = '', type = "text", name, value, onChange, error, showToggle, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShow = () => setShowPassword(prev => !prev);

  return (
    <div className="input-wrapper">
      <label className="input-label">{label}</label>
      <div className="input-container">
        <input
          name={name}
          type={showToggle && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder || `Enter your ${label?.toLowerCase()}`}
          className={`input-field ${error ? 'input-error-border' : ''}`}
        />
        {showToggle && (
          <span className="input-icon" onClick={toggleShow}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        )}
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export default Input;
