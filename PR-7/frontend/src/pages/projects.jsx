import { useState, useEffect } from 'react';
import Loading from '../component/Loading';
import ErrorMessage from '../component/ErrorMessage';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import AuthForm from '../components/AuthForm';
import { getTasks, createTask, updateTask, deleteTask, getToken, removeToken, getMe } from '../api';

function Projects() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const checkAuthAndLoadData = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      // Fetch user profile via /me endpoint
      const meData = await getMe();
      setUser(meData.user || meData);

      // Fetch protected tasks
      const taskData = await getTasks();
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.error('Auth check / load tasks error:', err);
      if (err.status === 401) {
        setUser(null);
        setTasks([]);
        removeToken();
      } else {
        setError(true);
        setErrorMessage(err.message || 'Failed to load data from server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    checkAuthAndLoadData();
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setTasks([]);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      if (err.status === 401) handleLogout();
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
      if (err.status === 401) handleLogout();
      alert(`Update Error: ${err.message}`);
    }
  };

  const handleUpdatePriority = async (task, priority) => {
    try {
      const updated = await updateTask(task._id, { priority });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      if (err.status === 401) handleLogout();
      alert(`Priority Update Error: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      if (err.status === 401) handleLogout();
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
        <p>Authentication & Middleware Pipeline — Practical 7</p>
        <h1>Task Manager</h1>
        <span>JWT Authentication, Password Hashing, Route Protection & Server-side Validation</span>
      </div>

      {!user && !loading && (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}

      {user && (
        <>
          <div className="card" style={{ padding: '15px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#166534' }}>Logged in as: </span>
              <strong style={{ color: '#15803d' }}>{user.email}</strong>
            </div>
            <button
              onClick={handleLogout}
              className="secondary-button"
              style={{ padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
            >
              Logout
            </button>
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

          {loading && <Loading message="Loading tasks from protected API..." />}
          {error && <ErrorMessage message={errorMessage} />}

          {!loading && !error && (
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onUpdatePriority={handleUpdatePriority}
              onDelete={handleDeleteTask}
            />
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
