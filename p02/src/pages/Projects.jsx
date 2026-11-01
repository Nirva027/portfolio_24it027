const projects = [
  {
    number: '01',
    title: 'Student Portfolio',
    description:
      'A responsive portfolio built with React, reusable components, and a focus on clear visual design.',
    tools: 'React · Vite · CSS',
  },
  {
    number: '02',
    title: 'Task Manager',
    description:
      'A learning project exploring how thoughtful interfaces can make everyday tasks easier to organize.',
    tools: 'JavaScript · Web',
  },
];

function Projects() {
  return (
    <section className="route-page" aria-labelledby="projects-title">
      <div className="page-heading">
        <p className="eyebrow">A FEW THINGS I’VE MADE</p>
        <h1 id="projects-title">
          Selected <span>projects.</span>
        </h1>
        <p className="page-intro">
          Small steps, useful ideas, and plenty of learning along the way.
        </p>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article className="project-card" key={project.number}>
            <span className="project-number">{project.number}</span>
            <div className="project-details">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <span className="project-tools">{project.tools}</span>
            </div>
            <span className="project-mark" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
