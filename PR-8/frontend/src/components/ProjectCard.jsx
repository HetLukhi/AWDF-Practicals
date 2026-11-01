import React from 'react';

function ProjectCard({ project, index }) {
  return (
    <article className="project-card">
      <span className="project-number">#{index + 1}</span>

      <div className="project-header-row">
        <h2>{project.name}</h2>
      </div>

      <p>{project.description || 'Full-stack web application & repository built by Manav Kansagara.'}</p>

      <div className="technology-list">
        {project.language && <span>{project.language}</span>}
        {project.topics && project.topics.map((t) => <span key={t}>{t}</span>)}
        <span>⭐ {project.stargazers_count ?? 0}</span>
        <span>🍴 {project.forks_count ?? 0}</span>
      </div>

      <div className="repo-link-container" style={{ marginTop: 'auto', paddingTop: '15px' }}>
        <a
          href={project.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            padding: '8px 16px',
            width: 'fit-content'
          }}
        >
          View on GitHub ↗
        </a>
      </div>
    </article>
  );
}

// React.memo optimization (Supplementary Problem 3): Prevents re-rendering untouched repo cards
export default React.memo(ProjectCard);
