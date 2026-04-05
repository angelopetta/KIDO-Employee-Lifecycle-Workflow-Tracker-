import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "director"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.migrationMap.update({
    where: { id },
    data: {
      targetAdpModule: body.targetAdpModule ?? "",
      requiredConfig: body.requiredConfig ?? "",
      automationType: body.automationType ?? "",
      migrationStatus: body.migrationStatus ?? "not_started",
      notes: body.notes ?? "",
    },
  });

  return NextResponse.json(updated);
}
