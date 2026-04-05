import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getStageConfig } from "@/lib/constants";
import PhaseDetailForm from "@/components/phases/PhaseDetailForm";
import Link from "next/link";

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; phaseSlug: string }>;
}) {
  const { slug, phaseSlug } = await params;
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const department = await prisma.department.findUnique({ where: { slug } });
  const phase = await prisma.phase.findUnique({ where: { slug: phaseSlug } });

  if (!department || !phase) notFound();

  const phaseDetail = await prisma.phaseDetail.findUnique({
    where: {
      phaseId_departmentId: {
        phaseId: phase.id,
        departmentId: department.id,
      },
    },
  });

  if (!phaseDetail) notFound();

  // Determine edit permissions
  const canEdit =
    user.role === "admin" ||
    (user.role === "director" && department.slug === "director") ||
    (user.role === "dept_lead" && user.departmentId === department.id);

  const stageConfig = getStageConfig(phase.stage);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/departments/${slug}`}
          className="text-sm text-teal-600 hover:text-teal-800"
        >
          &larr; {department.name}
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {phase.sequenceOrder}. {phase.name}
          </h1>
          <span className={`text-xs px-2.5 py-1 rounded-full ${stageConfig.color}`}>
            {stageConfig.label}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {department.name} — Phase detail view
        </p>
      </div>

      <PhaseDetailForm
        phaseDetail={phaseDetail}
        canEdit={canEdit}
      />
    </div>
  );
}
