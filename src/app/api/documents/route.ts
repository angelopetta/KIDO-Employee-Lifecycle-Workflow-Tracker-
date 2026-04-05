import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const isAdmin = user.role === "admin" || user.role === "director";

  const documents = await prisma.document.findMany({
    include: { phase: true, department: true },
    orderBy: { createdAt: "desc" },
    ...(isAdmin ? {} : { where: { departmentId: user.departmentId } }),
  });

  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  if (user.role === "dept_staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const doc = await prisma.document.create({
    data: {
      name: body.name,
      type: body.type || "other",
      format: body.format || "",
      location: body.location || "",
      phaseId: body.phaseId || null,
      departmentId: body.departmentId || null,
      collected: body.collected || false,
      adpEquivalent: body.adpEquivalent || "",
      notes: body.notes || "",
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
