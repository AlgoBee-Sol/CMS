import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicsApi } from "@/lib/api/clinics";
import { queryKeys, ClinicsFilter } from "./queryKeys";
import { toast } from "sonner";

export function useClinics(filters: ClinicsFilter) {
  return useQuery({
    queryKey: queryKeys.clinics.list(filters),
    queryFn: () => clinicsApi.getClinics(filters),
  });
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: queryKeys.clinics.detail(id),
    queryFn: () => clinicsApi.getClinicById(id),
    enabled: !!id,
  });
}

export function useClinicOwner(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clinics.owner(id),
    queryFn: () => clinicsApi.getClinicOwner(id),
    enabled: !!id && enabled,
    retry: false,
  });
}

export function useCreateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clinicsApi.createClinic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.all });
      toast.success("Clinic created successfully");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Failed to create clinic"),
  });
}

export function useUpdateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      clinicsApi.updateClinic(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.clinics.all });
      toast.success("Clinic updated");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Update failed"),
  });
}

export function useDeleteClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clinicsApi.deleteClinic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.all });
      toast.success("Clinic deleted");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Delete failed"),
  });
}

export function useRestoreClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clinicsApi.restoreClinic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.all });
      toast.success("Clinic restored");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Restore failed"),
  });
}

export function useUpdateClinicOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      clinicsApi.updateClinicOwner(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.owner(id) });
      toast.success("Owner updated");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Update failed"),
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      clinicsApi.updateSubscription(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.clinics.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.finance.subscriptionAnalytics });
      toast.success("Subscription updated");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Update failed"),
  });
}

export function useRegisterOwner() {
  return useMutation({
    mutationFn: clinicsApi.registerOwner,
    onSuccess: () => toast.success("Clinic owner registered"),
    onError: (err: { message?: string }) => toast.error(err.message ?? "Registration failed"),
  });
}
