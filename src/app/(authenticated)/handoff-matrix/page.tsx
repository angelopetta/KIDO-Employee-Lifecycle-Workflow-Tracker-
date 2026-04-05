export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function HandoffMatrixPage() {
  const departments = await prisma.department.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const phaseDetails = await prisma.phaseDetail.findMany({
    include: { phase: true, department: true },
  });

  // Build the handoff matrix: from department -> to department -> details
  const matrix: Record<string, Record<string, string[]>> = {};
  for (const dept of departments) {
    matrix[dept.slug] = {};
    for (const other of departments) {
      matrix[dept.slug][other.slug] = [];
    }
  }

  // Parse outputsTo and inputsFrom to populate the matrix
  for (const pd of phaseDetails) {
    const fromSlug = pd.department.slug;

    // outputsTo references: this department sends to others
    if (pd.outputsTo) {
      for (const dept of departments) {
        if (dept.slug !== fromSlug && pd.outputsTo.toLowerCase().includes(dept.name.toLowerCase())) {
          matrix[fromSlug][dept.slug].push(`${pd.phase.name}: ${pd.outputsTo.substring(0, 100)}`);
        }
      }
    }

    // inputsFrom references: others send to this department
    if (pd.inputsFrom) {
      for (const dept of departments) {
        if (dept.slug !== fromSlug && pd.inputsFrom.toLowerCase().includes(dept.name.toLowerCase())) {
          matrix[dept.slug][fromSlug].push(`${pd.phase.name}: ${pd.inputsFrom.substring(0, 100)}`);
        }
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Handoff Matrix</h1>
      <p className="text-sm text-slate-500 mb-6">
        Shows what each department sends to and receives from every other department.
        Data is derived from the &quot;Inputs From&quot; and &quot;Outputs To&quot; fields in phase details.
      </p>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-medium text-slate-600 min-w-[120px]">
                From &#8595; / To &#8594;
              </th>
              {departments.map((dept) => (
                <th key={dept.id} className="px-3 py-3 text-center font-medium text-slate-600 min-w-[100px]">
                  <span className="text-xs">{dept.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((fromDept) => (
              <tr key={fromDept.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-900 text-xs">{fromDept.name}</td>
                {departments.map((toDept) => {
                  const items = matrix[fromDept.slug]?.[toDept.slug] ?? [];
                  const isSelf = fromDept.id === toDept.id;
                  return (
                    <td
                      key={toDept.id}
                      className={`px-3 py-3 text-center ${
                        isSelf ? "bg-slate-100" : items.length > 0 ? "bg-teal-50" : ""
                      }`}
                    >
                      {isSelf ? (
                        <span className="text-slate-300">-</span>
                      ) : items.length > 0 ? (
                        <span
                          className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full cursor-help"
                          title={items.join("\n\n")}
                        >
                          {items.length}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Hover over a number to see handoff details. Empty cells may indicate missing connections.
        Update &quot;Inputs From&quot; and &quot;Outputs To&quot; in phase details to populate this matrix.
      </p>
    </div>
  );
}
