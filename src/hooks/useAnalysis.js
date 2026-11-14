import { useCallback, useState } from "react";
import { extractText } from "../lib/extractText.js";
import { scoreResume } from "../lib/scoreResume.js";

// Custom hook: owns the status of one analysis run (idle, loading, done, error).
// Components call `run(file, jobDescription)` and read the state; they never touch the parsing code.
export function useAnalysis() {
  const [state, setState] = useState({ status: "idle", result: null, error: "" });

  const run = useCallback(async (file, jobDescription) => {
    setState({ status: "loading", result: null, error: "" });
    try {
      const text = await extractText(file);
      if (!text.trim()) {
        throw new Error("No text found. Is the PDF a scanned image?");
      }
      setState({ status: "done", result: scoreResume(text, jobDescription), error: "" });
    } catch (err) {
      setState({ status: "error", result: null, error: err.message });
    }
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading",
    run,
  };
}
