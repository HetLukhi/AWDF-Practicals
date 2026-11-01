function Loading({ message = "Loading tasks..." }) {
  return (
    <div className="status-message loading-box">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
