"use client";

import { useState } from "react";

const AUTOMATION_TYPES = ["", "full", "partial", "manual", "none"];
const MIGRATION_STATUSES = ["not_started", "in_progress", "complete", "blocked"];

interface MigrationData {
  id: string;
  targetAdpModule: string;
  requiredConfig: string;
  automationType: string;
  migrationStatus: string;
  notes: string;
}

interface PhaseRow {
  phaseId: string;
  phaseName: string;
  sequenceOrder: number;
  stage: string;
  stageConfig: { key: string; label: string; color: string };
  painPoints: string;
  migrationMap: MigrationData | null;
}

export default function AdpMigrationClient({ data }: { data: PhaseRow[] }) {
  const [rows, setRows] = useState(data);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleSave(migrationMap: MigrationData) {
    setSavingId(migrationMap.id);
    await fetch(`/api/migration-map/${migrationMap.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(migrationMap),
    });
    setSavingId(null);
  }

  function updateField(phaseId: string, field: keyof MigrationData, value: string) {
    setRows(rows.map((r) => {
      if (r.phaseId !== phaseId || !r.migrationMap) return r;
      return { ...r, migrationMap: { ...r.migrationMap, [field]: value } };
    }));
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[180px]">Phase</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[120px]">Pain Points</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[140px]">Target ADP Module</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[140px]">Required Config</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[100px]">Automation</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600 min-w-[100px]">Status</th>
            <th className="px-3 py-3 min-w-[80px]"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.phaseId} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-3">
                <div className="font-medium text-slate-900">{row.sequenceOrder}. {row.phaseName}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${row.stageConfig.color}`}>
                  {row.stageConfig.label}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={row.painPoints}>
                {row.painPoints || "-"}
              </td>
              {row.migrationMap ? (
                <>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={row.migrationMap.targetAdpModule}
                      onChange={(e) => updateField(row.phaseId, "targetAdpModule", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                      placeholder="e.g. Recruitment"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={row.migrationMap.requiredConfig}
                      onChange={(e) => updateField(row.phaseId, "requiredConfig", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={row.migrationMap.automationType}
                      onChange={(e) => updateField(row.phaseId, "automationType", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                    >
                      {AUTOMATION_TYPES.map((t) => (
                        <option key={t} value={t}>{t || "Select..."}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={row.migrationMap.migrationStatus}
                      onChange={(e) => updateField(row.phaseId, "migrationStatus", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                    >
                      {MIGRATION_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleSave(row.migrationMap!)}
                      disabled={savingId === row.migrationMap.id}
                      className="text-xs bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {savingId === row.migrationMap.id ? "..." : "Save"}
                    </button>
                  </td>
                </>
              ) : (
                <td colSpan={5} className="px-3 py-3 text-slate-400 text-xs">No migration data</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
