function Footer({ email }) {
  return (
    <footer className="site-footer">
      <p>Made with curiosity and React.</p>
      <a href={`mailto:${email}`}>{email}</a>
      <span>© {new Date().getFullYear()} Nirva Hadvani</span>
    </footer>
  );
}

export default Footer;
