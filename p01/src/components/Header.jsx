function Header({ name, role }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label={`${name} portfolio home`}>
        NH<span>.</span>
      </a>
      <p className="header-role">{role}</p>
      <span className="availability">
        <span className="availability-dot" />
        Open to learning
      </span>
    </header>
  );
}

export default Header;
