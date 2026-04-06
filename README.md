# KIDO Employee Lifecycle Workflow Tracker

A web application for KI Family Law that replaces an Excel-based data capture workbook, managing 16 employee lifecycle phases across 7 departments. Currently in **Phase 1 (Capture Mode)** — mapping existing HR workflows before transitioning to operational automation.

## Live App

Deployed on Vercel: [kido-employee-lifecycle-workflow-tr.vercel.app](https://kido-employee-lifecycle-workflow-tr.vercel.app)

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Prisma 6** ORM with **Supabase PostgreSQL**
- **NextAuth.js v4** (Credentials provider, JWT sessions)
- **Vercel** (production hosting)

## Features

- **Dashboard** — Stage progress cards, department status grid, recent activity
- **Department Views** — Per-phase detail forms with 11 capture fields + status tracking
- **All-Phases Matrix** — 16 phases x 7 departments overview
- **Document Inventory** — CRUD with type/department/phase filters
- **Handoff Matrix** — Cross-department input/output mapping
- **Gap Analysis** — Aggregated pain points across all workflows
- **ADP Migration Map** — Phase-to-ADP module mapping for future HRIS migration
- **CSV/JSON Export** — Filtered data export
- **Admin User Management** — Role-based access control (admin, director, dept_lead, dept_staff)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database (Supabase recommended)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env.local

# Run database migrations
npx prisma migrate deploy

# Seed the database (creates departments, phases, and test users)
npm run seed

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string (port 6543, pgbouncer) |
| `DIRECT_URL` | Supabase direct connection string (port 5432, for migrations) |
| `NEXTAUTH_SECRET` | JWT signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Only needed locally (`http://localhost:3000`) |

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production (runs prisma generate first)
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database (with safety confirmation)
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # REST API routes
│   ├── login/                  # Public login page
│   └── (authenticated)/        # Protected route group
│       ├── dashboard/          # Main dashboard
│       ├── departments/        # Department & phase views
│       ├── phases/             # All-phases matrix
│       ├── documents/          # Document inventory
│       ├── handoff-matrix/     # Cross-department I/O
│       ├── gap-analysis/       # Pain points view
│       ├── adp-migration/      # ADP module mapping
│       ├── export/             # Data export
│       └── admin/users/        # User management
├── components/                 # React components
├── lib/                        # Prisma client, auth config, constants
├── middleware.ts               # Auth redirect middleware
└── types/                      # TypeScript type augmentations
prisma/
├── schema.prisma               # Database schema (6 models)
└── seed.ts                     # Seed script
```

## Data Model

- **User** — Email/password auth with 4 roles
- **Department** — 7 departments (HR, Supervisors, Finance/Payroll, IT, Training, Communications, Director's Office)
- **Phase** — 16 lifecycle phases across 4 stages (Recruitment, Onboarding, Development, Offboarding)
- **PhaseDetail** — Core capture form (11 fields per phase-department intersection)
- **Document** — Document inventory with type, format, location tracking
- **MigrationMap** — ADP module mapping per phase

## Roles

| Role | Access |
|---|---|
| `admin` | Full access + user management |
| `director` | Read access to all data |
| `dept_lead` | Edit own department's phase details |
| `dept_staff` | Edit own department's phase details |

## Roadmap

- **Phase 1 (Current)**: Capture Mode — data entry for mapping existing workflows
- **Phase 2 (Future)**: Operational Mode — notifications, hire pipeline tracking, deadline alerts

See `docs/PRD.md` for the full product requirements document.

## License

ISC
