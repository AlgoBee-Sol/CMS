"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ClinicFilters from "@/components/clinics/ClinicFilters";
import ClinicTable from "@/components/clinics/ClinicTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useClinics, useDeleteClinic, useRestoreClinic } from "@/lib/hooks/useClinics";
import { Clinic } from "@/types/api";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export default function ClinicsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useClinics({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    isDeleted: showDeleted,
  });

  const deleteClinic = useDeleteClinic();
  const restoreClinic = useRestoreClinic();

  const clinics = data?.data?.clinics ?? [];
  const pagination = data?.data?.pagination;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteClinic.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Clinics"
        subtitle="Manage all clinics on the platform"
        actions={
          <Link
            href="/clinics/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--color-primary-600)" }}
          >
            <Plus className="w-4 h-4" />
            Register Clinic
          </Link>
        }
      />

      <ClinicFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        showDeleted={showDeleted}
        onShowDeletedChange={(v) => { setShowDeleted(v); setPage(1); }}
      />

      <ClinicTable
        clinics={clinics}
        isLoading={isLoading}
        showDeleted={showDeleted}
        onDelete={showDeleted ? undefined : setDeleteTarget}
        onRestore={showDeleted ? (c) => restoreClinic.mutate(c.id) : undefined}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm" style={{ color: "var(--color-neutral-400)" }}>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
              style={{ borderColor: "var(--color-neutral-200)" }}
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
              style={{ borderColor: "var(--color-neutral-200)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Clinic"
        description={`Are you sure you want to soft-delete "${deleteTarget?.name}"? This can be restored later.`}
        confirmLabel="Delete"
        confirmText={deleteTarget?.code}
        isPending={deleteClinic.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
