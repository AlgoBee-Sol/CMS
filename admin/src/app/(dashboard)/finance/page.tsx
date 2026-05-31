"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/shared/DataTable";
import DateRangePicker from "@/components/shared/DateRangePicker";
import RevenueBarChart from "@/components/dashboard/RevenueBarChart";
import RevenueSummary from "@/components/dashboard/RevenueSummary";
import StatCard from "@/components/dashboard/StatCard";
import {
  useDashboardSummary,
  useMonthlyRevenue,
  useYearlyRevenue,
  useSubscriptionAnalytics,
  usePayments,
} from "@/lib/hooks/useFinance";
import { useClinics } from "@/lib/hooks/useClinics";
import { PlatformPayment, Clinic } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";
import { CreditCard, TrendingUp } from "lucide-react";

export default function FinancePage() {
  const year = new Date().getFullYear();
  const [page, setPage] = useState(1);
  const [clinicId, setClinicId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: summaryData } = useDashboardSummary();
  const { data: revenueData } = useMonthlyRevenue(year);
  const { data: yearlyData } = useYearlyRevenue();
  const { data: analyticsData, isLoading: analyticsLoading } = useSubscriptionAnalytics();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page,
    limit: 20,
    clinicId: clinicId || undefined,
    paymentMethod: paymentMethod || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const { data: clinicsData } = useClinics({ page: 1, limit: 100, isDeleted: false });

  const summary = summaryData?.data?.summary;
  const monthlyRevenue = revenueData?.data?.monthlyRevenue ?? [];
  const growth = yearlyData?.data?.monthOverMonthGrowth;
  const analytics = analyticsData?.data;
  const payments: PlatformPayment[] = paymentsData?.data?.payments ?? [];
  const pagination = paymentsData?.data?.pagination;
  const clinics: Clinic[] = clinicsData?.data?.clinics ?? [];

  const columns: ColumnDef<PlatformPayment, unknown>[] = [
    { accessorKey: "paymentDate", header: "Date", cell: ({ row }) => formatDate(row.original.paymentDate) },
    {
      id: "clinic",
      header: "Clinic",
      cell: ({ row }) => row.original.clinic?.name ?? "—",
    },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "paymentMethod", header: "Method" },
    { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description ?? "—" },
    {
      id: "loggedBy",
      header: "Logged By",
      cell: ({ row }) => row.original.loggedBySuperAdmin?.name ?? "—",
    },
  ];

  const exportData = payments.map((p) => ({
    date: formatDate(p.paymentDate),
    clinic: p.clinic?.name ?? "",
    amount: p.amount,
    method: p.paymentMethod,
    description: p.description ?? "",
    loggedBy: p.loggedBySuperAdmin?.name ?? "",
  }));

  const handleExportCSV = () => {
    exportToCSV(exportData, `payments-${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportPDF = () => {
    exportToPDF(
      "Payment History",
      [
        { header: "Date", dataKey: "date" },
        { header: "Clinic", dataKey: "clinic" },
        { header: "Amount", dataKey: "amount" },
        { header: "Method", dataKey: "method" },
        { header: "Description", dataKey: "description" },
        { header: "Logged By", dataKey: "loggedBy" },
      ],
      exportData,
      `payments-${new Date().toISOString().split("T")[0]}`
    );
  };

  return (
    <>
      <PageHeader
        title="Finance"
        subtitle="Revenue reports, subscription analytics, and payment history"
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={!payments.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border disabled:opacity-40"
              style={{ borderColor: "var(--color-neutral-200)" }}
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!payments.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--color-primary-600)" }}
            >
              <FileText className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          trend={growth}
          trendLabel="vs last year"
        />
        <StatCard
          title="Revenue (30 days)"
          value={formatCurrency(summary?.revenue30Days ?? 0)}
          icon={<CreditCard className="w-5 h-5 text-green-600" />}
          iconBg="#dcfce7"
        />
        <StatCard
          title="Active Subscriptions"
          value={summary?.activeSubscriptions ?? 0}
          subtitle={`${summary?.expiringSoon ?? 0} expiring soon`}
          icon={<CreditCard className="w-5 h-5 text-purple-600" />}
          iconBg="#f3e8ff"
        />
        <StatCard
          title="Trial Clinics"
          value={summary?.trialSubscriptions ?? 0}
          icon={<CreditCard className="w-5 h-5 text-amber-600" />}
          iconBg="#fef9c3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RevenueBarChart data={monthlyRevenue} year={year} />
        <RevenueSummary
          expiringSoon={analytics?.subscriptions?.expiringSoon}
          overdue={analytics?.subscriptions?.overdue}
          isLoading={analyticsLoading}
        />
      </div>

      {/* Payment history filters */}
      <div className="card-base p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-neutral-900)" }}>Payment History</h3>
        <div className="flex flex-wrap gap-3">
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
          <select
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border bg-white"
            style={{ borderColor: "var(--color-neutral-200)" }}
          >
            <option value="">All methods</option>
            {["Bank Transfer", "Cash", "Check", "Card", "Other"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={(v) => { setStartDate(v); setPage(1); }}
            onEndChange={(v) => { setEndDate(v); setPage(1); }}
          />
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        isLoading={paymentsLoading}
        emptyMessage="No payments found"
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
