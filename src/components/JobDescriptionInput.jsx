// Labelled textarea for pasting the job description.
export default function JobDescriptionInput({ value, onChange }) {
  return (
    <div>
      <label htmlFor="jd" className="block text-sm font-medium mb-2">
        2. Job description
      </label>
      <textarea
        id="jd"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-56 rounded-2xl bg-surface border border-line text-ink p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
