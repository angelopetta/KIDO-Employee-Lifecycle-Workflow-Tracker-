"use client";

import { useState } from "react";
import { ROLE_LABELS } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
  slug: string;
}

const ROLES = ["admin", "director", "dept_lead", "dept_staff"];

export default function UsersClient({
  initialUsers,
  departments,
}: {
  initialUsers: User[];
  departments: Department[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "dept_staff", departmentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers([created, ...users]);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "dept_staff", departmentId: "" });
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create user");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">{users.length} users</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-3 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="">None (Admin)</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name || !form.email || !form.password || saving}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-3 py-3 font-medium text-slate-600">Department</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-3 py-3 text-slate-600">{user.email}</td>
                <td className="px-3 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-600">{user.department?.name || "-"}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
