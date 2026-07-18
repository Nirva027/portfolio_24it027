import { Folder, ExternalLink } from "lucide-react";

const GithubIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function Projects() {
  const projectList = [
    {
      title: "Interactive Dev Portfolio",
      description: "A modern, high-performance developer portfolio featuring glassmorphic components, fluid layout routing, and custom CSS-based dark theme variables.",
      tags: ["React", "React Router", "CSS3", "Vite"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Task & Sprint Flow Board",
      description: "A real-time collaborative workspace featuring interactive kanban boards, drag-and-drop lists, and productivity stats dashboard integrations.",
      tags: ["React", "Node.js", "Express", "MongoDB"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Sorting & Path Algorithm Visualizer",
      description: "An educational interactive suite showing sorting and pathfinding animations (Dijkstra, A*, Merge Sort) running at customized playback speeds.",
      tags: ["JavaScript", "Canvas API", "React", "CSS3"],
      github: "https://github.com",
      live: "https://example.com"
    }
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: "40px" }}>
        <h1 className="section-title"><span className="gradient-text">Featured Projects</span></h1>
        <p style={{ marginTop: "8px" }}>A curated collection of digital experiences, applications, and tools I have engineered.</p>
      </div>

      <div className="projects-grid">
        {projectList.map((project, index) => (
          <div key={index} className="glass-card project-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="project-card-header">
              <Folder className="project-icon" size={32} />
              <div className="project-links">
                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" className="project-link-icon">
                  <GithubIcon size={20} />
                </a>
                <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label="Live Demo" className="project-link-icon">
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
            
            <h3 className="project-card-title">{project.title}</h3>
            <p className="project-card-description">{project.description}</p>
            
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
