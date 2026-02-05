export default function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-100 ${className}`}
    />
  );
}