export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { STAGES, getStatusConfig } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = await prisma.department.findUnique({
    where: { slug },
    include: {
      phaseDetails: {
        include: { phase: true },
        orderBy: { phase: { sequenceOrder: "asc" } },
      },
    },
  });

  if (!department) notFound();

  const detailsByStage = STAGES.map((stage) => ({
    ...stage,
    details: department.phaseDetails.filter(
      (pd) => pd.phase.stage === stage.key
    ),
  }));

  return (
    <div>
      <div className="mb-6">
        <Link href="/departments" className="text-sm text-teal-600 hover:text-teal-800">
          &larr; All Departments
        </Link>
        <div className="flex items-center justify-between mt-2 gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{department.name}</h1>
          <Link
            href={`/departments/${slug}/print`}
            className="text-sm text-teal-600 hover:text-teal-800 border border-teal-600 hover:border-teal-800 px-3 py-1.5 rounded-md whitespace-nowrap"
          >
            Printable view
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {detailsByStage.map((stage) => {
          if (stage.details.length === 0) return null;
          return (
            <div key={stage.key} className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className={`px-5 py-3 border-b border-slate-200 ${stage.color} rounded-t-lg`}>
                <h2 className="font-semibold">{stage.label}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {stage.details.map((pd) => {
                  const statusCfg = getStatusConfig(pd.status);
                  return (
                    <Link
                      key={pd.id}
                      href={`/departments/${slug}/phases/${pd.phase.slug}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-slate-900">
                          {pd.phase.sequenceOrder}. {pd.phase.name}
                        </span>
                        {pd.trigger && (
                          <p className="text-sm text-slate-500 mt-1 truncate max-w-lg">
                            Trigger: {pd.trigger}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {pd.updatedAt.toLocaleDateString()}
                        </span>
                        <span className="text-slate-400">&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
