import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const isAdmin = user.role === "admin" || user.role === "director";
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const stage = searchParams.get("stage") || "";
  const department = searchParams.get("department") || "";

  const where: Record<string, unknown> = {};
  if (!isAdmin && user.departmentId) {
    where.departmentId = user.departmentId;
  }
  if (department) {
    where.department = { slug: department };
  }
  if (stage) {
    where.phase = { stage };
  }

  const phaseDetails = await prisma.phaseDetail.findMany({
    where,
    include: { phase: true, department: true },
    orderBy: { phase: { sequenceOrder: "asc" } },
  });

  if (format === "json") {
    return NextResponse.json(phaseDetails);
  }

  // CSV export
  const headers = [
    "Stage", "Phase", "Department", "Trigger", "Actions/Steps",
    "Documents Used", "Documents Created", "Systems/Tools",
    "Inputs From", "Outputs To", "Timeline", "Pain Points",
    "Compliance", "Status", "Notes", "Last Updated",
  ];

  const csvRows = [headers.join(",")];

  for (const pd of phaseDetails) {
    const row = [
      pd.phase.stage,
      pd.phase.name,
      pd.department.name,
      pd.trigger,
      pd.actionsSteps,
      pd.documentsUsed,
      pd.documentsCreated,
      pd.systemsTools,
      pd.inputsFrom,
      pd.outputsTo,
      pd.timeline,
      pd.painPoints,
      pd.compliance,
      pd.status,
      pd.notes,
      pd.updatedAt.toISOString(),
    ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    csvRows.push(row.join(","));
  }

  const csv = csvRows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="kido-workflow-export.csv"',
    },
  });
}
