import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{isOpen ? 'Close menu' : 'Open menu'}</span>
        <span className="menu-toggle-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        className={`nav-links${isOpen ? ' nav-links-open' : ''}`}
        id="primary-navigation"
      >
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link-active' : ''}`
            }
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
