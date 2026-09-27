// client/src/components/Loader.jsx
// Purpose: Loading spinner component

import React from "react";
import "./Loader.css";

/**
 * Loader Component
 * @param {string} message - Optional loading message
 * @param {string} size - 'sm', 'md', or 'lg'
 */
function Loader({ message = "Loading...", size = "md" }) {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-car">🚗</div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
}

export default Loader;