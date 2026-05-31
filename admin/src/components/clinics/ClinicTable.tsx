"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, RotateCcw } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "./StatusBadge";
import { Clinic } from "@/types/api";
import { formatDate, formatCurrency } from "@/lib/utils/format";

interface ClinicTableProps {
  clinics: Clinic[];
  isLoading?: boolean;
  showDeleted?: boolean;
  onDelete?: (clinic: Clinic) => void;
  onRestore?: (clinic: Clinic) => void;
}

export default function ClinicTable({
  clinics,
  isLoading,
  showDeleted,
  onDelete,
  onRestore,
}: ClinicTableProps) {
  const columns: ColumnDef<Clinic, unknown>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-blue-600">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Clinic Name",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name}</p>
          <p className="text-xs text-slate-400">{row.original.subdomain}.physiosaas.com</p>
        </div>
      ),
    },
    {
      id: "subscription",
      header: "Subscription",
      cell: ({ row }) => {
        const sub = row.original.subscription;
        if (!sub) return <span className="text-slate-400">—</span>;
        return (
          <div>
            <StatusBadge status={sub.status} />
            <p className="text-xs text-slate-400 mt-0.5">{sub.planType} · {formatCurrency(sub.amount)}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "userCount",
      header: "Staff",
      cell: ({ row }) => row.original.userCount ?? 0,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={`/clinics/${row.original.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {showDeleted ? (
            onRestore && (
              <button
                onClick={() => onRestore(row.original)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Restore clinic"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )
          ) : (
            onDelete && (
              <button
                onClick={() => onDelete(row.original)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete clinic"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={clinics}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={showDeleted ? "No deleted clinics" : "No clinics found"}
    />
  );
}
