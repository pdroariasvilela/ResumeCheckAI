import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import type { AuthSession, LoginDto, RegisterDto } from "@/shared/types/auth";
import { authQueryKeys } from "./auth.queries";
import { authService } from "./auth.service";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, LoginDto>({
    mutationFn: authService.login.bind(authService),
    onSuccess: async (session) => {
      await useAuthStore.getState().setSession(session);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.root });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, RegisterDto>({
    mutationFn: authService.register.bind(authService),
    onSuccess: async (session) => {
      await useAuthStore.getState().setSession(session);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.root });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout.bind(authService),
    onSettled: async () => {
      await useAuthStore.getState().clearSession();
      queryClient.clear();
    },
  });
}
