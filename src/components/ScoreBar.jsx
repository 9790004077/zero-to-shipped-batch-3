// One labelled progress bar. `value` is a percentage from 0 to 100.
export default function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
