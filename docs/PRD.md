# KIDO — Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin

## KI Family Law

---

# Employee Lifecycle Workflow Tracker — Product Requirements Document

| | |
|---|---|
| **Prepared by** | Angelo |
| **Date** | April 2026 |
| **Version** | 1.0 — Concept |
| **Status** | For Director Review |

---

## 1. Executive Summary

This document proposes the development of a web-based Employee Lifecycle Workflow Tracker to support KIDO's transition from informal, paper-based processes to a structured, digitally managed employee lifecycle system.

The tool serves two purposes in sequence. First, during the current baselining phase, it replaces the Excel-based data capture workbook with an interactive system where departments can validate and refine their workflow data in real time across all three KIDO locations. Second, once workflows are documented and validated, the same tool transitions into an operational tracker that manages actual hires through the recruitment-to-onboarding-to-offboarding pipeline — serving as a bridge until ADP Workforce Now is fully configured.

---

## 2. Why This Matters

KIDO's employee lifecycle currently spans 16 phases across 7 departments. Information moves between departments through informal channels — verbal handoffs, ad-hoc emails, and institutional memory held by individual staff. When handoffs are missed, new hires arrive without accounts, miss their first pay, or start without training plans. This tool makes every handoff visible, every task owned, and every deadline tracked.

| Element | Detail |
|---|---|
| **Investment** | Staff time for requirements validation; development via Claude Code (no external vendor cost) |
| **Timeline** | Phase 1 (Capture Mode): 4–6 weeks. Phase 2 (Operational Mode): 4–6 weeks following baselining completion |
| **Users** | All staff involved in hiring — HR, Supervisors, Finance/Payroll, IT, Training, Communications, and the Director |
| **Hosting** | Cloud-hosted (accessible from KI, Sioux Lookout, and Thunder Bay without VPN) |
| **Lifespan** | Temporary bridge — operational until ADP Workforce Now is fully configured, then transitions to ADP |

---

## 3. The Problem We're Solving

KIDO's recruitment-to-onboarding process works, but it relies on things that don't scale: one person knowing the sequence, verbal handoffs between departments, and spreadsheets that sit in one person's files. The current Data Capture Workbook documents this process well as a static planning tool — but it can't do the following:

- Show a department lead what tasks are waiting for them when they log in each morning
- Alert Finance automatically when HR sends the activation notice for a new hire
- Track where a specific hire is in the 16-phase pipeline, across all 7 departments simultaneously
- Surface bottlenecks — if IT hasn't provisioned accounts 3 days before a start date, nobody sees the risk until Day 1
- Work across locations — staff in Big Trout Lake, Sioux Lookout, and Thunder Bay can't share an Excel file in real time

The workflow tracker solves each of these by digitizing the workbook into a shared, role-based, cloud-accessible system with automated notifications and cross-department visibility.

---

## 4. Product Vision

### Two Modes, One Tool

The application operates in two sequential modes that share the same underlying data model and interface:

### Phase 1: Capture Mode (Baselining)

Used during the current discovery phase. Replaces the Excel workbook with a web-based system where:

- Each department validates their workflow data through their own dedicated view
- Meeting notes, pain points, and action items are captured in structured fields
- Cross-department handoffs are mapped and visualized
- The document inventory, gap analysis, and ADP migration map are maintained collaboratively
- Angelo and Natasha have an admin view showing progress across all departments

### Phase 2: Operational Mode (Live Tracking)

Once workflows are baselined, the same tool transitions to tracking actual hires:

- Each new hire creates a pipeline record that moves through the 16 phases
- Department tasks are generated automatically based on the documented workflow
- Status updates from one department trigger notifications to downstream departments
- Dashboards show where every active hire is across all departments
- Deadline tracking and overdue alerts prevent handoff failures

> **Design Principle**
> This tool supports people and processes — it doesn't replace them. Supervisors still make hiring decisions. HR still manages the process. The tracker makes existing work visible and ensures nothing falls through the cracks between departments.

---

## 5. User Roles & Access

Every user logs in with an individual account. What they can see and edit depends on their role:

| Role | Can View | Can Edit | Assigned To |
|---|---|---|---|
| **Admin** | Everything across all departments | Everything; system configuration; user management | Angelo, Natasha |
| **Director** | All departments; dashboard; governance escalation items | Director-owned phases (approvals, probation decisions, terminations) | Director |
| **Dept Lead** | Own department detail + cross-department status (read-only summary) | Own department's phases, tasks, notes, and status updates | HR Lead, Finance Lead, IT Lead, Training Lead, Comms Lead |
| **Dept Staff** | Own department detail + assigned task list | Assigned tasks only (status updates, notes) | Department team members |

