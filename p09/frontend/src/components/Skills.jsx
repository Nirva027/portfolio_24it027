function Skills({ items }) {
  return (
    <section className="skills-section" id="skills" aria-labelledby="skills-title">
      <div className="section-heading">
        <p className="eyebrow">WHAT I WORK WITH</p>
        <h2 id="skills-title">Tools in my toolkit</h2>
      </div>
      <ul className="skills-list">
        {items.map((item, index) => (
          <li className="skill-item" key={item}>
            <span className="skill-index">{String(index + 1).padStart(2, '0')}</span>
            <span>{item}</span>
            <span className="skill-arrow" aria-hidden="true">↗</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
