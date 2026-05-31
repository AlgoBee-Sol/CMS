"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

interface PatientOverviewProps {
  totalPatients?: number;
  isLoading?: boolean;
}

export default function PatientOverview({ totalPatients, isLoading }: PatientOverviewProps) {
  if (isLoading) {
    return <div className="card-base p-5 h-40 shimmer-shimmer rounded-xl" />;
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>
            Cross-Clinic Patients
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
            {totalPatients?.toLocaleString() ?? "—"}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-neutral-400)" }}>
            Registered across all clinics
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#f3e8ff" }}>
          <Users className="w-5 h-5 text-purple-600" />
        </div>
      </div>
      <Link
        href="/patients"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
      >
        View patient directory
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
