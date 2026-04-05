"use client";

import { useState } from "react";
import { STATUS_OPTIONS } from "@/lib/constants";

interface PhaseDetailData {
  id: string;
  trigger: string;
  actionsSteps: string;
  documentsUsed: string;
  documentsCreated: string;
  systemsTools: string;
  inputsFrom: string;
  outputsTo: string;
  timeline: string;
  painPoints: string;
  compliance: string;
  status: string;
  notes: string;
}

const FIELDS: { key: string; label: string; hint: string; multiline: boolean; highlight?: boolean }[] = [
  { key: "trigger", label: "Trigger", hint: "What kicks off this phase (email, verbal, system notification, automatic)", multiline: false },
  { key: "actionsSteps", label: "Actions / Steps", hint: "What actually happens — not what policy says, but what staff really do", multiline: true },
  { key: "documentsUsed", label: "Documents Used", hint: "Templates, forms, checklists consumed in this phase", multiline: true },
  { key: "documentsCreated", label: "Documents Created", hint: "Outputs produced; who receives them", multiline: true },
  { key: "systemsTools", label: "Systems / Tools", hint: "ADP, email, shared drives, paper files, Excel, etc.", multiline: true },
  { key: "inputsFrom", label: "Inputs From", hint: "What this department needs from other departments to act", multiline: true },
  { key: "outputsTo", label: "Outputs To", hint: "What this department passes to downstream departments", multiline: true },
  { key: "timeline", label: "Timeline", hint: "How long this phase takes; SLAs or deadlines", multiline: false },
  { key: "painPoints", label: "Pain Points", hint: "What breaks, what's slow, what gets missed", multiline: true, highlight: true },
  { key: "compliance", label: "Compliance", hint: "Regulatory, legal, or policy requirements tied to this phase", multiline: true },
  { key: "notes", label: "Notes", hint: "Meeting notes, additional context, action items", multiline: true },
];

export default function PhaseDetailForm({
  phaseDetail,
  canEdit,
}: {
  phaseDetail: PhaseDetailData;
  canEdit: boolean;
}) {
  const [formData, setFormData] = useState({
    trigger: phaseDetail.trigger,
    actionsSteps: phaseDetail.actionsSteps,
    documentsUsed: phaseDetail.documentsUsed,
    documentsCreated: phaseDetail.documentsCreated,
    systemsTools: phaseDetail.systemsTools,
    inputsFrom: phaseDetail.inputsFrom,
    outputsTo: phaseDetail.outputsTo,
    timeline: phaseDetail.timeline,
    painPoints: phaseDetail.painPoints,
    compliance: phaseDetail.compliance,
    status: phaseDetail.status,
    notes: phaseDetail.notes,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/phase-details/${phaseDetail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage({ type: "success", text: "Saved successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={!canEdit}
              onClick={() => handleChange("status", opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                formData.status === opt.value
                  ? `${opt.color} ring-2 ring-offset-1 ring-teal-500`
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              } ${!canEdit ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-5">
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className={field.highlight ? "bg-amber-50 -mx-5 px-5 py-4 border-l-4 border-amber-400" : ""}
          >
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {field.label}
            </label>
            <p className="text-xs text-slate-500 mb-2">{field.hint}</p>
            {field.multiline ? (
              <textarea
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                disabled={!canEdit}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm"
              />
            ) : (
              <input
                type="text"
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm"
              />
            )}
          </div>
        ))}
      </div>

      {/* Save button and message */}
      {canEdit && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
