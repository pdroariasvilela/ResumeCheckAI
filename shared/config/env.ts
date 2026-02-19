import Constants from "expo-constants";

type ExtraEnv = {
  apiBaseUrl?: string;
};

function readApiBaseUrl(): string {
  const fromExtra = (Constants.expoConfig?.extra as ExtraEnv | undefined)?.apiBaseUrl;
  const fromProcess = process.env.EXPO_PUBLIC_API_BASE_URL;
  return fromExtra ?? fromProcess ?? "http://localhost:3001";
}

export const env = {
  API_BASE_URL: readApiBaseUrl(),
  CLIENT_TYPE: "mobile" as const,
} as const;
