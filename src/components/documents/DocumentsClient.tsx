"use client";

import { useState } from "react";

interface Doc {
  id: string;
  name: string;
  type: string;
  format: string;
  location: string;
  phaseId: string | null;
  departmentId: string | null;
  collected: boolean;
  adpEquivalent: string;
  notes: string;
  phase?: { name: string } | null;
  department?: { name: string } | null;
}

interface Phase { id: string; name: string; }
interface Department { id: string; name: string; }

const DOC_TYPES = ["template", "form", "checklist", "policy", "other"];

export default function DocumentsClient({
  initialDocuments,
  phases,
  departments,
  canEdit,
}: {
  initialDocuments: Doc[];
  phases: Phase[];
  departments: Department[];
  canEdit: boolean;
}) {
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type: "", collected: "" });
  const [form, setForm] = useState({
    name: "", type: "other", format: "", location: "",
    phaseId: "", departmentId: "", adpEquivalent: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = documents.filter((d) => {
    if (filter.type && d.type !== filter.type) return false;
    if (filter.collected === "yes" && !d.collected) return false;
    if (filter.collected === "no" && d.collected) return false;
    return true;
  });

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      created.phase = phases.find((p) => p.id === form.phaseId) || null;
      created.department = departments.find((d) => d.id === form.departmentId) || null;
      setDocuments([created, ...documents]);
      setShowForm(false);
      setForm({ name: "", type: "other", format: "", location: "", phaseId: "", departmentId: "", adpEquivalent: "", notes: "" });
    }
    setSaving(false);
  }

  async function toggleCollected(doc: Doc) {
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...doc, collected: !doc.collected }),
    });
    if (res.ok) {
      setDocuments(documents.map((d) => d.id === doc.id ? { ...d, collected: !d.collected } : d));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments(documents.filter((d) => d.id !== id));
    }
  }

  return (
    <div>
      {/* Filters and Add button */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="">All Types</option>
          {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.collected}
          onChange={(e) => setFilter({ ...filter, collected: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="yes">Collected</option>
          <option value="no">Not Collected</option>
        </select>
        <span className="text-sm text-slate-500">{filtered.length} documents</span>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="ml-auto bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Document"}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
              <input type="text" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} placeholder="Word, PDF, Excel..." className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Shared drive, email..." className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phase</label>
              <select value={form.phaseId} onChange={(e) => setForm({ ...form, phaseId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="">None</option>
                {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="">None</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ADP Equivalent</label>
              <input type="text" value={form.adpEquivalent} onChange={(e) => setForm({ ...form, adpEquivalent: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name || saving}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Adding..." : "Add Document"}
          </button>
        </div>
      )}

      {/* Document table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Type</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Format</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Phase</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Department</th>
              <th className="text-center px-3 py-3 font-medium text-slate-600">Collected</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">ADP Equiv.</th>
              {canEdit && <th className="px-3 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-4 py-8 text-center text-slate-500">
                  No documents found. {canEdit && "Click \"+ Add Document\" to add one."}
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-3 py-3 text-slate-600 capitalize">{doc.type}</td>
                  <td className="px-3 py-3 text-slate-600">{doc.format || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{doc.phase?.name || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{doc.department?.name || "-"}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => canEdit && toggleCollected(doc)}
                      disabled={!canEdit}
                      className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-colors ${
                        doc.collected
                          ? "bg-teal-500 border-teal-500 text-white"
                          : "border-slate-300 hover:border-teal-400"
                      }`}
                    >
                      {doc.collected && <span className="text-xs">&#10003;</span>}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{doc.adpEquivalent || "-"}</td>
                  {canEdit && (
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
