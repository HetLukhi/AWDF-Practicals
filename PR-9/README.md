# Practical 9: In-Memory Caching and Query Optimization

**Course / Code:** ITUE301 Advanced Web Frontend Frameworks  
**CO / PO:** CO2, CO4 / PO3, PO5  
**Objective:** To implement server-side in-memory caching using `node-cache`, ensure cache consistency via active invalidation, and measure its empirical impact on API response times.

---

## 1. Architecture & Concept Diagrams

### A. Read Operation (`GET /tasks`) Lifecycle
```
                 [ Client Request (GET /tasks) ]
                               │
                               ▼
                    [ Cache Check (node-cache) ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
        [ CACHE HIT ]                         [ CACHE MISS ]
            │                                     │
            │ (Return cached array)               ▼
            │                         [ Query MongoDB Database ]
            │                         (Task.find().sort(...))
            │                                     │
            │                                     ▼
            │                         [ Store in node-cache ]
            │                         (cache.set('all_tasks', data, 60s))
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
               [ HTTP 200 OK + Data Payload ]
               Header: X-Cache: HIT / MISS
               Header: X-Response-Time: <ms>
```

### B. Write Operation (`POST`, `PUT`, `DELETE /tasks`) Lifecycle
```
           [ Client Write Request (POST/PUT/DELETE) ]
                               │
                               ▼
                  [ Execute MongoDB Operation ]
                  (create / update / delete)
                               │
                               ▼
                 [ Cache Invalidation Trigger ]
                 ├── On POST:   cache.del('all_tasks')
                 └── On PUT/DEL: cache.del(['all_tasks', `task_${id}`])
                               │
                               ▼
                  [ HTTP Response (201 / 200) ]
                  (Cache purged; next read will be a fresh MISS)
```

---

## 2. Empirical Performance Measurement & Readings

Empirical readings were captured using the automated benchmark suite (`npm run benchmark`) running against local MongoDB instance and Node.js Express server. Response times were recorded both at the **Network / Client Roundtrip Level** and at the **Server-Side Execution Level** (measured via `process.hrtime.bigint()` and returned in `X-Response-Time` header):

### Response Time Comparison Table (3 Sample Readings)

| Reading # | Uncached (Direct MongoDB Query) | Cached (node-cache Memory HIT) | Latency Reduction | Server Execution Speedup |
| :--- | :--- | :--- | :--- | :--- |
| **Reading 1** | `5.72 ms` *(Server: 3.88 ms)* | `2.26 ms` *(Server: 0.84 ms)* | **-60.5%** | **4.62x faster server-side** |
| **Reading 2** | `4.78 ms` *(Server: 3.11 ms)* | `2.14 ms` *(Server: 0.96 ms)* | **-55.2%** | **3.24x faster server-side** |
| **Reading 3** | `5.96 ms` *(Server: 3.73 ms)* | `1.72 ms` *(Server: 0.58 ms)* | **-71.1%** | **6.43x faster server-side** |
| **Average** | **`5.49 ms`** *(Server: 3.57 ms)* | **`2.04 ms`** *(Server: 0.79 ms)* | **-62.84%** | **4.52x faster server-side** |

> **Key Observation:** Querying from Node.js process memory completely eliminates disk I/O, BSON serialization/deserialization, TCP network overhead to the MongoDB daemon, and index lookups. Server-side processing dropped from **3.57 ms** to **0.79 ms** (an **~80% reduction** in server computational overhead).

---

## 3. Key Implementation Highlights

### A. Shared Cache Module with Telemetry (`utils/cache.js`)
Configured `node-cache` with a default TTL of 60 seconds and automatic cleanup check period of 120 seconds. Custom counters track cache hits, misses, sets, and invalidations:
```javascript
const NodeCache = require('node-cache');
const defaultTTL = parseInt(process.env.CACHE_TTL, 10) || 60;

const nodeCacheInstance = new NodeCache({
  stdTTL: defaultTTL,
  checkperiod: 120,
  useClones: false // performance boost for read-only caching
});
```

