function Header({ name }) {
  return (
    <header className="hero-header animate-fade-in">
      <div className="header-subtitle">Software Engineer & Creator</div>
      <h1 className="header-title">
        Hi, I'm <span className="gradient-text">{name}</span>
      </h1>
      <p className="header-tagline">
        Building high-performance, visually engaging, and accessible web solutions with modern technology.
      </p>
    </header>
  );
}

export default Header;