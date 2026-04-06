export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { STAGES, getStatusConfig } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";

const FIELD_LABELS: { key: string; label: string }[] = [
  { key: "trigger", label: "Trigger" },
  { key: "actionsSteps", label: "Actions / Steps" },
  { key: "documentsUsed", label: "Documents Used" },
  { key: "documentsCreated", label: "Documents Created" },
  { key: "systemsTools", label: "Systems / Tools" },
  { key: "inputsFrom", label: "Inputs From" },
  { key: "outputsTo", label: "Outputs To" },
  { key: "timeline", label: "Timeline" },
  { key: "painPoints", label: "Pain Points" },
  { key: "compliance", label: "Compliance" },
  { key: "notes", label: "Notes" },
];

export default async function DepartmentPrintPage({
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
    details: department.phaseDetails.filter((pd) => pd.phase.stage === stage.key),
  }));

  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto bg-white print:max-w-none">
      {/* Screen-only toolbar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/departments/${slug}`}
          className="text-sm text-teal-600 hover:text-teal-800"
        >
          &larr; Back to {department.name}
        </Link>
        <PrintButton />
      </div>

      {/* Document header */}
      <header className="mb-8 pb-4 border-b border-slate-300">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          KIDO Employee Lifecycle Workflow
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{department.name}</h1>
        <p className="text-sm text-slate-500 mt-2">
          Generated {now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      {/* Stages */}
      {detailsByStage.map((stage) => {
        if (stage.details.length === 0) return null;
        return (
          <section key={stage.key} className="mb-8 print:break-inside-avoid">
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-200">
              {stage.label}
            </h2>
            <div className="space-y-6">
              {stage.details.map((pd) => {
                const statusCfg = getStatusConfig(pd.status);
                return (
                  <article
                    key={pd.id}
                    className="border border-slate-200 rounded-md p-4 print:border-slate-300 print:rounded-none print:break-inside-avoid"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Phase {pd.phase.sequenceOrder} — {pd.phase.name}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.color} print:border print:border-slate-400`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm print:grid-cols-2">
                      {FIELD_LABELS.map((f) => {
                        const value = (pd as unknown as Record<string, string>)[f.key] || "";
                        return (
                          <div key={f.key} className="print:break-inside-avoid">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {f.label}
                            </dt>
                            <dd className="mt-0.5 text-slate-800 whitespace-pre-wrap">
                              {value.trim() ? value : <span className="text-slate-300">—</span>}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    <p className="mt-3 text-xs text-slate-400">
                      Last updated: {pd.updatedAt.toLocaleDateString()}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
