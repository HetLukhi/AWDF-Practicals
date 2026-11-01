function ErrorMessage({ message = "Failed to load tasks from backend server." }) {
  return (
    <div className="status-message error-box">
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;
