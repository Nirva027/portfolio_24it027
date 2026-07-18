import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

function NotFound() {
  return (
    <div className="page-container animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="glass-card not-found-card" style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}>
        <div className="not-found-icon-wrapper">
          <Compass className="not-found-icon" size={64} />
        </div>
        
        <h1 className="not-found-title" style={{ fontSize: "5rem", fontWeight: 800, margin: "16px 0 8px 0" }}>
          <span className="gradient-text">404</span>
        </h1>
        
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Page Not Found</h2>
        
        <p style={{ marginBottom: "32px" }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>

        <Link to="/" className="btn btn-primary" style={{ width: "100%" }}>
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
