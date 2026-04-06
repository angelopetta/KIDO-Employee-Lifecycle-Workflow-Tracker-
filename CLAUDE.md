# CLAUDE.md - Project Intelligence for Claude Code

## Project Overview

KIDO Employee Lifecycle Workflow Tracker is a web application replacing an Excel-based data capture workbook used at KI Family Law. It manages 16 employee lifecycle phases across 7 departments. Currently in **Phase 1 (Capture Mode)** — a data-entry tool for mapping existing workflows.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **ORM**: Prisma 6 with PostgreSQL (Supabase)
- **Auth**: NextAuth.js v4 (Credentials provider, JWT sessions)
- **Hosting**: Vercel (production at kido-employee-lifecycle-workflow-tr.vercel.app)

## Project Structure

```
src/
├── app/
│   ├── api/                          # API routes (REST endpoints)
│   │   ├── auth/[...nextauth]/       # NextAuth handler
│   │   ├── documents/                # CRUD for documents
│   │   ├── export/                   # CSV/JSON export
│   │   ├── migration-map/            # ADP migration mapping
│   │   ├── phase-details/            # Phase detail form saves
│   │   └── users/                    # Admin user management
│   ├── login/                        # Public login page
│   └── (authenticated)/              # Route group (requires auth)
│       ├── dashboard/                # Main dashboard
│       ├── departments/[slug]/       # Department phase views
│       │   └── phases/[phaseSlug]/   # Per-phase detail form
│       ├── phases/                   # All-phases matrix (16×7)
│       ├── documents/                # Document inventory
│       ├── handoff-matrix/           # Cross-department I/O
│       ├── gap-analysis/             # Pain points aggregation
│       ├── adp-migration/            # ADP module mapping
│       ├── export/                   # Export page
│       └── admin/users/              # User management (admin only)
├── components/                       # React components
│   ├── phases/PhaseDetailForm.tsx    # Core 11-field capture form
│   ├── documents/DocumentsClient.tsx # Document CRUD UI
│   ├── Header.tsx, Sidebar.tsx       # Layout components
│   └── SessionProvider.tsx           # NextAuth session wrapper
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth config + helpers
│   └── constants.ts                  # Phases, departments, stages
├── middleware.ts                      # Auth redirect middleware
└── types/next-auth.d.ts             # Session type augmentation
prisma/
├── schema.prisma                     # 6 models: User, Department, Phase, PhaseDetail, Document, MigrationMap
└── seed.ts                           # Seed script (has safety confirmation, use --force to skip)
```

## Key Concepts

### Roles (4 levels)
- `admin` — Full access, user management
- `director` — Read access to everything
- `dept_lead` — Edit own department's phase details
- `dept_staff` — Edit own department's phase details

### Lifecycle Stages (4 stages, 16 phases)
- **Recruitment**: Phases 1-6 (Pre-Hire Activation through Offer Acceptance)
- **Onboarding**: Phases 7-9 (Pre-Start Setup through Orientation Complete)
- **Development**: Phases 10-12 (Probation Tracking through Ongoing Development)
- **Offboarding**: Phases 13-16 (Resignation/Termination through Knowledge Captured)

### Departments (7)
HR, Supervisors, Finance/Payroll, IT, Training, Communications, Director's Office

### PhaseDetail — Core Data Model
The 11-field capture form per phase-department intersection:
trigger, actionsSteps, documentsUsed, documentsCreated, systemsTools, inputsFrom, outputsTo, timeline, painPoints, compliance, notes (+ status field)

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Prisma generate + Next.js build
npm run lint         # ESLint
npm run seed         # Seed database (prompts for confirmation)
npm run seed -- --force  # Seed without confirmation
```

## Database

- **Supabase PostgreSQL** — connection via pooled URL (port 6543 with pgbouncer)
- Prisma schema uses `directUrl` for migrations (direct connection, port 5432)
- All server-side pages use `export const dynamic = "force-dynamic"` for Vercel serverless compatibility

## Environment Variables

```
DATABASE_URL         # Supabase pooled connection string (pgbouncer)
DIRECT_URL           # Supabase direct connection string (for migrations)
NEXTAUTH_SECRET      # JWT signing secret
NEXTAUTH_URL         # Only needed locally (http://localhost:3000)
```

## Important Patterns

- **Route groups**: `(authenticated)` layout wraps all protected pages with session check + sidebar/header
- **Client/Server split**: Server components fetch data, client components handle interactivity (e.g., `DocumentsClient.tsx`, `UsersClient.tsx`)
- **API routes**: All under `src/app/api/` — standard REST with role-based guards
- **Middleware**: `src/middleware.ts` redirects unauthenticated users to `/login`
- **No test suite** currently — this is a prototype/MVP

## Seed Users

All passwords: `password123`
- Admins: angelo@kido.ca, natasha@kido.ca
- Director: director@kido.ca
- Dept leads: hr.lead@kido.ca, finance.lead@kido.ca, it.lead@kido.ca, training.lead@kido.ca, comms.lead@kido.ca, supervisor@kido.ca
- Dept staff: hr.staff@kido.ca, finance.staff@kido.ca

## Notes

- Angelo (project owner) is not a developer — provide clear, step-by-step guidance
- The PRD is at `docs/PRD.md` — defines Phase 1 (Capture Mode, built) and Phase 2 (Operational Mode, future)
- Angelo has already entered Pre-Hire Activation data for all departments in production
- Phase 2 will add: notifications, hire pipeline tracking, deadline alerts, operational workflows
