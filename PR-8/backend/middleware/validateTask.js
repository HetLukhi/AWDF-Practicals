const validateTask = (req, res, next) => {
  const { title, status } = req.body;

  // On POST or PUT requests where title is expected
  if (req.method === 'POST' || (req.method === 'PUT' && title !== undefined)) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required and cannot be empty.'
      });
    }
  }

  if (status !== undefined) {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
  }

  next();
};

module.exports = validateTask;
