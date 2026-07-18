import { NavLink } from "react-router-dom";
import { Menu, X, Code } from "lucide-react";
import { useState } from "react";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <Code size={24} className="logo-icon" />
          <span className="logo-text gradient-text">Nirva.dev</span>
        </NavLink>

        {/* Desktop Menu */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Projects
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Contact
          </NavLink>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <div className={`nav-links-mobile ${isOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={toggleMenu} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>
          <NavLink to="/projects" onClick={toggleMenu} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Projects
          </NavLink>
          <NavLink to="/contact" onClick={toggleMenu} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
