export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { STAGES, getStatusConfig } from "@/lib/constants";
import Link from "next/link";

export default async function AllPhasesPage() {
  const departments = await prisma.department.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const phases = await prisma.phase.findMany({
    orderBy: { sequenceOrder: "asc" },
    include: {
      phaseDetails: {
        include: { department: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">All Phases</h1>

      {STAGES.map((stage) => {
        const stagePhases = phases.filter((p) => p.stage === stage.key);
        if (stagePhases.length === 0) return null;

        return (
          <div key={stage.key} className="mb-8">
            <div className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3 ${stage.color}`}>
              {stage.label}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 min-w-[200px]">
                      Phase
                    </th>
                    {departments.map((dept) => (
                      <th
                        key={dept.id}
                        className="px-3 py-3 text-center font-medium text-slate-600 min-w-[100px]"
                      >
                        <span className="text-xs">{dept.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stagePhases.map((phase) => (
                    <tr key={phase.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {phase.sequenceOrder}. {phase.name}
                      </td>
                      {departments.map((dept) => {
                        const detail = phase.phaseDetails.find(
                          (pd) => pd.departmentId === dept.id
                        );
                        if (!detail) {
                          return (
                            <td key={dept.id} className="px-3 py-3 text-center">
                              <span className="text-slate-200">-</span>
                            </td>
                          );
                        }
                        const cfg = getStatusConfig(detail.status);
                        return (
                          <td key={dept.id} className="px-3 py-3 text-center">
                            <Link
                              href={`/departments/${dept.slug}/phases/${phase.slug}`}
                              className={`inline-block text-xs px-2 py-1 rounded-full hover:ring-2 hover:ring-teal-300 transition-all ${cfg.color}`}
                            >
                              {cfg.label}
                            </Link>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
