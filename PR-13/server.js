const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Tasks storage for full-stack Task Management
let tasks = [
  {
    id: 1,
    title: 'Implement User Authentication with JWT',
    description: 'Design secure schema and password hashing using bcrypt. Implement JWT token generation.',
    priority: 'High',
    completed: false,
    aiGenerated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Configure Docker Multi-Container Compose',
    description: 'Write Dockerfile and compose networking for frontend, backend, and MongoDB.',
    priority: 'Medium',
    completed: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  }
];

// AI API Routes
app.use('/api/ai', aiRoutes);

// Core Tasks API
app.get('/api/tasks', (req, res) => {
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'Medium', aiGenerated = false } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Task title is required.' });
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    description: description ? description.trim() : '',
    priority,
    completed: false,
    aiGenerated: Boolean(aiGenerated),
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  res.status(201).json({ success: true, message: 'Task created successfully', data: newTask });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== taskId);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// Health & System Info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    practical: 'Practical 13: AI API Integration into a Web Application',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    gracefulDegradation: 'Active & Verified'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(` Practical 13 Server running at http://localhost:${PORT}`);
    console.log(` AI Endpoints:`);
    console.log(`   - POST /api/ai/generate-description`);
    console.log(`   - POST /api/ai/test-failure`);
    console.log(` Interactive UI: http://localhost:${PORT}`);
    console.log(`========================================================`);
  });
}

module.exports = app;
