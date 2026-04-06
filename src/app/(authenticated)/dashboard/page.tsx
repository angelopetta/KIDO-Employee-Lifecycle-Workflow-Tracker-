export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAGES, getStatusConfig, getStageConfig } from "@/lib/constants";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const isAdmin = user.role === "admin" || user.role === "director";

  const departments = await prisma.department.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const phases = await prisma.phase.findMany({
    orderBy: { sequenceOrder: "asc" },
  });

  const phaseDetails = await prisma.phaseDetail.findMany({
    include: { phase: true, department: true },
    ...(isAdmin ? {} : { where: { departmentId: user.departmentId! } }),
  });

  // Group phase details by stage for progress cards
  const stageProgress = STAGES.map((stage) => {
    const stagePhaseDetails = phaseDetails.filter(
      (pd) => pd.phase.stage === stage.key
    );
    const total = stagePhaseDetails.length;
    const completed = stagePhaseDetails.filter(
      (pd) => pd.status === "complete"
    ).length;
    const inProgress = stagePhaseDetails.filter(
      (pd) => pd.status === "in_progress"
    ).length;
    const blocked = stagePhaseDetails.filter(
      (pd) => pd.status === "blocked"
    ).length;
    return { ...stage, total, completed, inProgress, blocked };
  });

  // Recent activity
  const recentActivity = await prisma.phaseDetail.findMany({
    where: {
      NOT: { status: "not_started" },
      ...(isAdmin ? {} : { departmentId: user.departmentId! }),
    },
    include: { phase: true, department: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Department status grid
  const deptStatusData = departments.map((dept) => {
    const deptDetails = phaseDetails.filter((pd) => pd.departmentId === dept.id);
    return {
      department: dept,
      phases: phases
        .filter((p) => p.departmentKeys.split(",").includes(dept.slug))
        .map((p) => {
          const detail = deptDetails.find((pd) => pd.phaseId === p.id);
          return { phase: p, status: detail?.status ?? "na" };
        }),
    };
  });

  // ---- Capture Progress -------------------------------------------------
  // A cell is "captured" when any of the 11 free-text fields has content.
  // (Status alone doesn't count — we want to measure real data capture.)
  const CAPTURE_FIELDS = [
    "trigger",
    "actionsSteps",
    "documentsUsed",
    "documentsCreated",
    "systemsTools",
    "inputsFrom",
    "outputsTo",
    "timeline",
    "painPoints",
    "compliance",
    "notes",
  ] as const;

  function isCaptured(pd: (typeof phaseDetails)[number] | undefined): boolean {
    if (!pd) return false;
    return CAPTURE_FIELDS.some((k) => {
      const v = (pd as unknown as Record<string, string>)[k];
      return typeof v === "string" && v.trim().length > 0;
    });
  }

  // Visible departments depend on the user's role (dept_lead/staff see only their own)
  const visibleDepartments = isAdmin
    ? departments
    : departments.filter((d) => d.id === user.departmentId);

  // Build the universe of "applicable" (phase, department) cells from
  // phase.departmentKeys, then count how many are captured.
  const applicableCells: { phaseId: string; departmentId: string; stage: string }[] = [];
  for (const phase of phases) {
    const phaseDeptSlugs = phase.departmentKeys.split(",").map((s) => s.trim());
    for (const dept of visibleDepartments) {
      if (phaseDeptSlugs.includes(dept.slug)) {
        applicableCells.push({ phaseId: phase.id, departmentId: dept.id, stage: phase.stage });
      }
    }
  }

  const detailByCell = new Map(
    phaseDetails.map((pd) => [`${pd.phaseId}:${pd.departmentId}`, pd])
  );

  const totalCells = applicableCells.length;
  const capturedCells = applicableCells.filter((c) =>
    isCaptured(detailByCell.get(`${c.phaseId}:${c.departmentId}`))
  ).length;
  const capturePct = totalCells > 0 ? Math.round((capturedCells / totalCells) * 100) : 0;

  // Per-stage capture breakdown
  const captureByStage = STAGES.map((stage) => {
    const cells = applicableCells.filter((c) => c.stage === stage.key);
    const captured = cells.filter((c) =>
      isCaptured(detailByCell.get(`${c.phaseId}:${c.departmentId}`))
    ).length;
    return {
      ...stage,
      total: cells.length,
      captured,
      pct: cells.length > 0 ? Math.round((captured / cells.length) * 100) : 0,
    };
  });

  // Next 3 phases to capture — walk phases in sequence order and pick the
  // first 3 that still have any missing departments.
  const nextToCapture: {
    phase: (typeof phases)[number];
    missing: { id: string; name: string; slug: string }[];
  }[] = [];
  for (const phase of phases) {
    if (nextToCapture.length >= 3) break;
    const phaseDeptSlugs = phase.departmentKeys.split(",").map((s) => s.trim());
    const missing = visibleDepartments
      .filter((d) => phaseDeptSlugs.includes(d.slug))
      .filter((d) => !isCaptured(detailByCell.get(`${phase.id}:${d.id}`)))
      .map((d) => ({ id: d.id, name: d.name, slug: d.slug }));
    if (missing.length > 0) {
      nextToCapture.push({ phase, missing });
    }
  }
  // -----------------------------------------------------------------------

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      {/* Capture Progress Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-800">
            {isAdmin ? "Capture Progress" : "My Department's Capture Progress"}
          </h2>
          <span className="text-3xl font-bold text-teal-600">{capturePct}%</span>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          <strong>{capturedCells}</strong> of <strong>{totalCells}</strong> phase-department cells captured
          {totalCells - capturedCells > 0 && (
            <> &nbsp;·&nbsp; <span className="text-slate-500">{totalCells - capturedCells} remaining</span></>
          )}
        </p>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
          <div
            className="bg-teal-500 h-3 rounded-full transition-all"
            style={{ width: `${capturePct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {captureByStage.map((s) => (
            <div key={s.key} className="border border-slate-200 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-slate-700">{s.pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {s.captured} / {s.total} captured
              </p>
            </div>
          ))}
        </div>

        {/* Next 3 to capture */}
        {nextToCapture.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Next to capture
            </h3>
            <ul className="space-y-1.5">
              {nextToCapture.map(({ phase, missing }) => (
                <li key={phase.id} className="text-sm flex flex-wrap items-center gap-x-2">
                  <Link
                    href={`/phases`}
                    className="font-medium text-teal-700 hover:text-teal-900"
                  >
                    {phase.sequenceOrder}. {phase.name}
                  </Link>
                  <span className="text-slate-400 text-xs">
                    ({missing.length} {missing.length === 1 ? "department" : "departments"} remaining:{" "}
                    {missing.map((d) => d.name).join(", ")})
                  </span>
                </li>
              ))}
            </ul>
            {isAdmin && (
              <Link
                href="/bulk-import"
                className="inline-block mt-3 text-xs font-medium text-teal-600 hover:text-teal-800"
              >
                Bulk import one of these phases →
              </Link>
            )}
          </div>
        )}
        {nextToCapture.length === 0 && totalCells > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-sm text-green-700">
            All applicable phase-department cells have been captured. 🎉
          </div>
        )}
      </div>

      {/* Stage Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stageProgress.map((stage) => {
          const stageConfig = getStageConfig(stage.key);
          const pct = stage.total > 0 ? Math.round((stage.completed / stage.total) * 100) : 0;
          return (
            <div key={stage.key} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stageConfig.color}`}>
                  {stage.label}
                </span>
                <span className="text-2xl font-bold text-slate-900">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{stage.completed} complete</span>
                <span>{stage.inProgress} in progress</span>
                {stage.blocked > 0 && (
                  <span className="text-red-600">{stage.blocked} blocked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Status Grid */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Department Status Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-medium text-slate-600">Department</th>
                  {phases.map((p) => (
                    <th key={p.id} className="px-1 py-2 text-center font-medium text-slate-600" title={p.name}>
                      <span className="text-xs">{p.sequenceOrder}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptStatusData.map(({ department, phases: deptPhases }) => (
                  <tr key={department.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/departments/${department.slug}`}
                        className="text-teal-600 hover:text-teal-800 font-medium"
                      >
                        {department.name}
                      </Link>
                    </td>
                    {/* Render a dot for each phase */}
                    {(() => {
                      const phaseMap = new Map(
                        deptPhases.map((dp) => [dp.phase.id, dp.status])
                      );
                      return phases.map((p) => {
                        const status = phaseMap.get(p.id);
                        if (!status) {
                          return <td key={p.id} className="px-1 py-2 text-center"><span className="text-slate-200">-</span></td>;
                        }
                        const cfg = getStatusConfig(status);
                        return (
                          <td key={p.id} className="px-1 py-2 text-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${cfg.color.split(" ")[0]}`} title={`${p.name}: ${cfg.label}`} />
                          </td>
                        );
                      });
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Phases: 1-6 Recruitment, 7-9 Onboarding, 10-12 Development, 13-16 Offboarding</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet. Start updating phase details to see activity here.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((pd) => {
              const statusCfg = getStatusConfig(pd.status);
              return (
                <div key={pd.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <Link
                      href={`/departments/${pd.department.slug}/phases/${pd.phase.slug}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-800"
                    >
                      {pd.phase.name}
                    </Link>
                    <span className="text-sm text-slate-500"> — {pd.department.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {pd.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
