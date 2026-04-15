export default function Spinner({ className = '' }) {
  return (
    <div
      className={`inline-block h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-primary ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
