function RouteFallback({ routeName = "Route Chunk" }) {
  return (
    <div className="route-fallback-container">
      <div className="route-fallback-card">
        <div className="route-fallback-spinner"></div>
        <div className="route-fallback-pulse"></div>
        <h3>Loading {routeName}...</h3>
        <p className="fallback-detail">
          Fetching chunk dynamically using <code>React.lazy()</code> & <code>Suspense</code>
        </p>
        <div className="fallback-skeleton">
          <div className="skeleton-bar skeleton-title"></div>
          <div className="skeleton-bar skeleton-text"></div>
          <div className="skeleton-bar skeleton-text short"></div>
        </div>
      </div>
    </div>
  );
}

export default RouteFallback;
