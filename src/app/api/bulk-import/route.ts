import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FIELD_KEYS = [
  "trigger",
  "actionsSteps",
  "documentsUsed",
  "documentsCreated",
  "systemsTools",
  "inputsFrom",
  "outputsTo",
  "timeline",
  "painPoints",
  "compliance",
  "notes",
] as const;

const VALID_STATUSES = ["not_started", "in_progress", "blocked", "complete", "na"];

type EntryInput = {
  departmentSlug?: string;
  status?: string;
} & Partial<Record<(typeof FIELD_KEYS)[number], string>>;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "dept_lead") {
    return NextResponse.json(
      { error: "Only admins and department leads can bulk import." },
      { status: 403 }
    );
  }

  let body: { phaseSlug?: string; entries?: EntryInput[]; dryRun?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { phaseSlug, entries, dryRun } = body;

  if (!phaseSlug || typeof phaseSlug !== "string") {
    return NextResponse.json({ error: "phaseSlug is required." }, { status: 400 });
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "entries must be a non-empty array." }, { status: 400 });
  }

  const phase = await prisma.phase.findUnique({ where: { slug: phaseSlug } });
  if (!phase) {
    return NextResponse.json({ error: `Unknown phase slug: ${phaseSlug}` }, { status: 400 });
  }

  const departments = await prisma.department.findMany();
  const deptBySlug = new Map(departments.map((d) => [d.slug, d]));

  // Validate every entry
  const errors: string[] = [];
  const normalized: {
    departmentId: string;
    departmentSlug: string;
    departmentName: string;
    data: Record<string, string>;
  }[] = [];

  entries.forEach((entry, idx) => {
    if (!entry || typeof entry !== "object") {
      errors.push(`Entry ${idx}: not an object.`);
      return;
    }
    const slug = entry.departmentSlug;
    if (!slug || typeof slug !== "string") {
      errors.push(`Entry ${idx}: missing departmentSlug.`);
      return;
    }
    const dept = deptBySlug.get(slug);
    if (!dept) {
      errors.push(`Entry ${idx}: unknown departmentSlug "${slug}".`);
      return;
    }

    // Authorization: dept_lead can only import for their own department
    if (role === "dept_lead" && session.user.departmentId !== dept.id) {
      errors.push(
        `Entry ${idx}: forbidden — department leads can only import for their own department.`
      );
      return;
    }

    const data: Record<string, string> = {};
    for (const key of FIELD_KEYS) {
      const v = entry[key];
      if (v == null) {
        data[key] = "";
      } else if (typeof v === "string") {
        data[key] = v;
      } else {
        errors.push(`Entry ${idx} (${slug}): field "${key}" must be a string.`);
        return;
      }
    }

    let status = entry.status ?? "not_started";
    if (!VALID_STATUSES.includes(status)) {
      errors.push(
        `Entry ${idx} (${slug}): invalid status "${status}". Must be one of: ${VALID_STATUSES.join(", ")}.`
      );
      return;
    }
    data.status = status;

    normalized.push({
      departmentId: dept.id,
      departmentSlug: dept.slug,
      departmentName: dept.name,
      data,
    });
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  // Check for duplicate departmentSlugs
  const seen = new Set<string>();
  for (const n of normalized) {
    if (seen.has(n.departmentSlug)) {
      return NextResponse.json(
        { error: `Duplicate departmentSlug "${n.departmentSlug}" in entries.` },
        { status: 400 }
      );
    }
    seen.add(n.departmentSlug);
  }

  // Look up existing PhaseDetails to compute create vs. overwrite
  const existing = await prisma.phaseDetail.findMany({
    where: {
      phaseId: phase.id,
      departmentId: { in: normalized.map((n) => n.departmentId) },
    },
  });
  const existingByDeptId = new Map(existing.map((e) => [e.departmentId, e]));

  const preview = normalized.map((n) => ({
    departmentSlug: n.departmentSlug,
    departmentName: n.departmentName,
    action: existingByDeptId.has(n.departmentId) ? ("overwrite" as const) : ("create" as const),
  }));

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      phase: { slug: phase.slug, name: phase.name },
      preview,
      total: preview.length,
      creates: preview.filter((p) => p.action === "create").length,
      overwrites: preview.filter((p) => p.action === "overwrite").length,
    });
  }

  // Commit in a transaction
  await prisma.$transaction(
    normalized.map((n) =>
      prisma.phaseDetail.upsert({
        where: { phaseId_departmentId: { phaseId: phase.id, departmentId: n.departmentId } },
        create: {
          phaseId: phase.id,
          departmentId: n.departmentId,
          ...n.data,
        },
        update: { ...n.data },
      })
    )
  );

  return NextResponse.json({
    ok: true,
    phase: { slug: phase.slug, name: phase.name },
    preview,
    total: preview.length,
    creates: preview.filter((p) => p.action === "create").length,
    overwrites: preview.filter((p) => p.action === "overwrite").length,
  });
}

// GET — return reference data needed by the bulk-import UI (phases, departments)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [phases, departments] = await Promise.all([
    prisma.phase.findMany({ orderBy: { sequenceOrder: "asc" } }),
    prisma.department.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return NextResponse.json({
    phases: phases.map((p) => ({ slug: p.slug, name: p.name, stage: p.stage, sequenceOrder: p.sequenceOrder })),
    departments: departments.map((d) => ({ slug: d.slug, name: d.name })),
    fieldKeys: FIELD_KEYS,
    validStatuses: VALID_STATUSES,
  });
}
