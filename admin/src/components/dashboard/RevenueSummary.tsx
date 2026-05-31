"use client";

import Link from "next/link";
import { AlertTriangle, Users } from "lucide-react";
import StatusBadge from "@/components/clinics/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface SubscriptionItem {
  clinicId: string;
  clinicCode: string;
  clinicName: string;
  planType: string;
  amount: number;
  endDate: string;
}

interface RevenueSummaryProps {
  expiringSoon?: SubscriptionItem[];
  overdue?: SubscriptionItem[];
  isLoading?: boolean;
}

export default function RevenueSummary({ expiringSoon = [], overdue = [], isLoading }: RevenueSummaryProps) {
  if (isLoading) {
    return <div className="card-base p-5 h-64 shimmer-shimmer rounded-xl" />;
  }

  const alerts = [
    ...overdue.map((s) => ({ ...s, type: "overdue" as const })),
    ...expiringSoon.map((s) => ({ ...s, type: "expiring" as const })),
  ].slice(0, 5);

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--color-neutral-900)" }}>
            Subscription Alerts
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-neutral-400)" }}>
            Overdue and expiring subscriptions
          </p>
        </div>
        <Link href="/finance" className="text-xs font-medium text-blue-600 hover:underline">
          View all
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Users className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-sm font-medium text-slate-600">All subscriptions are healthy</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((item) => (
            <Link
              key={`${item.clinicId}-${item.type}`}
              href={`/clinics/${item.clinicId}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: item.type === "overdue" ? "#fee2e2" : "#ffedd5" }}
              >
                <AlertTriangle
                  className="w-4 h-4"
                  style={{ color: item.type === "overdue" ? "#dc2626" : "#d97706" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-neutral-900)" }}>
                  {item.clinicName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-neutral-400)" }}>
                  {item.planType} · {formatCurrency(item.amount)} · ends {formatDate(item.endDate)}
                </p>
              </div>
              <StatusBadge status={item.type === "overdue" ? "Ended" : "Trial"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