### B. High-Resolution Timing Middleware (`middleware/responseTiming.js`)
Appends an `X-Response-Time` header to every HTTP response for exact microsecond profiling:
```javascript
const responseTiming = (req, res, next) => {
  const start = process.hrtime.bigint();
  const originalSend = res.send;
  res.send = function (body) {
    const end = process.hrtime.bigint();
    const durationInMs = Number(end - start) / 1e6;
    res.setHeader('X-Response-Time', `${durationInMs.toFixed(2)}ms`);
    return originalSend.call(this, body);
  };
  next();
};
```

### C. GET /tasks Route with Cache-First Check (`controllers/taskController.js`)
```javascript
exports.getAllTasks = async (req, res, next) => {
  const cacheKey = 'all_tasks';
  const cachedTasks = cache.get(cacheKey);

  if (cachedTasks) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({
      success: true,
      source: 'cache',
      cacheStatus: 'HIT',
      count: cachedTasks.length,
      data: cachedTasks
    });
  }

  const tasks = await Task.find().sort({ createdAt: -1 });
  cache.set(cacheKey, tasks);
  res.setHeader('X-Cache', 'MISS');

  return res.status(200).json({
    success: true,
    source: 'database',
    cacheStatus: 'MISS',
    count: tasks.length,
    data: tasks
  });
};
```

### D. Active Cache Invalidation on Mutations
Whenever data changes in MongoDB, the associated cache keys are immediately purged:
- **`POST /tasks`**: Invalidate collection key: `cache.del('all_tasks')`
- **`PUT /tasks/:id`**: Invalidate both collection and item key: `cache.del(['all_tasks', 'task_' + id])`
- **`DELETE /tasks/:id`**: Invalidate both collection and item key: `cache.del(['all_tasks', 'task_' + id])`

---

## 4. Key Questions & Analytical Discussion

### Question 1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
* **Why it must be invalidated:** Caching stores a point-in-time snapshot of the database in RAM. When a write operation (`POST`, `PUT`, `DELETE`) succeeds, the database state transitions to a new state. If the cache is not invalidated, the cache will continue returning the old snapshot until the TTL naturally expires.
* **Impact on Data Correctness:**
  1. **Phantom Tasks:** A deleted task would still appear in `GET /tasks` or `GET /tasks/:id`.
  2. **Ghost Updates:** If a user marks a task completed or updates its priority, subsequent GET requests would still display the task as pending/old priority.
  3. **Missing Insertions:** A newly created task would be invisible to users querying the listing endpoint.
  4. In transactional or collaborative workflows, this leads to **lost updates** and **inconsistent read states**.

### Question 2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
* **Reasonable TTL in Task Management:**
  - For typical collaborative task management applications, a TTL between **30 seconds to 120 seconds** is appropriate when combined with active cache invalidation on writes.
  - Active invalidation handles explicit mutations, meaning TTL serves primarily as a **safety net** for edge cases (e.g. background worker updates, bulk database jobs, or manual DB changes).
* **The TTL Trade-off Spectrum:**
  - **Short TTL (e.g., 5s – 15s):**
    - *Advantage:* Minimal window of staleness for external or unsynchronized database changes.
    - *Disadvantage:* High cache miss frequency; database receives more frequent queries, reducing caching efficiency.
  - **Long TTL (e.g., 5m – 60m):**
    - *Advantage:* Maximum cache hit ratio; database CPU and connection pool load is drastically minimized.
    - *Disadvantage:* Risk of serving stale data if an update occurs outside the Express application layer, plus higher process memory footprint.