> **KIDO-specific consideration:** For band member employees involved in governance escalation (terminations, Board referrals), the Director role includes visibility into Chief & Council escalation paths. Access to these records should be restricted to the Director and Admin roles only.

---

## 6. Core Features

### 6.1 Department Dashboard

Each department sees a focused view when they log in:

- **My Tasks:** Active tasks assigned to this department, sorted by urgency
- **Pipeline View:** Where each active hire is in the phases this department owns
- **Upstream Notifications:** What's been handed off to this department that needs action
- **Downstream Status:** Read-only view of what other departments are doing for shared hires
- **Overdue Alerts:** Tasks past deadline highlighted in red

### 6.2 Workflow Map (Visual)

An interactive visualization of the complete 16-phase lifecycle showing:

- All 7 department swim lanes with phase ownership mapped
- Color-coded status for each department's tasks within each phase
- Handoff arrows showing information flow between departments
- Click-through to phase detail from any node in the map

In Capture Mode, this visualization shows which phases have been documented and validated versus which are still pending. In Operational Mode, it shows real-time status for active hires.

### 6.3 Phase Detail View

Each of the 16 workflow phases has a structured detail page capturing the same data elements as the current workbook, organized for easy input and review:

| Field | Description |
|---|---|
| **Trigger** | What kicks off this phase (email, verbal, system notification, automatic) |
| **Actions / Steps** | What actually happens — not what policy says, but what staff really do |
| **Documents Used** | Templates, forms, checklists consumed in this phase |
| **Documents Created** | Outputs produced; who receives them |
| **Systems / Tools** | ADP, email, shared drives, paper files, Excel, etc. |
| **Inputs From** | What this department needs from other departments to act |
| **Outputs To** | What this department passes to downstream departments |
| **Timeline** | How long this phase takes; SLAs or deadlines |
| **Pain Points** | What breaks, what's slow, what gets missed |
| **Compliance** | Regulatory, legal, or policy requirements tied to this phase |
| **Status** | Not Started / In Progress / Blocked / Complete / N/A |

### 6.4 Cross-Department Views

Three consolidated views that cut across department boundaries:

#### Handoff Matrix

A 7×7 grid showing what each department sends to and receives from every other department. Cells link to the specific phase where the handoff occurs. Empty cells highlight missing connections that may need to be established.

#### Document Inventory

All templates, forms, checklists, and resources mapped to the phases where they're used. Tracks collection status, format, location, and ADP equivalent for migration planning.

#### Gap Analysis

Consolidated findings organized by type (process gaps, document gaps, compliance gaps, knowledge gaps, technology gaps). Each gap links to the department and phase where it was identified, with recommended solutions and ADP automation potential flagged.

### 6.5 Notifications System

Both in-app and email notifications, triggered by workflow events:

| Event | Who Gets Notified | Channel |
|---|---|---|
| Upstream phase completed | All departments with tasks in the next phase | Email + in-app |
| Task approaching deadline (48hr) | Assigned department lead | Email + in-app |
| Task overdue | Assigned department lead + Admin | Email + in-app |
| New hire added to pipeline | All departments | Email + in-app |
| Governance escalation flagged | Director only | Email + in-app |

### 6.6 Action Tracker

A centralized task list pulling from all sources — meeting action items, follow-up requests, document collection needs — with owner, due date, priority, and status. Filterable by department, priority, and status. This replaces the Action Tracker tab in the current workbook.

### 6.7 ADP Migration Map

A dedicated view that maps each workflow phase to its target ADP module, tracks migration status, and documents configuration requirements. This is the bridge between "what we do today" and "what ADP needs to do tomorrow." Each row connects the current process, current pain points, target ADP module, required configuration, automation type, and migration status.

---

## 7. Workflow Coverage

The tracker covers the complete employee lifecycle across 16 phases, organized into four stages. This includes offboarding — which the current Excel workbook does not fully cover but which the Baselining Guide documents in detail.

