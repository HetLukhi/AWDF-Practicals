import { lazy } from 'react';

/**
 * Wraps dynamic import with an optional minimum delay to prevent UI flicker
 * on fast network connections or cached chunks.
 * 
 * @param {Function} importFunc - Dynamic import function, e.g., () => import('./pages/projects')
 * @param {number} minDelay - Minimum delay in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFunc, minDelay = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, minDelay))
    ]).then(([moduleExports]) => moduleExports)
  );
}

export default lazyWithDelay;
