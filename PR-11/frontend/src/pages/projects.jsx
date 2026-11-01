import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Loading from '../component/Loading';
import ProjectCard from '../components/ProjectCard';

// Supplementary Problem 1: Lazy loading heavy analytics component only when requested
const ProjectAnalyticsChart = lazy(() => import('../components/ProjectAnalyticsChart'));

const GITHUB_USERNAME = 'HetLukhi'; // Replace with your actual GitHub username

// Your actual public GitHub repositories from https://github.com/HetLukhi
const FALLBACK_PROJECTS = [
  {
    id: 1333437918,
    name: 'codeoracle',
    description: 'AI-powered legacy codebase explainer, dependency mapper, test generator, and safe modernizer.',
    language: 'Python',
    topics: ['react', 'hackathon', 'static-analysis', 'developer-tools', 'legacy-code', 'fastapi'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/codeoracle`
  },
  {
    id: 1320010022,
    name: 'itue301-exam-24DCS038-B',
    description: 'ITUE301 Advanced Web Frontend Frameworks practical examination repository.',
    language: 'JavaScript',
    topics: ['react', 'web-development', 'charusat'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/itue301-exam-24DCS038-B`
  },
  {
    id: 1315548001,
    name: 'heart_disease_predictor',
    description: 'Machine learning web application for predicting cardiovascular heart disease risks and analytics.',
    language: 'JavaScript',
    topics: ['machine-learning', 'healthcare', 'prediction'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/heart_disease_predictor`
  },
  {
    id: 1289943001,
    name: 'phishing-detection-system',
    description: 'Cyber-security system for real-time URL and email phishing threat detection using predictive classification.',
    language: 'Python',
    topics: ['cybersecurity', 'phishing-detection', 'python'],
    stargazers_count: 1,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/phishing-detection-system`
  },
  {
    id: 1245598001,
    name: 'generalstoremanagement',
    description: 'General store inventory management, billing, and retail stock tracking application.',
    language: 'HTML',
    topics: ['html5', 'css3', 'management-system'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/generalstoremanagement`
  },
  {
    id: 867954323,
    name: 'KansagaraManav2006',
    description: 'Special personal developer GitHub profile showcase and configuration repository.',
    language: 'Markdown',
    topics: ['config', 'github-config'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: `https://github.com/${GITHUB_USERNAME}/KansagaraManav2006`
  }
];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
            setIsFallback(false);
          } else {
            setProjects(FALLBACK_PROJECTS);
            setIsFallback(true);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('GitHub API rate limited or unreachable, using fallback projects:', err.message);
        if (isMounted) {
          setProjects(FALLBACK_PROJECTS);
          setIsFallback(true);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Supplementary Problem 3: Memoized event handlers to prevent child card re-renders
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleLanguageSelect = useCallback((lang) => {
    setSelectedLanguage(lang);
  }, []);

  // Compute unique languages
  const availableLanguages = ['All', ...new Set(projects.map((p) => p.language).filter(Boolean))];

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = selectedLanguage === 'All' || p.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Performance Optimization & Lazy Loading — Practical 8</p>
        <h1>GitHub Projects & Repositories</h1>
        <span>Live repositories from <strong>@{GITHUB_USERNAME}</strong> with route-based code splitting and lazy-loaded analytics</span>
      </div>

      {/* GitHub Profile Banner & Controls */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🐙</span>
          <div>
            <strong>GitHub Profile:</strong>{' '}
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}
            >
              github.com/{GITHUB_USERNAME} ↗
            </a>
            {isFallback && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted-light)', marginTop: '2px' }}>
                (API rate limit reached; displaying curated repositories)
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAnalytics((prev) => !prev)}
          className="secondary-button"
          style={{ padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          {showAnalytics ? 'Hide Analytics' : '📊 View Analytics (Lazy Chunk)'}
        </button>
      </div>

      {/* Supplementary Problem 1: Lazy loaded heavy analytics chart chunk */}
      {showAnalytics && (
        <div style={{ marginBottom: '25px' }}>
          <Suspense
            fallback={
              <div className="card status-message loading-box" style={{ padding: '24px' }}>
                <div className="spinner"></div>
                <p>Loading ProjectAnalyticsChart chunk dynamically via React.lazy()...</p>
              </div>
            }
          >
            <ProjectAnalyticsChart projects={projects} />
          </Suspense>
        </div>
      )}

      {/* Search & Language Filter Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="🔍 Search projects by title or keyword..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: 'var(--card-bg-light)',
              color: 'var(--text-light)',
              minWidth: '260px',
              flex: '1'
            }}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                className={selectedLanguage === lang ? 'primary-button' : 'secondary-button'}
                onClick={() => handleLanguageSelect(lang)}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <Loading message="Fetching GitHub projects..." />}

      {!loading && (
        <>
          {filteredProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Repositories Match Your Filter</h3>
              <p style={{ color: 'var(--text-muted-light)', marginTop: '8px' }}>
                Try clearing the search box or selecting another language.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id || project.name}
                  index={index}
                  project={project}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
