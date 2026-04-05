import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user;
  const body = await request.json();

  // Fetch the phase detail to check authorization
  const phaseDetail = await prisma.phaseDetail.findUnique({
    where: { id },
    include: { department: true },
  });

  if (!phaseDetail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authorization check
  const canEdit =
    user.role === "admin" ||
    (user.role === "director" && phaseDetail.department.slug === "director") ||
    (user.role === "dept_lead" && user.departmentId === phaseDetail.departmentId);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.phaseDetail.update({
    where: { id },
    data: {
      trigger: body.trigger ?? "",
      actionsSteps: body.actionsSteps ?? "",
      documentsUsed: body.documentsUsed ?? "",
      documentsCreated: body.documentsCreated ?? "",
      systemsTools: body.systemsTools ?? "",
      inputsFrom: body.inputsFrom ?? "",
      outputsTo: body.outputsTo ?? "",
      timeline: body.timeline ?? "",
      painPoints: body.painPoints ?? "",
      compliance: body.compliance ?? "",
      status: body.status ?? "not_started",
      notes: body.notes ?? "",
    },
  });

  return NextResponse.json(updated);
}
