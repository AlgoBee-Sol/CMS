"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ClinicForm from "@/components/clinics/ClinicForm";
import OwnerForm from "@/components/clinics/OwnerForm";
import SubscriptionForm from "@/components/clinics/SubscriptionForm";
import SubscriptionHistory from "@/components/clinics/SubscriptionHistory";
import StatusBadge from "@/components/clinics/StatusBadge";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useClinic, useClinicOwner, useUpdateClinic, useUpdateClinicOwner, useUpdateSubscription } from "@/lib/hooks/useClinics";
import { UpdateClinicDto } from "@/lib/schemas/clinic.schema";
import { OwnerDto } from "@/lib/schemas/owner.schema";
import { SubscriptionDto } from "@/lib/schemas/subscription.schema";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type Tab = "profile" | "owner" | "subscription";

export default function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("profile");

  const { data, isLoading } = useClinic(id);
  const { data: ownerData, isLoading: ownerLoading } = useClinicOwner(id, tab === "owner");
  const updateClinic = useUpdateClinic();
  const updateOwner = useUpdateClinicOwner();
  const updateSubscription = useUpdateSubscription();

  const clinic = data?.data?.clinic;

  if (isLoading) return <LoadingSkeleton rows={10} />;
  if (!clinic) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Clinic not found</p>
        <Link href="/clinics" className="text-blue-600 text-sm mt-2 inline-block">← Back to clinics</Link>
      </div>
    );
  }

  const sub = clinic.subscription;
  const owner = ownerData?.data?.owner;
  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "owner", label: "Owner" },
    { key: "subscription", label: "Subscription" },
  ];

  return (
    <>
      <Link href="/clinics" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to clinics
      </Link>

      <PageHeader
        title={clinic.name}
        subtitle={`${clinic.code} · ${clinic.subdomain}.physiosaas.com`}
        actions={sub && <StatusBadge status={sub.status} />}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Staff", value: clinic.userCount ?? 0 },
          { label: "Appointments", value: clinic.appointmentCount ?? 0 },
          { label: "Sessions", value: clinic.sessionCount ?? 0 },
          { label: "Plan", value: sub ? `${sub.planType} · ${formatCurrency(sub.amount)}` : "—" },
        ].map((stat) => (
          <div key={stat.label} className="card-base p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>{stat.label}</p>
            <p className="mt-1 text-lg font-bold" style={{ color: "var(--color-neutral-900)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
            style={{
              borderColor: tab === key ? "var(--color-primary-600)" : "transparent",
              color: tab === key ? "var(--color-primary-600)" : "var(--color-neutral-400)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-base p-6">
        {tab === "profile" && (
          <ClinicForm
            mode="edit"
            defaultValues={{
              name: clinic.name,
              email: clinic.email,
              phone: clinic.phone,
              address: clinic.address ?? "",
              logoUrl: clinic.logoUrl ?? "",
              termsAndConditions: clinic.termsAndConditions ?? "",
            }}
            onSubmit={(data) => updateClinic.mutate({ id, data: data as UpdateClinicDto })}
            isPending={updateClinic.isPending}
          />
        )}

        {tab === "owner" && (
          ownerLoading ? (
            <LoadingSkeleton rows={4} />
          ) : owner ? (
            <OwnerForm
              defaultValues={{
                firstName: owner.firstName,
                lastName: owner.lastName,
                email: owner.email,
                phone: owner.phone ?? "",
                cnic: owner.cnic ?? "",
              }}
              onSubmit={(data: OwnerDto) => updateOwner.mutate({ id, data })}
              isPending={updateOwner.isPending}
            />
          ) : (
            <p className="text-sm text-slate-500">No owner registered for this clinic yet.</p>
          )
        )}

        {tab === "subscription" && (
          <div className="space-y-8">
            {sub && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl" style={{ background: "var(--color-neutral-50)" }}>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <div className="mt-1"><StatusBadge status={sub.status} /></div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Start</p>
                  <p className="text-sm font-semibold mt-1">{formatDate(sub.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">End</p>
                  <p className="text-sm font-semibold mt-1">{formatDate(sub.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Auto-renew</p>
                  <p className="text-sm font-semibold mt-1">{sub.autoRenew ? "Yes" : "No"}</p>
                </div>
              </div>
            )}

            <SubscriptionForm
              defaultValues={sub ? {
                status: sub.status as "Active" | "Trial",
                planType: sub.planType,
                amount: sub.amount,
                startDate: sub.startDate.split("T")[0],
                endDate: sub.endDate.split("T")[0],
                autoRenew: sub.autoRenew,
              } : undefined}
              onSubmit={(data: SubscriptionDto) => updateSubscription.mutate({ id, data })}
              isPending={updateSubscription.isPending}
            />

            <SubscriptionHistory
              clinicId={id}
              payments={clinic.payments ?? []}
            />
          </div>
        )}
      </div>
    </>
  );
}
