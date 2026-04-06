"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm"
    >
      Print / Save as PDF
    </button>
  );
}
