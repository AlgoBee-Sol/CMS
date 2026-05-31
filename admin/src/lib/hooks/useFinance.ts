import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "@/lib/api/finance";
import { queryKeys, PaymentsFilter } from "./queryKeys";
import { toast } from "sonner";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => financeApi.getDashboardSummary(),
  });
}

export function useMonthlyRevenue(year: number) {
  return useQuery({
    queryKey: queryKeys.finance.revenue(year),
    queryFn: () => financeApi.getMonthlyRevenue(year),
  });
}

export function useYearlyRevenue() {
  return useQuery({
    queryKey: queryKeys.finance.yearlyComparison,
    queryFn: () => financeApi.getYearlyRevenue(),
  });
}

export function useSubscriptionAnalytics() {
  return useQuery({
    queryKey: queryKeys.finance.subscriptionAnalytics,
    queryFn: () => financeApi.getSubscriptionAnalytics(),
  });
}

export function usePayments(filters: PaymentsFilter) {
  return useQuery({
    queryKey: queryKeys.finance.payments(filters),
    queryFn: () => financeApi.getPayments(filters),
  });
}

export function useClinicPayments(clinicId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.finance.clinicPayments(clinicId, page, limit),
    queryFn: () => financeApi.getClinicPayments(clinicId, { page, limit }),
    enabled: !!clinicId,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.recordPayment,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.payments({}) });
      qc.invalidateQueries({ queryKey: queryKeys.finance.clinicPayments(vars.clinicId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      qc.invalidateQueries({ queryKey: queryKeys.clinics.detail(vars.clinicId) });
      toast.success("Payment recorded");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Failed to record payment"),
  });
}
