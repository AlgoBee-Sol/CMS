"use client";

import SearchInput from "@/components/shared/SearchInput";

interface ClinicFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  showDeleted: boolean;
  onShowDeletedChange: (value: boolean) => void;
}

export default function ClinicFilters({
  search,
  onSearchChange,
  showDeleted,
  onShowDeletedChange,
}: ClinicFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, code, subdomain, email…"
        className="flex-1 max-w-md"
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showDeleted}
          onChange={(e) => onShowDeletedChange(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span style={{ color: "var(--color-neutral-600)" }}>Show deleted clinics</span>
      </label>
    </div>
  );
}
