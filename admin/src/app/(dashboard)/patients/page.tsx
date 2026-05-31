"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/shared/SearchInput";
import DataTable from "@/components/shared/DataTable";
import { usePatients } from "@/lib/hooks/usePatients";
import { useClinics } from "@/lib/hooks/useClinics";
import { Patient, Clinic } from "@/types/api";
import { formatDate, maskCnic } from "@/lib/utils/format";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [cnic, setCnic] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const debouncedCnic = useDebouncedValue(cnic, 300);

  const { data, isLoading } = usePatients({
    page,
    limit: 25,
    search: debouncedSearch || undefined,
    clinicId: clinicId || undefined,
    cnic: debouncedCnic || undefined,
  });

  const { data: clinicsData } = useClinics({ page: 1, limit: 100, isDeleted: false });

  const patients: Patient[] = data?.data?.patients ?? [];
  const pagination = data?.data?.pagination;
  const clinics: Clinic[] = clinicsData?.data?.clinics ?? [];

  const columns: ColumnDef<Patient, unknown>[] = [
    {
      id: "name",
      header: "Patient",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-slate-400">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    { accessorKey: "cnic", header: "CNIC", cell: ({ row }) => maskCnic(row.original.cnic) },
    { accessorKey: "clinicName", header: "Clinic" },
    { accessorKey: "assignedDoctor", header: "Doctor" },
    { accessorKey: "createdAt", header: "Registered", cell: ({ row }) => formatDate(row.original.createdAt) },
  ];

  return (
    <>
      <PageHeader
        title="Patient Directory"
        subtitle="Read-only view of all patients across clinics"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email, phone…"
          className="flex-1 max-w-sm"
        />
        <select
          value={clinicId}
          onChange={(e) => { setClinicId(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-lg border bg-white"
          style={{ borderColor: "var(--color-neutral-200)" }}
        >
          <option value="">All clinics</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={cnic}
          onChange={(e) => { setCnic(e.target.value); setPage(1); }}
          placeholder="Filter by CNIC"
          className="px-3 py-2 text-sm rounded-lg border bg-white max-w-xs"
          style={{ borderColor: "var(--color-neutral-200)" }}
        />
      </div>

      <DataTable
        data={patients}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No patients found"
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
    </>
  );
}
