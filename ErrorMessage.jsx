import React from "react";
import { AlertTriangle } from "lucide-react";

function ErrorMessage({ title = "Something went wrong", message = "An error occurred while loading projects.", onRetry }) {
  return (
    <div className="error-container">
      <div className="error-card glass-card">
        <div className="error-icon-wrapper">
          <AlertTriangle size={32} />
        </div>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-danger" style={{ marginTop: "8px" }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
