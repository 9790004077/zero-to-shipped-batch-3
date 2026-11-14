import { useRef } from "react";
import { useDropzone } from "../hooks/useDropzone.js";
import { ACCEPTED_TYPES } from "../lib/constants.js";

// Drag-and-drop area that also opens the file picker when clicked.
export default function DropZone({ file, onFile }) {
  const inputRef = useRef(null);
  const { isDragging, dropProps } = useDropzone(onFile);

  return (
    <div
      {...dropProps}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center h-56 rounded-2xl border-2 border-dashed bg-surface hover:border-accent transition cursor-pointer text-center p-6 ${
        isDragging ? "border-accent" : "border-line"
      }`}
    >
      <p className="text-lg font-semibold">Drag and drop your resume here</p>
      <p className="text-sm text-muted mt-1">PDF or .docx, or click to choose a file</p>
      {file && <p className="mt-4 text-sm text-accent">Selected: {file.name}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => event.target.files[0] && onFile(event.target.files[0])}
      />
    </div>
  );
}
