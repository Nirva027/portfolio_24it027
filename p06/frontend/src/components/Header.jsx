import { Link } from 'react-router-dom';

function Header({ name, role }) {
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label={`${name} portfolio home`}>
        NH<span>.</span>
      </Link>
      <p className="header-role">{role}</p>
      <span className="availability">
        <span className="availability-dot" />
        Open to learning
      </span>
    </header>
  );
}

export default Header;
