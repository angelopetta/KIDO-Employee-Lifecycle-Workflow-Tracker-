import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const departments = [
  { name: "HR", slug: "hr", displayOrder: 1 },
  { name: "Supervisors", slug: "supervisors", displayOrder: 2 },
  { name: "Finance/Payroll", slug: "finance", displayOrder: 3 },
  { name: "IT", slug: "it", displayOrder: 4 },
  { name: "Training", slug: "training", displayOrder: 5 },
  { name: "Communications", slug: "communications", displayOrder: 6 },
  { name: "Director's Office", slug: "director", displayOrder: 7 },
];

const phases = [
  { name: "Job Opening Request", slug: "job-opening-request", stage: "recruitment", sequenceOrder: 1, depts: ["director", "hr", "supervisors"] },
  { name: "Job Posting & Promotion", slug: "job-posting-promotion", stage: "recruitment", sequenceOrder: 2, depts: ["hr", "communications"] },
  { name: "Screening & Shortlisting", slug: "screening-shortlisting", stage: "recruitment", sequenceOrder: 3, depts: ["director", "hr", "supervisors"] },
  { name: "Interviews & Evaluation", slug: "interviews-evaluation", stage: "recruitment", sequenceOrder: 4, depts: ["director", "hr", "supervisors", "communications"] },
  { name: "Selection & References", slug: "selection-references", stage: "recruitment", sequenceOrder: 5, depts: ["hr", "supervisors"] },
  { name: "Offer & Acceptance", slug: "offer-acceptance", stage: "recruitment", sequenceOrder: 6, depts: ["director", "hr", "supervisors"] },
  { name: "Pre-Hire Activation", slug: "pre-hire-activation", stage: "onboarding", sequenceOrder: 7, depts: ["hr", "supervisors", "finance", "it", "training", "communications"] },
  { name: "Day 1", slug: "day-1", stage: "onboarding", sequenceOrder: 8, depts: ["hr", "supervisors", "finance", "it", "training", "communications"] },
  { name: "Week 1", slug: "week-1", stage: "onboarding", sequenceOrder: 9, depts: ["hr", "supervisors", "finance", "it", "training", "communications"] },
  { name: "Month 1", slug: "month-1", stage: "development", sequenceOrder: 10, depts: ["hr", "supervisors", "finance", "it", "training", "communications"] },
  { name: "Months 2\u20133", slug: "months-2-3", stage: "development", sequenceOrder: 11, depts: ["director", "hr", "supervisors", "it", "training"] },
  { name: "Ongoing", slug: "ongoing", stage: "development", sequenceOrder: 12, depts: ["director", "hr", "supervisors", "finance", "it", "training", "communications"] },
  { name: "Departure Trigger", slug: "departure-trigger", stage: "offboarding", sequenceOrder: 13, depts: ["director", "hr", "supervisors"] },
  { name: "Transition", slug: "transition", stage: "offboarding", sequenceOrder: 14, depts: ["hr", "supervisors", "training", "communications"] },
  { name: "Final Processing", slug: "final-processing", stage: "offboarding", sequenceOrder: 15, depts: ["director", "hr", "supervisors", "finance", "it", "communications"] },
  { name: "Post-Departure", slug: "post-departure", stage: "offboarding", sequenceOrder: 16, depts: ["hr", "finance", "it"] },
];

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  // Safety check: if data already exists, warn before proceeding
  const existingUsers = await prisma.user.count();
  const existingPhaseDetails = await prisma.phaseDetail.count();

  if (existingUsers > 0 || existingPhaseDetails > 0) {
    console.log("\n⚠️  WARNING: The database already contains data!");
    console.log(`   - ${existingUsers} users`);
    console.log(`   - ${existingPhaseDetails} phase details`);
    console.log("\n   Running the seed will DELETE ALL EXISTING DATA");
    console.log("   including any workflow information you have entered.\n");

    // Check if --force flag was passed
    if (process.argv.includes("--force")) {
      console.log("   --force flag detected. Proceeding with seed...\n");
    } else {
      const confirmed = await askConfirmation("   Are you sure you want to continue? (yes/no): ");
      if (!confirmed) {
        console.log("\n   Seed cancelled. Your data is safe.\n");
        return;
      }
    }
  }

  console.log("Seeding database...");

  // Clear existing data
  await prisma.phaseDetail.deleteMany();
  await prisma.migrationMap.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  const deptMap: Record<string, string> = {};
  for (const dept of departments) {
    const created = await prisma.department.create({ data: dept });
    deptMap[dept.slug] = created.id;
  }
  console.log(`Created ${departments.length} departments`);

  // Create phases and phase details
  let phaseDetailCount = 0;
  for (const phase of phases) {
    const created = await prisma.phase.create({
      data: {
        name: phase.name,
        slug: phase.slug,
        stage: phase.stage,
        sequenceOrder: phase.sequenceOrder,
        departmentKeys: phase.depts.join(","),
      },
    });

    // Create PhaseDetail stubs for each involved department
    for (const deptSlug of phase.depts) {
      await prisma.phaseDetail.create({
        data: {
          phaseId: created.id,
          departmentId: deptMap[deptSlug],
        },
      });
      phaseDetailCount++;
    }

    // Create MigrationMap stub
    await prisma.migrationMap.create({
      data: { phaseId: created.id },
    });
  }
  console.log(`Created ${phases.length} phases with ${phaseDetailCount} phase detail stubs`);

  // Create users
  const passwordHash = hashSync("password123", 10);

  const users = [
    { email: "angelo@kido.ca", name: "Angelo", role: "admin", departmentId: null },
    { email: "natasha@kido.ca", name: "Natasha", role: "admin", departmentId: null },
    { email: "director@kido.ca", name: "Director", role: "director", departmentId: deptMap["director"] },
    { email: "hr.lead@kido.ca", name: "HR Lead", role: "dept_lead", departmentId: deptMap["hr"] },
    { email: "finance.lead@kido.ca", name: "Finance Lead", role: "dept_lead", departmentId: deptMap["finance"] },
    { email: "it.lead@kido.ca", name: "IT Lead", role: "dept_lead", departmentId: deptMap["it"] },
    { email: "training.lead@kido.ca", name: "Training Lead", role: "dept_lead", departmentId: deptMap["training"] },
    { email: "comms.lead@kido.ca", name: "Communications Lead", role: "dept_lead", departmentId: deptMap["communications"] },
    { email: "supervisor@kido.ca", name: "Supervisor", role: "dept_lead", departmentId: deptMap["supervisors"] },
    { email: "hr.staff@kido.ca", name: "HR Staff", role: "dept_staff", departmentId: deptMap["hr"] },
    { email: "finance.staff@kido.ca", name: "Finance Staff", role: "dept_staff", departmentId: deptMap["finance"] },
  ];

  for (const user of users) {
    await prisma.user.create({ data: { ...user, passwordHash } });
  }
  console.log(`Created ${users.length} users (password: password123)`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
