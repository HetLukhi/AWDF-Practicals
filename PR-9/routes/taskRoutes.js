const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCache
} = require('../controllers/taskController');

const validateObjectId = require('../middleware/validateObjectId');
const validateTask = require('../middleware/validateTask');
const auth = require('../middleware/auth');

// Protect all task routes using authentication middleware
router.use(auth);

// Debug & Cache Management endpoints (must precede /:id)
router.get('/cache/stats', getCacheStats);
router.all('/cache/clear', clearCache);

// Task CRUD endpoints
router.route('/')
  .get(getAllTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, validateTask, updateTask)
  .delete(validateObjectId, deleteTask);

module.exports = router;
