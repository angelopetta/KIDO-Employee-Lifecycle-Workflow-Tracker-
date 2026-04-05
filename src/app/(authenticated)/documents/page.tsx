import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DocumentsClient from "@/components/documents/DocumentsClient";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const isAdmin = user.role === "admin" || user.role === "director";
  const canEdit = user.role !== "dept_staff";

  const documents = await prisma.document.findMany({
    include: { phase: true, department: true },
    orderBy: { createdAt: "desc" },
    ...(isAdmin ? {} : { where: { departmentId: user.departmentId } }),
  });

  const phases = await prisma.phase.findMany({ orderBy: { sequenceOrder: "asc" } });
  const departments = await prisma.department.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Document Inventory</h1>
      <DocumentsClient
        initialDocuments={JSON.parse(JSON.stringify(documents))}
        phases={JSON.parse(JSON.stringify(phases))}
        departments={JSON.parse(JSON.stringify(departments))}
        canEdit={canEdit}
      />
    </div>
  );
}
