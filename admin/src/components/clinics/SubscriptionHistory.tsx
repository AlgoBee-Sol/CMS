"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { paymentSchema, PaymentDto } from "@/lib/schemas/subscription.schema";
import { PlatformPayment } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useRecordPayment } from "@/lib/hooks/useFinance";
import DataTable from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface SubscriptionHistoryProps {
  clinicId: string;
  payments: PlatformPayment[];
  isLoading?: boolean;
}

export default function SubscriptionHistory({ clinicId, payments, isLoading }: SubscriptionHistoryProps) {
  const [showForm, setShowForm] = useState(false);
  const recordPayment = useRecordPayment();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<PaymentDto, "clinicId">>({
    resolver: zodResolver(paymentSchema.omit({ clinicId: true })),
    defaultValues: { amount: 0, paymentMethod: "Bank Transfer", description: "" },
  });

  const onSubmit = async (data: Omit<PaymentDto, "clinicId">) => {
    await recordPayment.mutateAsync({ ...data, clinicId });
    reset();
    setShowForm(false);
  };

  const columns: ColumnDef<PlatformPayment, unknown>[] = [
    { accessorKey: "paymentDate", header: "Date", cell: ({ row }) => formatDate(row.original.paymentDate) },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "paymentMethod", header: "Method" },
    { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description ?? "—" },
    {
      id: "loggedBy",
      header: "Logged By",
      cell: ({ row }) => row.original.loggedBySuperAdmin?.name ?? "—",
    },
  ];

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 bg-white";
  const labelClass = "block text-xs font-medium mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm" style={{ color: "var(--color-neutral-900)" }}>Payment History</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{ background: "var(--color-primary-600)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Record Payment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card-base p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Amount (PKR)</label>
            <input type="number" {...register("amount", { valueAsNumber: true })} className={inputClass} />
            {errors.amount && <p className="text-xs text-red-500 mt-0.5">{errors.amount.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Payment Method</label>
            <select {...register("paymentMethod")} className={inputClass}>
              {["Bank Transfer", "Cash", "Check", "Card"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input {...register("description")} className={inputClass} placeholder="Optional" />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs rounded-lg border">Cancel</button>
            <button
              type="submit"
              disabled={recordPayment.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-white font-semibold disabled:opacity-60"
              style={{ background: "var(--color-primary-600)" }}
            >
              {recordPayment.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Payment
            </button>
          </div>
        </form>
      )}

      <DataTable data={payments} columns={columns} isLoading={isLoading} emptyMessage="No payments recorded yet" />
    </div>
  );
}