| Stage | Phase | Departments Involved |
|---|---|---|
| **Recruitment** | Job Opening Request | Director, HR, Supervisor |
| | Job Posting & Promotion | HR, Communications |
| | Screening & Shortlisting | Director (senior), HR, Supervisor |
| | Interviews & Evaluation | Director (senior), HR, Supervisor, Communications |
| | Selection & References | HR, Supervisor |
| | Offer & Acceptance | Director, HR, Supervisor |
| **Onboarding** | Pre-Hire Activation | HR, Supervisor, Finance, IT, Training, Comms |
| | Day 1 | HR, Supervisor, Finance, IT, Training, Comms |
| | Week 1 | HR, Supervisor, Finance, IT, Training, Comms |
| **Development** | Month 1 | HR, Supervisor, Finance, IT, Training, Comms |
| | Months 2–3 | Director, HR, Supervisor, IT, Training |
| | Ongoing | All departments |
| **Offboarding** | Departure Trigger | Director, HR, Supervisor |
| | Transition | HR, Supervisor, Training, Comms |
| | Final Processing | Director, HR, Supervisor, Finance, IT, Comms |
| | Post-Departure | HR, Finance, IT |

> **Offboarding Gap Addressed**
> The current Excel workbook covers recruitment through ongoing development but does not include offboarding phases for individual departments. This PRD incorporates the full offboarding lifecycle as documented in the Baselining Guide, ensuring the tracker captures the complete cradle-to-grave employee journey from the start.

---

## 8. Technical Specifications

The following specifications are written for the development team (Claude Code) and document the target architecture. All technology choices prioritize simplicity, speed of development, and maintainability by a small team.

### 8.1 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js (React) with Tailwind CSS | Fast development; consistent with existing prototypes; server-side rendering for performance |
| **Authentication** | NextAuth.js with email/password or Microsoft SSO | Simple role-based auth; option to integrate with KIDO's existing Microsoft accounts |
| **Database** | Supabase (PostgreSQL) or PlanetScale (MySQL) | Managed database; built-in real-time subscriptions; generous free tier |
| **Notifications** | Resend (email) + Supabase Realtime (in-app) | Simple API; reliable delivery; free tier sufficient for KIDO's volume |
| **Hosting** | Vercel | Zero-config deployment for Next.js; global CDN; SSL included |
| **Data Sync** | Sync on save/refresh (near-real-time) | Simplest approach; adequate for KIDO's user volume; no WebSocket complexity |

### 8.2 Data Model (Core Entities)

The database centers on five core entities that map directly to the workbook structure:

- **Users:** Individual accounts with role (admin, director, dept_lead, dept_staff) and department assignment
- **Phases:** The 16 lifecycle phases with stage grouping, sequence order, and department assignments
- **PhaseDetails:** Per-department data for each phase (trigger, steps, documents, handoffs, pain points, status) — the core capture data
- **Hires:** Individual pipeline records (Phase 2 only) with candidate info, current phase, start date, and per-department task status
- **ActionItems:** Cross-cutting task list with source, owner, due date, priority, and status

Supporting entities include Documents (inventory), Gaps (analysis findings), HandoffRecords (matrix data), MigrationMap (ADP tracking), and Notifications.

### 8.3 Security Considerations

- All data encrypted in transit (HTTPS) and at rest (database-level encryption)
- Row-level security: users can only modify records belonging to their department
- Governance-sensitive records (terminations, Board escalations) restricted to Director and Admin roles
- Audit log for all status changes (who changed what, when)
- Session timeout after inactivity for shared/public computers
- No employee personal data stored in the tracker — hire records use name and position only; sensitive documents remain in ADP and HR files

---

## 9. KIDO-Specific Design Considerations

> Every design decision must pass the governance filter: does this reinforce or undermine KIDO's traditional governance approach?

### Traditional Authority Structure

The permission model reflects KIDO's governance hierarchy. The Director role includes Board and Chief & Council escalation paths for band member employees. Termination workflows require Director approval with documented governance escalation options — these are not reducible to a simple "approve/reject" button.

### Multi-Location Access

Cloud hosting with responsive design ensures staff in KI community, Sioux Lookout, and Thunder Bay all have equal access. The interface should work well on both desktop and mobile, recognizing that staff in remote locations may primarily access via phone or tablet.

### Cultural Onboarding Visibility

The tracker should explicitly surface KIDO-specific onboarding elements: cultural orientation for staff from mainstream organizations, the MDK service model introduction, and community-specific onboarding considerations by location. These are tracked as first-class tasks, not afterthoughts.

### Tikinagan/Dilico Transition Flagging

During recruitment phases, the system should allow hiring panels to flag candidates with mainstream child welfare experience for additional cultural alignment assessment during onboarding. This is a data field, not an automated filter — humans make the decision.

---

## 10. Development Roadmap

