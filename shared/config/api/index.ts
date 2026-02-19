import { env } from "@/shared/config/env";
import { ApiClientConfig } from "./api-client";
import { HttpClient } from "./http-client";

export { END_POINTS, buildEndpoint } from "./endpoints";
export { ApiClientConfig } from "./api-client";
export { HttpClient } from "./http-client";

export const apiClient = new ApiClientConfig(env.API_BASE_URL, {
  timeout: 20_000,
  retryAttempts: 2,
  retryDelay: 600,
});

export const httpClient = new HttpClient(apiClient);
