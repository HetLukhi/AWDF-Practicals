const Task = require('../models/Task');
const cache = require('../utils/cache');

// Helper to determine if caching is bypassed via query param or header
const isCachingDisabled = (req) => {
  if (process.env.ENABLE_CACHE === 'false') return true;
  if (req.query && req.query.cache === 'false') return true;
  if (req.headers && req.headers['x-no-cache'] === 'true') return true;
  return false;
};

// @desc    Get all tasks (Cached with TTL)
// @route   GET /tasks OR GET /api/tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const bypassCache = isCachingDisabled(req);
    const cacheKey = 'all_tasks';

    // 1. Check in-memory cache if not bypassed
    if (!bypassCache) {
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
    }

    // 2. Cache MISS or BYPASS: Query MongoDB
    const tasks = await Task.find().sort({ createdAt: -1 });

    // 3. Store in cache for subsequent requests (if caching is active)
    if (!bypassCache) {
      cache.set(cacheKey, tasks);
      res.setHeader('X-Cache', 'MISS');
    } else {
      res.setHeader('X-Cache', 'BYPASS');
    }

    return res.status(200).json({
      success: true,
      source: 'database',
      cacheStatus: bypassCache ? 'BYPASS' : 'MISS',
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task by ID (Cached separately with key: task_<id>)
// @route   GET /tasks/:id OR GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const bypassCache = isCachingDisabled(req);
    const cacheKey = `task_${req.params.id}`;

    // 1. Check cache for single task
    if (!bypassCache) {
      const cachedTask = cache.get(cacheKey);
      if (cachedTask) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json({
          success: true,
          source: 'cache',
          cacheStatus: 'HIT',
          data: cachedTask
        });
      }
    }

    // 2. Query MongoDB
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    // 3. Store in cache under specific task key
    if (!bypassCache) {
      cache.set(cacheKey, task);
      res.setHeader('X-Cache', 'MISS');
    } else {
      res.setHeader('X-Cache', 'BYPASS');
    }

    return res.status(200).json({
      success: true,
      source: 'database',
      cacheStatus: bypassCache ? 'BYPASS' : 'MISS',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task (Invalidates 'all_tasks' cache)
// @route   POST /tasks OR POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    // 1. Write to MongoDB
    const task = await Task.create({
      title,
      description,
      priority
    });

    // 2. Cache Invalidation: invalidate 'all_tasks' so stale listing is never served
    const invalidatedCount = cache.del('all_tasks');
    console.log(`[Cache Invalidation] Cleared 'all_tasks' cache key (${invalidatedCount} key deleted)`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully and cache invalidated',
      cacheInvalidated: ['all_tasks'],
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing task (Invalidates 'all_tasks' AND 'task_<id>')
// @route   PUT /tasks/:id OR PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    // 1. Write to MongoDB
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    // 2. Cache Invalidation: invalidate both all_tasks and single task cache
    const keysToInvalidate = ['all_tasks', `task_${req.params.id}`];
    const invalidatedCount = cache.del(keysToInvalidate);
    console.log(`[Cache Invalidation] Cleared keys [${keysToInvalidate.join(', ')}] (${invalidatedCount} key(s) deleted)`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully and cache invalidated',
      cacheInvalidated: keysToInvalidate,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task (Invalidates 'all_tasks' AND 'task_<id>')
// @route   DELETE /tasks/:id OR DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    // 1. Write to MongoDB
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    // 2. Cache Invalidation: invalidate both all_tasks and single task cache
    const keysToInvalidate = ['all_tasks', `task_${req.params.id}`];
    const invalidatedCount = cache.del(keysToInvalidate);
    console.log(`[Cache Invalidation] Cleared keys [${keysToInvalidate.join(', ')}] (${invalidatedCount} key(s) deleted)`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully and cache invalidated',
      cacheInvalidated: keysToInvalidate,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Debug endpoint: Get cache metrics and hit/miss statistics
// @route   GET /tasks/cache/stats OR GET /api/tasks/cache/stats
exports.getCacheStats = (req, res) => {
  const metrics = cache.getMetrics();
  res.status(200).json({
    success: true,
    data: metrics
  });
};

// @desc    Debug endpoint: Clear/flush in-memory cache
// @route   POST /tasks/cache/clear OR POST /api/tasks/cache/clear
exports.clearCache = (req, res) => {
  cache.flush();
  cache.resetMetrics();
  console.log('[Cache Management] In-memory cache cleared & metrics reset');
  res.status(200).json({
    success: true,
    message: 'In-memory cache cleared and metrics reset successfully'
  });
};