Development proceeds in four phases, each delivering a usable increment:

| Phase | Timeline | Delivers | Key Features |
|---|---|---|---|
| **Phase 1** — Capture Mode | Weeks 1–4 | Digital workbook replacement | Auth + roles; department views with phase-by-phase data entry; document inventory; basic dashboard; data export |
| **Phase 2** — Operational | Weeks 5–8 | Live hire tracking | Hire pipeline; per-hire task generation; status tracking; notifications (email + in-app); deadline alerts |
| **Phase 3** — Visibility | Weeks 9–10 | Cross-department intelligence | Visual workflow map; handoff matrix; gap analysis dashboard; ADP migration tracker; reporting |
| **Phase 4** — Refinement | Weeks 11–12 | Production hardening | User feedback incorporation; performance optimization; documentation; ADP transition planning |

> **Concept First, Production Later**
> This roadmap describes the full vision. The immediate next step is a concept prototype — a working demo built with Claude Code that lets us play with the interface, test the workflow model, and learn what works before committing to a full build. The concept focuses on Phase 1 features with visual mockups of Phase 2 and 3 capabilities.

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation | Likelihood |
|---|---|---|---|
| Staff don't use it — too complex or not intuitive | Tool becomes shelfware; handoffs stay informal | Concept prototype first; test with 2–3 departments before full rollout; design for simplicity | Medium |
| Departments resist transparency — uncomfortable with visible status tracking | Partial adoption; data gaps undermine value | Frame as "support" not "surveillance"; lead with how it helps their work; Director endorsement | Medium |
| ADP implementation timeline shifts — tracker needed longer than planned | Temporary tool becomes semi-permanent | Build with clean data model that's sustainable; don't over-invest in features ADP will replace | High |
| Internet connectivity issues at KI community | Staff in Big Trout Lake can't access the tool | Progressive web app (PWA) with offline capability for core viewing; sync when connected | Medium |
| Scope creep — departments want features beyond bridge tool purpose | Development delays; tool tries to replace ADP | Clear scope in this PRD; defer feature requests to ADP migration; regular check-ins on purpose | High |

---

## 12. How We'll Know It's Working

Measurable outcomes that indicate the tracker is delivering value:

- **Adoption:** All 7 departments actively logging in and updating their sections within 4 weeks of launch
- **Handoff visibility:** Zero cases of departments not being notified of a new hire or departure
- **First-pay reliability:** Every new hire is paid correctly on their first pay cycle (Finance gets notified with enough lead time)
- **Baselining completion:** All 16 phases fully documented across all departments within the baselining timeline
- **ADP readiness:** Migration map is complete enough to begin ADP configuration without additional discovery meetings

---

## 13. Connection to Broader KIDO Initiatives

This workflow tracker is one of three interconnected workstreams in KIDO's workforce development strategy:

1. **Employee Lifecycle Blueprint (this tool)** — documents and tracks the end-to-end process
2. **ADP Workforce Now Migration** — the tracker's ADP Migration Map directly feeds configuration requirements
3. **AI Workforce Pilot** — a separate initiative developing AI-powered assessment and training tools (documented in a separate proposal)

The AI pilot and this tracker share a common foundation: the 16-phase, 7-department workflow model. In future phases, the tracker could link to AI assessment tools during recruitment phases, allowing hiring panels to access scenario-based evaluation benchmarks directly from the hire's pipeline view. However, for the concept prototype, these remain separate tools with a shared data model that can be connected later.

---

## 14. Request

I am requesting approval to proceed with concept prototype development for the Employee Lifecycle Workflow Tracker as described in this document, specifically:

1. **Approval** to develop a working concept prototype using Claude Code, demonstrating Phase 1 (Capture Mode) features with visual previews of Phase 2 and 3 capabilities
2. **Authorization** for department leads to review the prototype and provide feedback on workflow accuracy and usability (estimated 1–2 hours per department)
3. **Commitment** to review the concept within 4 weeks to decide whether to proceed with full development or adjust the approach

---

## 15. Next Steps

If approved:

1. Build concept prototype using Claude Code (1–2 weeks)
2. Demo walkthrough with the Director (30 minutes)
3. Circulate to department leads for feedback (1 week review period)
4. Incorporate feedback and decide on full development timeline
5. Coordinate with ADP migration planning to ensure alignment

---

| | |
|---|---|
| **Submitted by** ________________________________ | **Date:** _______________ |
| **Director Approval** ________________________________ | **Date:** _______________ |
