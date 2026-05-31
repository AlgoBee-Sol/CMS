"use client";

import PageHeader from "@/components/layout/PageHeader";
import ClinicStatsGrid from "@/components/dashboard/ClinicStatsGrid";
import RevenueBarChart from "@/components/dashboard/RevenueBarChart";
import RevenueSummary from "@/components/dashboard/RevenueSummary";
import QuickActions from "@/components/dashboard/QuickActions";
import PatientOverview from "@/components/dashboard/PatientOverview";
import { useDashboardSummary, useMonthlyRevenue, useYearlyRevenue, useSubscriptionAnalytics } from "@/lib/hooks/useFinance";
import { usePatients } from "@/lib/hooks/usePatients";

export default function DashboardPage() {
  const year = new Date().getFullYear();
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: revenueData, isLoading: revenueLoading } = useMonthlyRevenue(year);
  const { data: yearlyData } = useYearlyRevenue();
  const { data: analyticsData, isLoading: analyticsLoading } = useSubscriptionAnalytics();
  const { data: patientsData } = usePatients({ page: 1, limit: 1 });

  const summary = summaryData?.data?.summary;
  const monthlyRevenue = revenueData?.data?.monthlyRevenue ?? [];
  const growth = yearlyData?.data?.monthOverMonthGrowth;
  const analytics = analyticsData?.data;
  const totalPatients = patientsData?.data?.pagination?.total;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your PhysioSaaS platform"
      />

      <ClinicStatsGrid summary={summary} growth={growth} isLoading={summaryLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="xl:col-span-2">
          <RevenueBarChart data={monthlyRevenue} year={year} />
        </div>
        <PatientOverview totalPatients={totalPatients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <RevenueSummary
          expiringSoon={analytics?.subscriptions?.expiringSoon}
          overdue={analytics?.subscriptions?.overdue}
          isLoading={analyticsLoading}
        />
        <QuickActions />
      </div>
    </>
  );
}
