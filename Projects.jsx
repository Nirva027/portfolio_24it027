import React, { useState, useEffect, useCallback } from "react";
import { Folder, ExternalLink, Search } from "lucide-react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

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

const FEATURED_PROJECTS = [
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

function Projects() {
  const [activeTab, setActiveTab] = useState("featured");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls for interactive simulation/Github username
  const [githubUser, setGithubUser] = useState("nirvahadvani");
  const [githubSearchInput, setGithubSearchInput] = useState("nirvahadvani");
  const [simulateError, setSimulateError] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (activeTab === "featured") {
      // Simulate network request latency
      const timer = setTimeout(() => {
        if (simulateError) {
          setError("Failed to simulate fetching of featured projects. Try disabling 'Simulate Fetch Error'.");
          setProjects([]);
        } else {
          setProjects(FEATURED_PROJECTS);
          setError(null);
        }
        setLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      // Fetch from Github Repos API
      try {
        const response = await fetch(
          `https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=6`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`GitHub user '${githubUser}' not found. Please verify the spelling.`);
          } else if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Please try again later.");
          } else {
            throw new Error(`Failed to fetch repositories (${response.statusText}).`);
          }
        }
        const data = await response.json();
        
        if (data.length === 0) {
          throw new Error(`GitHub user '${githubUser}' has no public repositories.`);
        }

        const mapped = data.map((repo) => ({
          title: repo.name,
          description: repo.description || "No description provided for this repository.",
          tags: [repo.language, ...(repo.topics || [])].filter(Boolean),
          github: repo.html_url,
          live: repo.homepage || repo.html_url
        }));
        
        setProjects(mapped);
        setError(null);
      } catch (err) {
        setError(err.message || "An unexpected error occurred while fetching GitHub repositories.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
  }, [activeTab, githubUser, simulateError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleGithubSearch = (e) => {
    e.preventDefault();
    if (githubSearchInput.trim() !== "") {
      setGithubUser(githubSearchInput.trim());
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: "32px" }}>
        <h1 className="section-title">
          <span className="gradient-text">Featured Projects</span>
        </h1>
        <p style={{ marginTop: "8px" }}>
          A curated collection of digital experiences, applications, and tools I have engineered.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="projects-nav-tabs" role="tablist" aria-label="Projects Sources">
        <button
          className={`tab-btn ${activeTab === "featured" ? "active" : ""}`}
          onClick={() => setActiveTab("featured")}
          role="tab"
          aria-selected={activeTab === "featured"}
        >
          Featured
        </button>
        <button
          className={`tab-btn ${activeTab === "github" ? "active" : ""}`}
          onClick={() => setActiveTab("github")}
          role="tab"
          aria-selected={activeTab === "github"}
        >
          GitHub Repos
        </button>
      </div>

      {/* Interactive controls */}
      {activeTab === "featured" ? (
        <div className="error-sim-banner">
          <span>Dev Control Panel: Test loading state & error screens here.</span>
          <label className="sim-toggle-label">
            <input
              type="checkbox"
              className="sim-checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
            />
            Simulate Fetch Error
          </label>
        </div>
      ) : (
        <div className="github-search-container glass-card">
          <p className="github-search-intro">
            Explore live public repositories. Currently showing repos for:{" "}
            <span className="github-username-display">@{githubUser}</span>
          </p>
          <form onSubmit={handleGithubSearch} className="github-search-form">
            <input
              type="text"
              className="form-control"
              placeholder="Enter GitHub username..."
              value={githubSearchInput}
              onChange={(e) => setGithubSearchInput(e.target.value)}
              aria-label="GitHub username search query"
            />
            <button type="submit" className="btn btn-primary" aria-label="Search repositories">
              <Search size={18} />
              Fetch
            </button>
          </form>
        </div>
      )}

      {/* Conditional Rendering using Spinner and ErrorMessage */}
      {loading ? (
        <Spinner message={`Fetching ${activeTab === "featured" ? "featured projects" : `repos for @${githubUser}`}...`} />
      ) : error ? (
        <ErrorMessage
          title={activeTab === "featured" ? "Load Simulation Failed" : "GitHub Sync Failed"}
          message={error}
          onRetry={loadProjects}
        />
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div
              key={`${project.title}-${index}`}
              className="glass-card project-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="project-card-header">
                <Folder className="project-icon" size={32} />
                <div className="project-links">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Repository"
                    className="project-link-icon"
                  >
                    <GithubIcon size={20} />
                  </a>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Live Demo"
                    className="project-link-icon"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>

              <h3 className="project-card-title">{project.title}</h3>
              <p className="project-card-description">{project.description}</p>

              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
