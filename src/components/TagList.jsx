// Full class names are written out here, not built from parts,
// because Tailwind only generates classes it can find as complete strings in the source.
const TONES = {
  match: "bg-good/20 text-good",
  miss: "bg-bad/20 text-bad",
};

// Reusable list of keyword pills, coloured by tone ("match" or "miss").
export default function TagList({ items, tone }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing here.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-3 py-1 rounded-full text-sm ${TONES[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}
