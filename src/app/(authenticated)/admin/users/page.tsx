import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersClient from "@/components/UsersClient";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });

  const departments = await prisma.department.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>
      <UsersClient
        initialUsers={JSON.parse(JSON.stringify(safeUsers))}
        departments={JSON.parse(JSON.stringify(departments))}
      />
    </div>
  );
}
