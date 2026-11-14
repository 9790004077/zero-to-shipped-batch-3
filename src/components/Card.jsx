// Reusable panel: a rounded dark box with an optional heading.
// The default padding is p-6. Passing your own className replaces it, so p-8 wins.
export default function Card({ title, titleClassName = "text-slate-100", className = "p-6", children }) {
  return (
    <section className={`rounded-2xl bg-slate-900 border border-slate-800 ${className}`}>
      {title && <h2 className={`font-semibold mb-3 ${titleClassName}`}>{title}</h2>}
      {children}
    </section>
  );
}
