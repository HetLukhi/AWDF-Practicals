# Practical 8: Performance Optimization and Lazy Loading in React

**Course / Code:** ITUE301 Advanced Web Frontend Frameworks  
**CO / PO:** CO1 / PO3, PO5  
**Objective:** To improve frontend performance using lazy loading and code splitting techniques in a multi-route React application.

---

## 1. Architecture & Concept Diagram

### Before Optimization (Single Monolithic Bundle)
All route components and assets were bundled into a single file and parsed upfront on initial page visit, even if the user never visited `/projects` or `/contact`.
```
main.bundle.js (183.39 kB) ──────────────► [Home][Projects][Contact][Auth][Charts]
(All loaded upfront on first load, slowing down First Contentful Paint and Time-to-Interactive)
```

### After Optimization (Route-based & Component-based Code Splitting)
Initial bundle size is significantly reduced. Route and heavy component chunks are dynamically downloaded over the network only when the user navigates to them or requests them.
```
main.bundle.js (169.47 kB) ──► Loads immediately on first visit
       │
       ├──► home.chunk.js (1.81 kB) ────────► Loaded only when visiting `/`
       │
       ├──► projects.chunk.js (7.01 kB) ────► Loaded only when visiting `/projects` (GitHub Projects)
       │         │
       │         └──► ProjectAnalyticsChart.chunk.js (2.26 kB) ──► Loaded on-demand when clicking "View Analytics"
       │
       └──► contact.chunk.js (2.48 kB) ────► Loaded only when visiting `/contact`
```

---

## 2. Before vs After Performance & Bundle Measurement

Measurements recorded directly from the Vite production build (`npm run build`):

| Metric / Asset | Before Optimization (Single Bundle) | After Optimization (Code Splitting) | Difference / Savings |
| :--- | :--- | :--- | :--- |
| **Initial JS Bundle (Entry)** | `183.39 kB` (gzip: `59.01 kB`) | `169.47 kB` (gzip: `55.43 kB`) | **~14 kB shaved off initial entry** |
| **Home Route Chunk** | Included in main bundle | `1.81 kB` (gzip: `0.65 kB`) | Downloaded only on `/` |
| **Projects Route Chunk** | Included in main bundle | `7.01 kB` (gzip: `2.78 kB`) | Downloaded only on `/projects` |
| **Contact Route Chunk** | Included in main bundle | `2.48 kB` (gzip: `0.88 kB`) | Downloaded only on `/contact` |
| **ProjectAnalyticsChart Component** | Included in main bundle | `2.26 kB` (gzip: `0.91 kB`) | Downloaded on-demand when toggled |
| **CSS Bundle** | `10.02 kB` | `14.09 kB` | Optimized styles & fallback skeletons |

### Build Output Comparison
#### Before Optimization:
```
dist/index.html                   0.44 kB │ gzip:  0.30 kB
dist/assets/index-B4ckpLUq.css   10.02 kB │ gzip:  2.45 kB
dist/assets/index-CB2Pu3rP.js   183.39 kB │ gzip: 59.01 kB
```

#### After Optimization:
```
dist/index.html                                  0.44 kB │ gzip:  0.30 kB
dist/assets/index-CviS9dC_.css                  14.09 kB │ gzip:  3.24 kB
dist/assets/home-C4izFtFO.js                     1.81 kB │ gzip:  0.65 kB
dist/assets/ProjectAnalyticsChart-CuJ7EPGO.js    2.26 kB │ gzip:  0.91 kB
dist/assets/contact-Bln7vVLh.js                  2.48 kB │ gzip:  0.88 kB
dist/assets/projects-CrUeoeFu.js                 7.01 kB │ gzip:  2.78 kB
dist/assets/index-jTXknf07.js                  169.47 kB │ gzip: 55.43 kB
```

---

## 3. Key Implementation Highlights

### A. Route-Based Lazy Loading with `React.lazy()` & `<Suspense>` (`src/App.jsx`)
Route components are dynamically imported so that Vite and Rollup automatically generate separate JavaScript chunks for each route:
```jsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RouteFallback from './component/RouteFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';

// Code-split routes
const Home = lazyWithDelay(() => import('./pages/home'), 300);
const Projects = lazyWithDelay(() => import('./pages/projects'), 300);
const Contact = lazyWithDelay(() => import('./pages/contact'), 300);

function App() {
  return (
    <div className="container">
      <Navbar ... />
      <main className="content">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home student={student} skills={skills} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>
      <Footer ... />
    </div>
  );
}
```

