import React, { useState } from 'react';

function TaskItem({ task, index, onToggleComplete, onUpdatePriority, onDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleComplete(task);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    setIsUpdating(true);
    try {
      await onUpdatePriority(task, newPriority);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className={`project-card ${task.completed ? 'completed-task' : ''}`}>
      <span className="project-number">#{index + 1}</span>

      <div className="task-header-row">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={isUpdating || isDeleting}
          />
          <span className="checkbox-custom"></span>
        </label>

        <h2 className={`task-item-title ${task.completed ? 'strikethrough' : ''}`}>
          {task.title}
        </h2>
      </div>

      <p>{task.description || 'No description provided for this task.'}</p>

      <div className="task-actions-row">
        <div className="technology-list">
          <span className={`priority-tag priority-${task.priority}`}>
            Priority: {task.priority.toUpperCase()}
          </span>
          <span className={`status-tag ${task.completed ? 'status-completed' : 'status-pending'}`}>
            {task.completed ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="task-controls">
          <select
            className="task-select-input"
            value={task.priority}
            onChange={handlePriorityChange}
            disabled={isUpdating || isDeleting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            type="button"
            className="secondary-button delete-btn"
            onClick={handleDelete}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  );
}

// React.memo optimization: Prevents unnecessary re-render of untouched list items
export default React.memo(TaskItem);

