import { prisma } from "@/lib/prisma";
import { getStageConfig } from "@/lib/constants";
import Link from "next/link";

export default async function GapAnalysisPage() {
  const phaseDetails = await prisma.phaseDetail.findMany({
    where: { NOT: { painPoints: "" } },
    include: { phase: true, department: true },
    orderBy: { phase: { sequenceOrder: "asc" } },
  });

  // Group by department
  const byDepartment: Record<string, typeof phaseDetails> = {};
  for (const pd of phaseDetails) {
    const key = pd.department.name;
    if (!byDepartment[key]) byDepartment[key] = [];
    byDepartment[key].push(pd);
  }

  const totalGaps = phaseDetails.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Gap Analysis</h1>
      <p className="text-sm text-slate-500 mb-6">
        Consolidated pain points from all phase details, grouped by department.
        {totalGaps > 0
          ? ` ${totalGaps} pain points identified across ${Object.keys(byDepartment).length} departments.`
          : " No pain points documented yet. Update phase details to populate this view."}
      </p>

      {totalGaps === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            No pain points have been documented yet. Visit phase detail pages and fill in the
            &quot;Pain Points&quot; field to populate this analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDepartment).map(([deptName, details]) => (
            <div key={deptName} className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 rounded-t-lg flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">{deptName}</h2>
                <span className="text-xs text-slate-500">{details.length} pain points</span>
              </div>
              <div className="divide-y divide-slate-100">
                {details.map((pd) => {
                  const stageConfig = getStageConfig(pd.phase.stage);
                  return (
                    <div key={pd.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/departments/${pd.department.slug}/phases/${pd.phase.slug}`}
                          className="text-sm font-medium text-teal-600 hover:text-teal-800"
                        >
                          {pd.phase.sequenceOrder}. {pd.phase.name}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stageConfig.color}`}>
                          {stageConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 bg-amber-50 border-l-4 border-amber-400 pl-3 py-2">
                        {pd.painPoints}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
