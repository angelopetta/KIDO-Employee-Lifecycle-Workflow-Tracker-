export const STAGES = [
  { key: "recruitment", label: "Recruitment", color: "bg-blue-100 text-blue-800" },
  { key: "onboarding", label: "Onboarding", color: "bg-green-100 text-green-800" },
  { key: "development", label: "Development", color: "bg-purple-100 text-purple-800" },
  { key: "offboarding", label: "Offboarding", color: "bg-orange-100 text-orange-800" },
] as const;

export const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "bg-slate-100 text-slate-600" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-800" },
  { value: "complete", label: "Complete", color: "bg-green-100 text-green-800" },
  { value: "na", label: "N/A", color: "bg-slate-50 text-slate-400" },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  director: "Director",
  dept_lead: "Department Lead",
  dept_staff: "Department Staff",
};

export function getStatusConfig(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

export function getStageConfig(stage: string) {
  return STAGES.find((s) => s.key === stage) ?? STAGES[0];
}
