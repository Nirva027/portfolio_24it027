function Skills({ skillList }) {
  return (
    <section className="skills-section glass-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <h2 className="section-title">Technical Expertise</h2>
      <p style={{ marginBottom: "24px" }}>
        Here are some of the key languages, frameworks, and tools I specialize in:
      </p>
      <div className="skills-grid">
        {skillList.map((skill) => (
          <div key={skill} className="skill-pill">
            <span className="skill-dot"></span>
            <span className="skill-name">{skill}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;