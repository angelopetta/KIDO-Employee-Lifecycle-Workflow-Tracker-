"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "director", "dept_lead", "dept_staff"] },
  { href: "/departments", label: "All Departments", roles: ["admin", "director"] },
  { href: "/phases", label: "All Phases", roles: ["admin", "director", "dept_lead", "dept_staff"] },
  { href: "/documents", label: "Documents", roles: ["admin", "director", "dept_lead", "dept_staff"] },
  { href: "/handoff-matrix", label: "Handoff Matrix", roles: ["admin", "director", "dept_lead"] },
  { href: "/gap-analysis", label: "Gap Analysis", roles: ["admin", "director", "dept_lead"] },
  { href: "/adp-migration", label: "ADP Migration", roles: ["admin", "director"] },
  { href: "/export", label: "Export Data", roles: ["admin", "director", "dept_lead"] },
  { href: "/bulk-import", label: "Bulk Import", roles: ["admin", "dept_lead"] },
  { href: "/admin/users", label: "User Management", roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const deptSlug = session?.user?.departmentSlug;

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  // For dept_lead and dept_staff, add a "My Department" link
  const myDeptItem =
    deptSlug && (role === "dept_lead" || role === "dept_staff")
      ? { href: `/departments/${deptSlug}`, label: "My Department" }
      : null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <Link href="/dashboard" className="block">
          <h1 className="text-lg font-bold">KIDO</h1>
          <p className="text-xs text-slate-400">Workflow Tracker</p>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        {myDeptItem && (
          <Link
            href={myDeptItem.href}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.startsWith(myDeptItem.href)
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {myDeptItem.label}
          </Link>
        )}
      </nav>
    </aside>
  );
}
