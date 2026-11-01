function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      <button className="retry-button" type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default ErrorMessage;
