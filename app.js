// Resume Parser: reads a PDF/.docx resume, compares it with a job description,
// and renders a scorecard. Everything runs in the browser; nothing is uploaded.

// pdf.js needs a worker script to parse PDFs off the main thread.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Common words that carry no meaning for matching.
const STOPWORDS = new Set([
  "and", "the", "for", "with", "you", "your", "will", "are", "our", "this", "that",
  "from", "have", "has", "who", "what", "about", "can", "must", "should", "etc",
  "not", "but", "all", "any", "job", "role", "team", "work", "working", "experience",
  "years", "year", "ability", "strong", "good", "great", "using", "such", "etc",
  "including", "plus", "preferred", "required", "requirements", "responsibilities",
]);

// Technical skills we look for by name, so "node.js" or "c#" are matched exactly.
const SKILLS = [
  "javascript", "typescript", "python", "java", "c#", "c++", "go", "rust", "ruby",
  "php", "sql", "postgresql", "mysql", "mongodb", "react", "vue", "angular", "node.js",
  "express", "django", "flask", "spring", "html", "css", "tailwind", "git", "docker",
  "kubernetes", "aws", "azure", "gcp", "linux", "rest", "graphql", "ci/cd", "testing",
  "jest", "agile", "scrum", "figma",
];

const SECTION_PATTERNS = {
  "Experience": /\b(experience|work history|employment)\b/i,
  "Education": /\beducation\b/i,
  "Skills": /\bskills?\b/i,
  "Projects": /\bprojects?\b/i,
  "Summary": /\b(summary|profile|about me)\b/i,
};

// --- Reading the file -------------------------------------------------------

async function extractText(file) {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Please upload a PDF or .docx file.");
}

// --- Scoring ----------------------------------------------------------------

// Does `term` appear in `text` as a whole word? The lookarounds stop "go" matching "good".
function hasTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i").test(text);
}

// Pull out the terms the job description cares about, with a weight for each.
// Named skills count double; other frequent words count once.
function jobKeywords(jd) {
  const lower = jd.toLowerCase();
  const weights = new Map();

  for (const skill of SKILLS) {
    if (hasTerm(lower, skill)) weights.set(skill, 2);
  }

  const counts = new Map();
  for (const word of lower.match(/[a-z][a-z0-9+#]*/g) || []) {
    if (word.length < 3 || STOPWORDS.has(word) || weights.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const topWords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word]) => word);
  for (const word of topWords) weights.set(word, 1);

  return weights;
}

function scoreResume(resumeText, jd) {
  const resume = resumeText.toLowerCase();
  const keywords = jobKeywords(jd);

  // 1. Keyword match: weighted share of JD terms found in the resume.
  let totalWeight = 0;
  let matchedWeight = 0;
  const matched = [];
  const missing = [];
  for (const [term, weight] of keywords) {
    totalWeight += weight;
    if (hasTerm(resume, term)) {
      matchedWeight += weight;
      matched.push(term);
    } else {
      missing.push(term);
    }
  }
  const matchScore = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  // 2. Structure: does the resume have the usual sections?
  const sectionsFound = Object.entries(SECTION_PATTERNS)
    .filter(([, pattern]) => pattern.test(resumeText))
    .map(([name]) => name);
  const structureScore = Math.round((sectionsFound.length / Object.keys(SECTION_PATTERNS).length) * 100);

  // 3. Impact: lines with numbers such as "40%", "$2M", "3x" or "10 users".
  const metrics = resumeText.match(/\d+(\.\d+)?\s*(%|x\b|k\b|m\b|users|customers|ms|percent)|\$\s?\d/gi) || [];
  const impactScore = Math.min(100, metrics.length * 20);

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resumeText);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(resumeText);
  const wordCount = (resumeText.match(/\S+/g) || []).length;

  const overall = Math.round(matchScore * 0.6 + structureScore * 0.25 + impactScore * 0.15);

  // Plain-language feedback built from the numbers above.
  const strengths = [];
  const weaknesses = [];

  if (matched.length) strengths.push(`Covers ${matched.length} of ${keywords.size} key terms from the job.`);
  if (sectionsFound.length >= 4) strengths.push("Has most of the standard sections.");
  if (metrics.length) strengths.push(`Uses numbers to show impact (${metrics.length} found).`);
  if (hasEmail && hasPhone) strengths.push("Contact details are easy to find.");
  if (wordCount >= 300 && wordCount <= 900) strengths.push("Length is in a good range.");

  const missingSkills = missing.filter((term) => SKILLS.includes(term));
  if (missingSkills.length) weaknesses.push(`Named skills from the job are not mentioned: ${missingSkills.slice(0, 5).join(", ")}.`);
  const notSections = Object.keys(SECTION_PATTERNS).filter((name) => !sectionsFound.includes(name));
  if (notSections.length) weaknesses.push(`Missing sections: ${notSections.join(", ")}.`);
  if (!metrics.length) weaknesses.push("No measurable results. Add numbers such as percentages, counts or time saved.");
  if (!hasEmail || !hasPhone) weaknesses.push("Contact details (email or phone) are hard to find.");
  if (wordCount < 300) weaknesses.push("The resume is short. Add more detail about what you built.");
  if (wordCount > 900) weaknesses.push("The resume is long. Trim older or less relevant roles.");

  return {
    overall,
    breakdown: { match: matchScore, structure: structureScore, impact: impactScore },
    matched,
    missing,
    strengths,
    weaknesses,
  };
}

