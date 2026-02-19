import { Stack } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";
import AppProviders from "./providers";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    void useAuthStore.getState().hydrateSession();
  }, []);

  if (status === "idle" || status === "hydrating") {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
    </AppProviders>
  );
}
