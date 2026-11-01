import TaskItem from './TaskItem.jsx';

function TaskList({ tasks, onToggleComplete, onUpdatePriority, onDelete }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="card text-center" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>No Tasks Found</h3>
        <p style={{ color: 'var(--text-muted-light)', marginTop: '10px' }}>
          Create a new task above or select a different filter tab to see your tasks!
        </p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {tasks.map((task, index) => (
        <TaskItem
          key={task._id}
          index={index}
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdatePriority={onUpdatePriority}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
