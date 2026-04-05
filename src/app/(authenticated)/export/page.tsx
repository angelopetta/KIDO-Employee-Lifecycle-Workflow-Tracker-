"use client";

import { useState } from "react";
import { STAGES } from "@/lib/constants";

export default function ExportPage() {
  const [format, setFormat] = useState("csv");
  const [stage, setStage] = useState("");

  function handleExport() {
    const params = new URLSearchParams();
    params.set("format", format);
    if (stage) params.set("stage", stage);
    window.open(`/api/export?${params.toString()}`, "_blank");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Export Data</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="csv"
                  checked={format === "csv"}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-teal-600"
                />
                CSV (Excel-compatible)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="json"
                  checked={format === "json"}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-teal-600"
                />
                JSON
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm"
          >
            Download Export
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Exports all phase detail data including triggers, actions, documents, pain points, and status.
          Department leads will only see their own department&apos;s data.
        </p>
      </div>
    </div>
  );
}
