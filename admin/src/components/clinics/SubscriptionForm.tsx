"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionSchema, SubscriptionDto } from "@/lib/schemas/subscription.schema";

const PLAN_OPTIONS = ["Trial", "Basic", "Professional", "Enterprise"];

interface SubscriptionFormProps {
  defaultValues?: Partial<SubscriptionDto>;
  onSubmit: (data: SubscriptionDto) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function SubscriptionForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save Subscription",
}: SubscriptionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SubscriptionDto>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      status: "Trial",
      planType: "Trial",
      amount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      autoRenew: true,
      ...defaultValues,
    },
  });

  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white";
  const labelClass = "block text-sm font-medium mb-1.5";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Status *</label>
          <select {...register("status")} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }}>
            <option value="Trial">Trial</option>
            <option value="Active">Active</option>
            <option value="Ended">Ended</option>
          </select>
          {errors.status && <p className={errorClass}>{errors.status.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Plan Type *</label>
          <select {...register("planType")} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }}>
            {PLAN_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Amount (PKR) *</label>
          <input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            className={inputClass}
            style={{ borderColor: errors.amount ? "var(--color-danger)" : "var(--color-neutral-200)" }}
          />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input type="checkbox" {...register("autoRenew")} id="autoRenew" className="rounded" />
          <label htmlFor="autoRenew" className="text-sm" style={{ color: "var(--color-neutral-600)" }}>Auto-renew</label>
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Start Date *</label>
          <input type="date" {...register("startDate")} className={inputClass} style={{ borderColor: errors.startDate ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>End Date *</label>
          <input type="date" {...register("endDate")} className={inputClass} style={{ borderColor: errors.endDate ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--color-primary-600)" }}
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
