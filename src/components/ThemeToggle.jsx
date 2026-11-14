// Switches between dark and light. It shows the theme you would switch TO.
export default function ThemeToggle({ theme, onToggle }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${next} theme`}
      className="px-4 py-2 rounded-full border border-line bg-surface text-sm font-medium text-ink hover:border-accent transition"
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
