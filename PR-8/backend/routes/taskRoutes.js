const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const validateObjectId = require('../middleware/validateObjectId');
const validateTask = require('../middleware/validateTask');
const auth = require('../middleware/auth');

// Protect all task routes using authentication middleware
router.use(auth);

router.route('/')
  .get(getAllTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, validateTask, updateTask)
  .delete(validateObjectId, deleteTask);

module.exports = router;
