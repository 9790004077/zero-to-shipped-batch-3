// Reusable button. Disabled while `loading` so a second click cannot start a second run.
export default function Button({ loading = false, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Reading resume..." : children}
    </button>
  );
}
