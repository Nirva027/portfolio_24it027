import { useEffect, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Spinner from '../components/Spinner.jsx';

const REPOSITORIES_URL =
  'https://api.github.com/users/Nirva027/repos?sort=updated&per_page=100';

function Projects() {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(REPOSITORIES_URL, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            throw new Error(
              'GitHub is temporarily limiting requests. Please wait a moment and try again.'
            );
          }
          if (response.status === 404) {
            throw new Error('The configured GitHub profile could not be found.');
          }
          throw new Error(
            `GitHub returned an error (${response.status}). Please try again.`
          );
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('GitHub returned an unexpected repository list.');
        }

        setRepositories(data);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Unable to load GitHub repositories.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRepositories();
    return () => controller.abort();
  }, [retryCount]);

  return (
    <section className="route-page" aria-labelledby="projects-title">
      <div className="page-heading">
        <p className="eyebrow">OPEN SOURCE, RECENTLY UPDATED</p>
        <h1 id="projects-title">
          GitHub <span>projects.</span>
        </h1>
        <p className="page-intro">
          A live look at public repositories from my GitHub profile.
        </p>
      </div>

      {isLoading && <Spinner label="Loading GitHub repositories..." />}

      {!isLoading && error && (
        <ErrorMessage
          message={error}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}

      {!isLoading && !error && repositories.length === 0 && (
        <p className="empty-projects">No public repositories were found.</p>
      )}

      {!isLoading && !error && repositories.length > 0 && (
        <div className="project-list">
          {repositories.map((repository, index) => (
            <article className="project-card" key={repository.id}>
              <span className="project-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="project-details">
                <h2>
                  <a
                    className="repository-link"
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repository.name}
                  </a>
                </h2>
                <p>
                  {repository.description || 'No description provided yet.'}
                </p>
                <div className="repository-meta">
                  {repository.language && (
                    <span className="project-tools">{repository.language}</span>
                  )}
                  <span className="repository-stars">
                    ★ {repository.stargazers_count}
                  </span>
                </div>
              </div>
              <a
                className="project-mark"
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${repository.name} on GitHub`}
              >
                ↗
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