// --- Rendering --------------------------------------------------------------

// Build an element without innerHTML, so resume text can never inject markup.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function chips(container, terms, classes) {
  container.replaceChildren(
    ...(terms.length
      ? terms.map((term) => el("span", `px-3 py-1 rounded-full text-sm ${classes}`, term))
      : [el("p", "text-sm text-slate-500", "Nothing here.")])
  );
}

function bar(label, value) {
  const row = el("div");
  const head = el("div", "flex justify-between text-sm mb-1");
  head.append(el("span", "text-slate-300", label), el("span", "text-slate-400", `${value}%`));
  const track = el("div", "h-2 rounded-full bg-slate-800 overflow-hidden");
  const fill = el("div", "h-2 rounded-full bg-indigo-500 transition-all");
  fill.style.width = `${value}%`;
  track.append(fill);
  row.append(head, track);
  return row;
}

function render(result) {
  document.getElementById("overall").textContent = result.overall;

  document.getElementById("breakdown").replaceChildren(
    bar("Keyword match (60%)", result.breakdown.match),
    bar("Structure (25%)", result.breakdown.structure),
    bar("Impact (15%)", result.breakdown.impact)
  );

  chips(document.getElementById("matched"), result.matched, "bg-emerald-900/50 text-emerald-200");
  chips(document.getElementById("missing"), result.missing, "bg-rose-900/50 text-rose-200");

  const fillList = (id, items) => {
    document.getElementById(id).replaceChildren(
      ...items.map((item) => el("li", "", item))
    );
  };
  fillList("strengths", result.strengths.length ? result.strengths : ["No clear strengths found yet."]);
  fillList("weaknesses", result.weaknesses.length ? result.weaknesses : ["No major weaknesses found."]);

  document.getElementById("scorecard").classList.remove("hidden");
}

// --- Wiring up the page -----------------------------------------------------

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const fileNameLabel = document.getElementById("file-name");
const jdInput = document.getElementById("jd");
const analyzeButton = document.getElementById("analyze");
const errorLabel = document.getElementById("error");

let selectedFile = null;

function chooseFile(file) {
  selectedFile = file;
  fileNameLabel.textContent = file ? `Selected: ${file.name}` : "";
}

// Clicking the zone opens the file picker.
dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => chooseFile(fileInput.files[0]));

// Dragging a file over the zone needs preventDefault, or the browser opens the file itself.
dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("border-indigo-400");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("border-indigo-400"));
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("border-indigo-400");
  chooseFile(event.dataTransfer.files[0]);
});

analyzeButton.addEventListener("click", async () => {
  errorLabel.textContent = "";

  if (!selectedFile) {
    errorLabel.textContent = "Add your resume first.";
    return;
  }
  if (jdInput.value.trim().length < 50) {
    errorLabel.textContent = "Paste a fuller job description (at least a few sentences).";
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Reading resume...";
  try {
    const resumeText = await extractText(selectedFile);
    if (!resumeText.trim()) {
      throw new Error("No text found. Is the PDF a scanned image?");
    }
    render(scoreResume(resumeText, jdInput.value));
  } catch (error) {
    errorLabel.textContent = error.message;
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Compare resume to job";
  }
});
