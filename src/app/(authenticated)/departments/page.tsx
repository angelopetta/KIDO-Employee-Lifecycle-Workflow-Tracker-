export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStatusConfig } from "@/lib/constants";
import Link from "next/link";

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      phaseDetails: true,
      _count: { select: { users: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">All Departments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const total = dept.phaseDetails.length;
          const completed = dept.phaseDetails.filter((pd) => pd.status === "complete").length;
          const inProgress = dept.phaseDetails.filter((pd) => pd.status === "in_progress").length;
          const blocked = dept.phaseDetails.filter((pd) => pd.status === "blocked").length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Link
              key={dept.id}
              href={`/departments/${dept.slug}`}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{dept.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <span>{dept._count.users} users</span>
                <span>|</span>
                <span>{total} phases</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{completed}/{total} complete</span>
                {inProgress > 0 && <span className="text-yellow-600">{inProgress} in progress</span>}
                {blocked > 0 && <span className="text-red-600">{blocked} blocked</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
