// Reusable bulleted list for strengths and weaknesses.
export default function FeedbackList({ items, emptyText }) {
  const shown = items.length ? items : [emptyText];
  return (
    <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
      {shown.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
