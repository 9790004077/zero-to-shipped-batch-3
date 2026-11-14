import Card from "./Card.jsx";
import FeedbackList from "./FeedbackList.jsx";
import ScoreBar from "./ScoreBar.jsx";
import TagList from "./TagList.jsx";

// The results panel. It only composes smaller components and receives the scoring result as a prop.
export default function ScoreCard({ result }) {
  const { overall, breakdown, matched, missing, strengths, weaknesses, keywordCount } = result;

  return (
    <section className="space-y-8">
      <Card className="p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="text-center">
          <p className="text-6xl font-bold text-indigo-300">{overall}</p>
          <p className="text-sm text-slate-400 mt-1">Overall match</p>
        </div>
        <div className="flex-1 w-full space-y-4">
          <ScoreBar label="Keyword match (60%)" value={breakdown.match} />
          <ScoreBar label="Structure (25%)" value={breakdown.structure} />
          <ScoreBar label="Impact (15%)" value={breakdown.impact} />
          <p className="text-xs text-slate-500">{keywordCount} key terms read from the job description.</p>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Found in your resume" titleClassName="text-emerald-300">
          <TagList items={matched} tone="match" />
        </Card>
        <Card title="Missing from your resume" titleClassName="text-rose-300">
          <TagList items={missing} tone="miss" />
        </Card>
        <Card title="Strengths" titleClassName="text-emerald-300">
          <FeedbackList items={strengths} emptyText="No clear strengths found yet." />
        </Card>
        <Card title="Weaknesses" titleClassName="text-amber-300">
          <FeedbackList items={weaknesses} emptyText="No major weaknesses found." />
        </Card>
      </div>
    </section>
  );
}
