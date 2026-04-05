"use client";

import { signOut, useSession } from "next-auth/react";
import { ROLE_LABELS } from "@/lib/constants";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">
        Employee Lifecycle Workflow Tracker
      </h2>
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-500">
              {ROLE_LABELS[user.role] ?? user.role}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
