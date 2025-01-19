import { useQuery } from "@tanstack/react-query";
import { fetchCanineWithPrepaidPackageAction } from "../actions/fetchCanineWithPrepaidPackageAction";

export const useFetchCanineWithPrepaidPackageQuery = (
  canineId: string | undefined,
) => {
  return useQuery({
    queryKey: ["canine", canineId],
    queryFn: () => fetchCanineWithPrepaidPackageAction(canineId!),
    enabled: Boolean(canineId),
  });
};
