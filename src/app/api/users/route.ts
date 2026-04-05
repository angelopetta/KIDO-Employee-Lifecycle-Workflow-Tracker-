import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });

  // Remove password hashes from response
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  return NextResponse.json(safeUsers);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.email || !body.name || !body.password || !body.role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash: hashSync(body.password, 10),
      role: body.role,
      departmentId: body.departmentId || null,
    },
    include: { department: true },
  });

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
