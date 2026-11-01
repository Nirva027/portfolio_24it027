function Spinner({ label = 'Loading...' }) {
  return (
    <div className="request-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Spinner;
