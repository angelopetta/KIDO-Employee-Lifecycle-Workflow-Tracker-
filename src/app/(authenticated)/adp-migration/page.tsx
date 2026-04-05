export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStageConfig } from "@/lib/constants";
import AdpMigrationClient from "@/components/AdpMigrationClient";

export default async function AdpMigrationPage() {
  const phases = await prisma.phase.findMany({
    orderBy: { sequenceOrder: "asc" },
    include: {
      migrationMap: true,
      phaseDetails: {
        select: { painPoints: true },
      },
    },
  });

  const data = phases.map((p) => ({
    phaseId: p.id,
    phaseName: p.name,
    sequenceOrder: p.sequenceOrder,
    stage: p.stage,
    stageConfig: getStageConfig(p.stage),
    painPoints: p.phaseDetails
      .map((pd) => pd.painPoints)
      .filter(Boolean)
      .join("; "),
    migrationMap: p.migrationMap
      ? {
          id: p.migrationMap.id,
          targetAdpModule: p.migrationMap.targetAdpModule,
          requiredConfig: p.migrationMap.requiredConfig,
          automationType: p.migrationMap.automationType,
          migrationStatus: p.migrationMap.migrationStatus,
          notes: p.migrationMap.notes,
        }
      : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">ADP Migration Map</h1>
      <p className="text-sm text-slate-500 mb-6">
        Maps each workflow phase to its target ADP module. This is the bridge between
        current processes and ADP Workforce Now configuration.
      </p>
      <AdpMigrationClient data={JSON.parse(JSON.stringify(data))} />
    </div>
  );
}
