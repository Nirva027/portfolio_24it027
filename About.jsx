function About({ university, department, domain }) {
  return (
    <section className="about-section glass-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="section-title">About Me</h2>
      <div className="about-content">
        <p>
          Hello! My name is <strong className="highlight-text">Nirva Hadvani</strong>. I am currently pursuing my studies at{" "}
          <span className="accent-text">{university}</span>, specifically in the{" "}
          <span className="accent-text">{department}</span> department, working towards my{" "}
          <span className="accent-text">{domain}</span>.
        </p>
        <p style={{ marginTop: "16px" }}>
          I am passionate about software engineering, web technologies, and solving real-world problems. I enjoy designing elegant user interfaces, crafting robust backend systems, and learning new tools and methodologies to continuously improve my craft.
        </p>
      </div>
    </section>
  );
}

export default About;