"use client";

import { useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type Phase = { slug: string; name: string; stage: string; sequenceOrder: number };
type Department = { slug: string; name: string };
type Meta = { phases: Phase[]; departments: Department[]; fieldKeys: string[]; validStatuses: string[] };

type PreviewRow = { departmentSlug: string; departmentName: string; action: "create" | "overwrite" };

const FIELD_DESCRIPTIONS: Record<string, string> = {
  trigger: "What kicks off this phase (email, verbal, system notification, automatic)",
  actionsSteps: "What actually happens — not what policy says, but what staff really do",
  documentsUsed: "Templates, forms, checklists consumed in this phase",
  documentsCreated: "Outputs produced; who receives them",
  systemsTools: "ADP, email, shared drives, paper files, Excel, etc.",
  inputsFrom: "What this department needs from other departments to act",
  outputsTo: "What this department passes to downstream departments",
  timeline: "How long this phase takes; SLAs or deadlines",
  painPoints: "What breaks, what's slow, what gets missed",
  compliance: "Regulatory, legal, or policy requirements tied to this phase",
  notes: "Meeting notes, additional context, action items",
};

export default function BulkImportPage() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [phaseSlug, setPhaseSlug] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [preview, setPreview] = useState<{ creates: number; overwrites: number; rows: PreviewRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/bulk-import")
      .then((r) => r.json())
      .then((data) => {
        setMeta(data);
        if (data.phases?.length) setPhaseSlug(data.phases[0].slug);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load reference data." }));
  }, []);

  const selectedPhase = useMemo(
    () => meta?.phases.find((p) => p.slug === phaseSlug),
    [meta, phaseSlug]
  );

  const promptTemplate = useMemo(() => {
    if (!meta || !selectedPhase) return "";
    const fields = meta.fieldKeys
      .map((k) => `  - "${k}": ${FIELD_DESCRIPTIONS[k] ?? ""}`)
      .join("\n");
    const deptList = meta.departments.map((d) => `  - "${d.slug}" (${d.name})`).join("\n");
    const example = {
      phaseSlug: selectedPhase.slug,
      entries: [
        {
          departmentSlug: meta.departments[0]?.slug ?? "hr",
          status: "in_progress",
          trigger: "Hiring manager submits requisition via email",
          actionsSteps: "1. Receive request\n2. Review against budget\n3. Post role",
          documentsUsed: "Job requisition form",
          documentsCreated: "Job posting, intake notes",
          systemsTools: "Outlook, ADP, Indeed",
          inputsFrom: "Hiring manager (role details), Finance (budget approval)",
          outputsTo: "Recruitment team",
          timeline: "1-2 business days",
          painPoints: "Requisitions sometimes arrive without budget approval",
          compliance: "Equal opportunity language required in postings",
          notes: "",
        },
      ],
    };

    return `I'm capturing workflow data for the KIDO Employee Lifecycle Tracker.

Phase: "${selectedPhase.name}" (slug: ${selectedPhase.slug}, stage: ${selectedPhase.stage})

Please generate a JSON object describing what each department does during this phase. Output ONLY valid JSON (no prose, no markdown fences).

Schema:
{
  "phaseSlug": "${selectedPhase.slug}",
  "entries": [
    {
      "departmentSlug": "<one of the slugs below>",
      "status": "<one of: ${meta.validStatuses.join(", ")}>",
${meta.fieldKeys.map((k) => `      "${k}": "<string>"`).join(",\n")}
    }
  ]
}

Field meanings:
${fields}

Valid department slugs (include one entry per applicable department; omit departments with no role in this phase):
${deptList}

Guidelines:
- Be specific and concrete. Capture what staff actually do, not what policy says.
- Use "\\n" for line breaks within a field (e.g., numbered steps in actionsSteps).
- If a field doesn't apply, use an empty string "".
- Default status to "in_progress" unless you have reason to use another value.

Example output:
${JSON.stringify(example, null, 2)}`;
  }, [meta, selectedPhase]);

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function parseAndValidateClient(): { phaseSlug: string; entries: unknown[] } | null {
    setMessage(null);
    let parsed: { phaseSlug?: string; entries?: unknown[] };
    try {
      // Strip optional ```json fences if Claude adds them
      const cleaned = jsonText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/, "");
      parsed = JSON.parse(cleaned);
    } catch (e) {
      setMessage({ type: "error", text: `JSON parse error: ${(e as Error).message}` });
      return null;
    }
    if (!parsed.phaseSlug) {
      setMessage({ type: "error", text: "JSON is missing phaseSlug." });
      return null;
    }
    if (parsed.phaseSlug !== phaseSlug) {
      setMessage({
        type: "error",
        text: `phaseSlug in JSON ("${parsed.phaseSlug}") does not match selected phase ("${phaseSlug}").`,
      });
      return null;
    }
    if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) {
      setMessage({ type: "error", text: "JSON entries must be a non-empty array." });
      return null;
    }
    return { phaseSlug: parsed.phaseSlug, entries: parsed.entries };
  }

  async function handlePreview() {
    const parsed = parseAndValidateClient();
    if (!parsed) return;
    setLoading(true);
    setPreview(null);
    try {
      const res = await fetch("/api/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error + (data.details ? "\n" + data.details.join("\n") : ""),
        });
        return;
      }
      setPreview({ creates: data.creates, overwrites: data.overwrites, rows: data.preview });
      setMessage({ type: "info", text: "Preview generated. Review and click Confirm Import to commit." });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    const parsed = parseAndValidateClient();
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error + (data.details ? "\n" + data.details.join("\n") : ""),
        });
        return;
      }
      setMessage({
        type: "success",
        text: `Imported ${data.total} entries (${data.creates} created, ${data.overwrites} overwritten).`,
      });
      setPreview(null);
      setJsonText("");
    } finally {
      setLoading(false);
    }
  }

  if (!meta) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Bulk Import (Phase by Phase)</h1>
      <p className="text-sm text-slate-600 mb-6">
        Generate workflow data with Claude, paste the JSON, preview the changes, then commit. Imports one phase at a time across all applicable departments.
      </p>

      {/* Step 1: pick a phase */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Step 1 — Pick a phase
        </label>
        <select
          value={phaseSlug}
          onChange={(e) => {
            setPhaseSlug(e.target.value);
            setPreview(null);
            setMessage(null);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          {meta.phases.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.sequenceOrder}. {p.name} ({p.stage})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: copy the prompt */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Step 2 — Copy this prompt into Claude
          </label>
          <button
            onClick={handleCopyPrompt}
            className="bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs"
          >
            {copied ? "Copied!" : "Copy prompt"}
          </button>
        </div>
        <pre className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-700 max-h-64 overflow-auto whitespace-pre-wrap">
          {promptTemplate}
        </pre>
      </div>

      {/* Step 3: paste the result */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Step 3 — Paste Claude&apos;s JSON response
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setPreview(null);
          }}
          rows={12}
          placeholder='{"phaseSlug": "...", "entries": [...] }'
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={handlePreview}
            disabled={loading || !jsonText.trim()}
            className="bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 text-sm"
          >
            {loading ? "Working..." : "Preview"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-md p-3 mb-4 text-sm whitespace-pre-wrap ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : message.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Step 4: preview + confirm */}
      {preview && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
          <h2 className="text-sm font-medium text-slate-700 mb-3">
            Step 4 — Review and confirm
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            {preview.rows.length} entries: <strong>{preview.creates}</strong> will be created,{" "}
            <strong>{preview.overwrites}</strong> will be overwritten.
          </p>
          <ul className="text-sm space-y-1 mb-4">
            {preview.rows.map((r) => (
              <li key={r.departmentSlug} className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    r.action === "create"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {r.action}
                </span>
                <span className="text-slate-700">{r.departmentName}</span>
                <span className="text-slate-400 text-xs">({r.departmentSlug})</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </button>
        </div>
      )}
    </div>
  );
}
