"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({ data, columns, isLoading, emptyMessage }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (!data.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--color-neutral-200)" }}>
      <table className="w-full text-sm">
        <thead style={{ background: "var(--color-neutral-50)", borderBottom: "1px solid var(--color-neutral-200)" }}>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide cursor-pointer select-none"
                  style={{ color: "var(--color-neutral-600)" }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1.5">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-slate-400">
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              className="transition-colors"
              style={{ background: idx % 2 === 0 ? "white" : "var(--color-neutral-50)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "white" : "var(--color-neutral-50)")}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3" style={{ color: "var(--color-neutral-900)" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