### B. Meaningful Fallback UI (`src/component/RouteFallback.jsx`)
While a lazy chunk is loading, a branded, informative fallback UI is shown to the user with:
- An animated spinner
- Skeleton shimmer bars (`.fallback-skeleton`) matching the page layout
- A status badge explaining that `React.lazy()` and `Suspense` are fetching the chunk
- Full dark/light mode CSS theme adaptation

### C. Supplementary Problem 1: Lazy Loading Heavy Components on Demand (`src/pages/projects.jsx`)
In addition to route-level splitting, the `TaskAnalyticsChart` component is lazy-loaded on-demand inside `projects.jsx`:
```jsx
const TaskAnalyticsChart = lazy(() => import('../components/TaskAnalyticsChart'));

// Inside component:
{showAnalytics && (
  <Suspense fallback={<div className="loading-box"><div className="spinner"></div><p>Loading TaskAnalyticsChart chunk...</p></div>}>
    <TaskAnalyticsChart tasks={tasks} />
  </Suspense>
)}
```
**Advantage:** The chart module code (`2.71 kB`) is not loaded even when entering `/projects` until the user actively clicks the **"📊 View Analytics (Lazy Chunk)"** button.

### D. Supplementary Problem 2: Minimum-Delay Fallback Utility (`src/utils/lazyWithDelay.js`)
Prevents rapid flickering of the fallback loading state when the user is on a fast broadband connection or when chunks are cached in the browser:
```javascript
export function lazyWithDelay(importFunc, minDelay = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, minDelay))
    ]).then(([moduleExports]) => moduleExports)
  );
}
```

### E. Supplementary Problem 3: React DevTools Profiler & Unnecessary Re-render Optimization
1. **Identified Issue:** In `TaskList`, whenever any task completed status or priority changed, or a new task was created, all `TaskItem` components re-rendered because:
   - `TaskItem` was an unmemoized functional component.
   - Callback handlers (`handleToggleComplete`, `handleUpdatePriority`, `handleDeleteTask`) in `projects.jsx` were recreated as fresh function references on every render of `Projects`.
2. **Optimization Applied:**
   - Wrapped `TaskItem` in `React.memo(TaskItem)` in `src/components/TaskItem.jsx`.
   - Memoized the callback handlers with `useCallback` in `src/pages/projects.jsx`.
3. **Result:** In the React DevTools Profiler, when toggling or updating a single task, only that specific `TaskItem` re-renders; other list items are greyed out as `Did not render (props did not change)`.

---

## 4. Key Questions & Theoretical Analysis

### Q1: What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
* **Initial Bundle (`main.bundle.js` / `index.js`):** Downloaded synchronously during the initial HTML page load when the user first visits the web application. The browser blocks rendering until this script is downloaded and parsed.
* **Lazy-loaded Chunk (`[route].chunk.js`):** Downloaded asynchronously via a dynamic HTTP request (`import()`) only when the corresponding route is requested or when an on-demand component is triggered. If a user never visits `/contact`, that chunk is never downloaded, saving network bandwidth and memory.

### Q2: Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
* **Lower Time to Interactive (TTI) and First Contentful Paint (FCP):** The browser has to download, decode, parse, and compile significantly fewer bytes of JavaScript before rendering the visible viewport.
* **Better Main-Thread Availability:** Parsing a massive 1 MB bundle blocks the browser's JavaScript engine. Splitting it into 100 KB chunks leaves the main thread responsive to user input (clicking, typing, scrolling).
* **Progressive Loading:** Users perceive the application as instantaneous because the homepage appears immediately. Subsequent route chunks are fetched in the background while the user is engaged with the initial screen.

### Q3: In what situations would lazy loading not be worth the added complexity?
* **Very Small Applications (< 100 kB total JS):** The HTTP overhead of multiple round-trips for separate network requests outweighs the small size reduction.
* **Critical Path / Above-the-fold UI:** Components essential for the initial screen (e.g. Header, Navbar, primary hero) should not be lazy-loaded, as it introduces unwanted layout shifts and loading spinners.
* **Offline-first PWAs with Pre-caching:** If service workers pre-cache the whole application shell upfront, lazy loading adds negligible benefit and introduces unnecessary code splitting boilerplate.

---

## 5. How to Run Practical 8

### Backend:
```bash
cd "Prac8/backend"
npm install
npm run dev
# Server running at http://localhost:5000 (MongoDB connection)
```

### Frontend:
```bash
cd "Prac8/frontend"
npm install
npm run dev
# Vite dev server running at http://localhost:5173
```

### Production Build & Preview:
```bash
cd "Prac8/frontend"
npm run build
npm run preview
# Preview server running at http://localhost:4173
```
