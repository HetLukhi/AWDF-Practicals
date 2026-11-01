function TaskAnalyticsChart({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const lowCount = tasks.filter((t) => t.priority === 'low').length;
  const medCount = tasks.filter((t) => t.priority === 'medium').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;

  const lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medCount / total) * 100) : 0;
  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;

  return (
    <div className="card analytics-chart-card">
      <div className="analytics-header">
        <div>
          <h3>📊 Task Analytics & Productivity Insights</h3>
          <p className="analytics-subtitle">
            Loaded on-demand as a separate code chunk (React.lazy component splitting)
          </p>
        </div>
        <span className="badge-chunk">Lazy Loaded Chunk</span>
      </div>

      <div className="analytics-grid">
        {/* Completion Rate Meter */}
        <div className="metric-box">
          <span className="metric-title">Completion Rate</span>
          <div className="metric-value">{completionRate}%</div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <small className="metric-meta">{completed} of {total} tasks completed</small>
        </div>

        {/* Priority Breakdown */}
        <div className="metric-box">
          <span className="metric-title">Priority Breakdown</span>
          <div className="distribution-bars">
            <div className="dist-item">
              <span className="dist-label">High: {highCount} ({highPct}%)</span>
              <div className="dist-bar high-bar" style={{ width: `${highPct}%` }}></div>
            </div>
            <div className="dist-item">
              <span className="dist-label">Medium: {medCount} ({medPct}%)</span>
              <div className="dist-bar med-bar" style={{ width: `${medPct}%` }}></div>
            </div>
            <div className="dist-item">
              <span className="dist-label">Low: {lowCount} ({lowPct}%)</span>
              <div className="dist-bar low-bar" style={{ width: `${lowPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="metric-box">
          <span className="metric-title">Status Summary</span>
          <div className="status-summary-row">
            <div className="status-pill status-pill-pending">
              <span className="pill-number">{pending}</span>
              <span className="pill-label">Pending</span>
            </div>
            <div className="status-pill status-pill-completed">
              <span className="pill-number">{completed}</span>
              <span className="pill-label">Completed</span>
            </div>
            <div className="status-pill status-pill-total">
              <span className="pill-number">{total}</span>
              <span className="pill-label">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAnalyticsChart;
