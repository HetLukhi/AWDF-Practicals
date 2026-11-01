function ProjectAnalyticsChart({ projects = [] }) {
  const total = projects.length;
  const totalStars = projects.reduce((acc, p) => acc + (p.stargazers_count || 0), 0);
  const totalForks = projects.reduce((acc, p) => acc + (p.forks_count || 0), 0);

  // Language count breakdown
  const languageCounts = {};
  projects.forEach((p) => {
    const lang = p.language || 'Other';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  const languages = Object.entries(languageCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));

  const colors = ['#0d6efd', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="card analytics-chart-card">
      <div className="analytics-header">
        <div>
          <h3>📊 GitHub Repository Analytics & Insights</h3>
          <p className="analytics-subtitle">
            Loaded on-demand as a separate code chunk (React.lazy component code-splitting)
          </p>
        </div>
        <span className="badge-chunk">Lazy Loaded Component Chunk</span>
      </div>

      <div className="analytics-grid">
        {/* Total Repositories */}
        <div className="metric-box">
          <span className="metric-title">Public Repositories</span>
          <div className="metric-value">{total}</div>
          <small className="metric-meta">Fetched from GitHub API profile</small>
        </div>

        {/* Engagement */}
        <div className="metric-box">
          <span className="metric-title">Community Stars & Forks</span>
          <div className="status-summary-row" style={{ marginTop: '10px' }}>
            <div className="status-pill status-pill-total" style={{ flex: 1 }}>
              <span className="pill-number">⭐ {totalStars}</span>
              <span className="pill-label">Stars</span>
            </div>
            <div className="status-pill status-pill-completed" style={{ flex: 1 }}>
              <span className="pill-number">🍴 {totalForks}</span>
              <span className="pill-label">Forks</span>
            </div>
          </div>
        </div>

        {/* Languages Breakdown */}
        <div className="metric-box" style={{ gridColumn: 'span 2' }}>
          <span className="metric-title">Technology & Language Breakdown</span>
          <div className="distribution-bars">
            {languages.map((item, idx) => (
              <div key={item.name} className="dist-item">
                <span className="dist-label">
                  {item.name}: {item.count} ({item.percentage}%)
                </span>
                <div
                  className="dist-bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors[idx % colors.length]
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalyticsChart;
