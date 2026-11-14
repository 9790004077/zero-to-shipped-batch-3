import { useState } from "react";
import Button from "./components/Button.jsx";
import DropZone from "./components/DropZone.jsx";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { useAnalysis } from "./hooks/useAnalysis.js";
import { useTheme } from "./hooks/useTheme.js";
import { MIN_JD_LENGTH } from "./lib/constants.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [inputError, setInputError] = useState("");
  const { status, result, error, isLoading, run } = useAnalysis();
  const { theme, toggle } = useTheme();

  // Check the inputs first, then hand the work to the hook.
  const handleCompare = () => {
    setInputError("");
    if (!file) return setInputError("Add your resume first.");
    if (jobDescription.trim().length < MIN_JD_LENGTH) {
      return setInputError("Paste a fuller job description (at least a few sentences).");
    }
    run(file, jobDescription);
  };

  const message = inputError || (status === "error" ? error : "");

  return (
    <main className="min-h-screen bg-page text-ink">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="flex justify-end">
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
        <header className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-accent">Resume Parser</p>
          <h1 className="text-4xl md:text-5xl font-bold">See how well your resume fits the job</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Drop in your resume (PDF or Word) and paste a job description. You get a scorecard showing
            what matches, what is missing, and where your resume is strong or weak.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="block text-sm font-medium mb-2">1. Your resume</p>
            <DropZone file={file} onFile={setFile} />
          </div>

          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />

          <div className="md:col-span-2 flex flex-col items-center gap-3">
            <Button onClick={handleCompare} loading={isLoading}>
              Compare resume to job
            </Button>
            <p className="text-sm text-bad min-h-[1.25rem]">{message}</p>
          </div>
        </section>

        {status === "done" && result && <ScoreCard result={result} />}
      </div>
    </main>
  );
}
