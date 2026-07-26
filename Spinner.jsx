import React from "react";

function Spinner({ message = "Loading...", fullPage = false }) {
  return (
    <div className={`spinner-container ${fullPage ? "full-page" : ""}`}>
      <div className="spinner" role="status" aria-label="loading"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}

export default Spinner;
