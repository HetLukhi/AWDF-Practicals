import React from "react";
import { useState, useEffect } from 'react';
import Loading from '../component/Loading';
import Error from '../component/Error';

// GitHub username for fetching live repositories
const GITHUB_USERNAME = 'HetLukhi';

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load repositories');
        }
        return response.json();
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching repositories:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>My Work & Repositories</p>
        <h1>Projects</h1>
        <span>Live repositories fetched from GitHub API</span>
      </div>

      {loading && <Loading />}
      {error && <Error />}

      {!loading && !error && (
        <div className="projects-grid">
          {repos.map((repo) => (
            <article className="project-card" key={repo.id}>
              <h2>{repo.name}</h2>
              <p>{repo.description || 'No description available for this repository.'}</p>
              <div className="repo-link-container">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  {repo.html_url}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;