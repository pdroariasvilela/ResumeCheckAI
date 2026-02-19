import { queryOptions, useQuery } from "@tanstack/react-query";
import { authService } from "./auth.service";

export const authQueryKeys = {
  root: ["auth"] as const,
  me: () => [...authQueryKeys.root, "me"] as const,
};

export const meQueryOptions = () =>
  queryOptions({
    queryKey: authQueryKeys.me(),
    queryFn: () => authService.me(),
    staleTime: 60_000,
  });

export function useMeQuery(enabled = true) {
  return useQuery({
    ...meQueryOptions(),
    enabled,
  });
}
