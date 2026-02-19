import { create } from "zustand";
import { apiClient } from "@/shared/config/api";
import {
  secureDeleteItem,
  secureGetJson,
  secureSetJson,
} from "@/shared/lib/secure-store";
import type { AuthSession, AuthTokens, User } from "@/shared/types/auth";

type AuthState = {
  status: "idle" | "hydrating" | "authenticated" | "guest";
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrateSession: () => Promise<void>;
  setSession: (session: AuthSession) => Promise<void>;
  updateTokens: (tokens: AuthTokens) => Promise<void>;
  clearSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_SESSION_KEY = "auth_session_v1";

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrateSession: async () => {
    set({ status: "hydrating" });
    const session = await secureGetJson<AuthSession>(AUTH_SESSION_KEY);

    if (!session) {
      apiClient.setAuthTokens({ accessToken: null, refreshToken: null });
      set({
        status: "guest",
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return;
    }

    apiClient.setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    set({
      status: "authenticated",
      isAuthenticated: true,
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  },
  setSession: async (session) => {
    await secureSetJson(AUTH_SESSION_KEY, session);
    apiClient.setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    set({
      status: "authenticated",
      isAuthenticated: true,
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  },
  updateTokens: async (tokens) => {
    const current = useAuthStore.getState();
    if (!current.user) return;

    const nextSession: AuthSession = {
      user: current.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    await secureSetJson(AUTH_SESSION_KEY, nextSession);
    apiClient.setAuthTokens(tokens);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      status: "authenticated",
    });
  },
  clearSession: async () => {
    await secureDeleteItem(AUTH_SESSION_KEY);
    apiClient.setAuthTokens({ accessToken: null, refreshToken: null });
    set({
      status: "guest",
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
  signOut: async () => {
    await useAuthStore.getState().clearSession();
  },
}));

apiClient.setTokenProvider(async () => {
  const state = useAuthStore.getState();
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
});

apiClient.setTokenUpdater(async (tokens) => {
  if (!tokens) {
    await useAuthStore.getState().clearSession();
    return;
  }
  await useAuthStore.getState().updateTokens(tokens);
});

apiClient.setOnUnauthorized(() => {
  void useAuthStore.getState().clearSession();
});
