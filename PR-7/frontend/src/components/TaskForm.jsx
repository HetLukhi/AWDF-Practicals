import { useState } from 'react';

function TaskForm({ onCreate, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }
    setValidationError('');

    try {
      await onCreate({ title: title.trim(), description: description.trim(), priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      // Error handled by parent component state
    }
  };

  return (
    <div className="card task-form-card">
      <h2>Create New Task</h2>

      {validationError && (
        <div className="status-message error-box" style={{ padding: '10px', fontSize: '0.9rem', margin: '10px 0' }}>
          {validationError}
        </div>
      )}

      <form className="contact-form" onSubmit={handleSubmit} style={{ boxShadow: 'none', padding: '0' }}>
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Complete Practical 6 Integration"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Task Description</label>
          <textarea
            id="description"
            rows="3"
            placeholder="e.g. Wire React frontend to Node/MongoDB backend"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="task-select-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Task...' : '+ Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
