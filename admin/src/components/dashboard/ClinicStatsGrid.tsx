"use client";

import { Building2, CreditCard, Clock, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { formatCurrency } from "@/lib/utils/format";

interface Summary {
  totalClinics: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiringSoon: number;
  revenue30Days: number;
  totalRevenue: number;
}

interface ClinicStatsGridProps {
  summary?: Summary;
  growth?: number;
  isLoading?: boolean;
}

export default function ClinicStatsGrid({ summary, growth, isLoading }: ClinicStatsGridProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-base p-5 h-32 shimmer-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Clinics"
        value={summary.totalClinics}
        icon={<Building2 className="w-5 h-5 text-blue-600" />}
        chips={[
          { label: `${summary.trialSubscriptions} trial`, color: "#a16207", bg: "#fef9c3" },
        ]}
      />
      <StatCard
        title="Active Subscriptions"
        value={summary.activeSubscriptions}
        icon={<CreditCard className="w-5 h-5 text-green-600" />}
        iconBg="#dcfce7"
        chips={[
          { label: `${summary.expiringSoon} expiring soon`, color: "#b45309", bg: "#ffedd5" },
        ]}
      />
      <StatCard
        title="Revenue (30 days)"
        value={formatCurrency(summary.revenue30Days)}
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        trend={growth}
        trendLabel="vs last year"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(summary.totalRevenue)}
        subtitle="All-time platform payments"
        icon={<Clock className="w-5 h-5 text-purple-600" />}
        iconBg="#f3e8ff"
      />
    </div>
  );
}
