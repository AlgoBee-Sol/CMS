"use client";

import Link from "next/link";
import { Plus, Building2, Users, CreditCard, ArrowRight } from "lucide-react";

const actions = [
  {
    href: "/clinics/new",
    label: "Register Clinic",
    description: "Add a new clinic to the platform",
    icon: Plus,
    color: "var(--color-primary-600)",
    bg: "var(--color-primary-50)",
  },
  {
    href: "/clinics",
    label: "Manage Clinics",
    description: "View and edit all clinics",
    icon: Building2,
    color: "#15803d",
    bg: "#dcfce7",
  },
  {
    href: "/patients",
    label: "Patient Directory",
    description: "Browse patients across clinics",
    icon: Users,
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  {
    href: "/finance",
    label: "Finance Reports",
    description: "Revenue, payments & subscriptions",
    icon: CreditCard,
    color: "#b45309",
    bg: "#ffedd5",
  },
];

export default function QuickActions() {
  return (
    <div className="card-base p-5">
      <h3 className="font-bold text-base mb-4" style={{ color: "var(--color-neutral-900)" }}>
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(({ href, label, description, icon: Icon, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 group"
            style={{ borderColor: "var(--color-neutral-200)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--color-neutral-900)" }}>
                {label}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-neutral-400)" }}>
                {description}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