### Question 3: Why is in-memory caching (`node-cache`) not suitable for a multi-server / multi-instance deployment, even though it works fine in this lab?
* **Isolated Process Memory:** `node-cache` stores keys inside the V8 JavaScript heap of a single Node.js OS process.
* **The Multi-Instance Problem:**
  - When the backend scales horizontally behind a Load Balancer (e.g. 4 instances via NGINX or Kubernetes pods):
    1. **Instance A** receives a `POST /tasks` and writes to MongoDB. It clears its own local cache (`cache.del('all_tasks')`).
    2. **Instance B** and **Instance C** still hold the stale `all_tasks` in their respective Node.js process memories.
    3. The next user request routed to Instance B receives **stale data**, while a request routed to Instance A receives **fresh data**.
* **Production Solution:**
  - In a distributed architecture, teams use a **centralized / distributed cache** such as **Redis** or **Memcached**. All instances read from and invalidate a shared Redis cluster, guaranteeing cluster-wide consistency.

---

## 5. Supplementary Problems & Enhancements

### A. Dedicated Single-Task Caching (`GET /tasks/:id`)
- Stored under a discrete key: `task_${id}`.
- Allows targeted caching of high-frequency single resource fetches without fetching or invalidating the entire tasks array.
- When `PUT /tasks/:id` or `DELETE /tasks/:id` is called, both `all_tasks` and `task_${id}` are purged simultaneously.

### B. Cache Telemetry & Debug Endpoint (`GET /tasks/cache/stats`)
Exposes live cache observability metrics:
```json
{
  "success": true,
  "data": {
    "defaultTTL": "60s",
    "totalRequests": 8,
    "hits": 4,
    "misses": 4,
    "hitRatio": "50.00%",
    "sets": 4,
    "invalidations": 3,
    "currentKeysCount": 1,
    "currentKeys": [
      "task_6aba30f00c9b0e4844f4ed06"
    ],
    "nodeCacheStats": {
      "hits": 4,
      "misses": 4,
      "keys": 1,
      "ksize": 29,
      "vsize": 240
    }
  }
}
```

### C. TTL Experimentation Matrix

| TTL Configuration | Perceived Staleness Risk | Cache Hit Ratio | DB Resource Consumption | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Short TTL (10s)** | Almost zero staleness | Moderate (~40-60%) | Moderate read queries | Real-time chat, bidding systems |
| **Medium TTL (60s)** *(Standard)* | Negligible (with active invalidation) | High (~80-95%) | Very low read queries | Task management, blogs, catalogs |
| **Long TTL (300s+)** | High if external writes occur | Maximum (>95%) | Near-zero read queries | Read-heavy static reference data |

---

## 6. Testing with Postman or Thunder Client

A complete pre-configured collection is included in [Postman_Collection_Prac9.json](file:///f:/5Th%20Sem/ITUE301%20AWFW/Prac9/Postman_Collection_Prac9.json).

### Steps:
1. **Import Collection**: Import `Postman_Collection_Prac9.json` into Postman or Thunder Client.
2. **Authenticate**: Send `POST /api/auth/login` (or `register`). The test script automatically saves the JWT token into the `token` variable.
3. **Measure Uncached Time**:
   - Send `GET {{baseUrl}}/tasks?cache=false` 3 times.
   - Note the `Time` in the response bar (e.g. ~5ms).
   - Check response header `X-Cache: BYPASS`.
4. **Measure Cached Time**:
   - Send `GET {{baseUrl}}/tasks` 3 times.
   - 1st request returns `X-Cache: MISS` (~5ms).
   - 2nd and 3rd requests return `X-Cache: HIT` (~1-2ms).
5. **Verify Invalidation**:
   - Send `POST {{baseUrl}}/tasks` with a new task.
   - Send `GET {{baseUrl}}/tasks` immediately: observe `X-Cache: MISS` and verify new item is present.
6. **Check Cache Metrics**:
   - Send `GET {{baseUrl}}/tasks/cache/stats` to inspect hit/miss statistics and active keys.

---

## 7. How to Run Locally

```bash
# 1. Navigate to Practical 9 directory
cd "f:\5Th Sem\ITUE301 AWFW\Prac9"

# 2. Start the API Server
npm start

# 3. In another terminal, run the automated benchmark suite
npm run benchmark
```
