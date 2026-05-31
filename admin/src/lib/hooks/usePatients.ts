import { useQuery } from "@tanstack/react-query";
import { patientsApi } from "@/lib/api/patients";
import { queryKeys, PatientsFilter } from "./queryKeys";

export function usePatients(filters: PatientsFilter) {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: () => patientsApi.getPatients(filters),
  });
}
