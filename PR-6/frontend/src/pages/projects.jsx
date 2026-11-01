import { useState, useEffect } from 'react';
import Loading from '../component/Loading';
import ErrorMessage from '../component/ErrorMessage';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(true);
      setErrorMessage(err.message || 'Failed to load tasks from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      alert(`Task Creation Error: ${err.message}`);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      alert(`Update Error: ${err.message}`);
    }
  };

  const handleUpdatePriority = async (task, priority) => {
    try {
      const updated = await updateTask(task._id, { priority });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      alert(`Priority Update Error: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Full Stack Integration — Practical 6</p>
        <h1>Task Manager</h1>
        <span>Live task data integrated with Node.js + Express + MongoDB backend</span>
      </div>

      <TaskForm onCreate={handleCreateTask} isSubmitting={isSubmitting} />

      <div className="card task-filter-card" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <strong>Total:</strong> {tasks.length} | <strong>Pending:</strong> {tasks.filter(t => !t.completed).length} | <strong>Completed:</strong> {tasks.filter(t => t.completed).length}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={filter === 'all' ? 'primary-button' : 'secondary-button'}
              onClick={() => setFilter('all')}
              style={{ padding: '6px 16px', fontSize: '0.9rem' }}
            >
              All Tasks
            </button>
            <button
              type="button"
              className={filter === 'active' ? 'primary-button' : 'secondary-button'}
              onClick={() => setFilter('active')}
              style={{ padding: '6px 16px', fontSize: '0.9rem' }}
            >
              Pending
            </button>
            <button
              type="button"
              className={filter === 'completed' ? 'primary-button' : 'secondary-button'}
              onClick={() => setFilter('completed')}
              style={{ padding: '6px 16px', fontSize: '0.9rem' }}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {loading && <Loading message="Loading tasks from Express & MongoDB server..." />}
      {error && <ErrorMessage message={errorMessage} />}

      {!loading && !error && (
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onUpdatePriority={handleUpdatePriority}
          onDelete={handleDeleteTask}
        />
      )}
    </section>
  );
}

export default Projects;
