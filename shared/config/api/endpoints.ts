export const END_POINTS = {
  AUTH: {
    REGISTER: "auth/register",
    LOGIN: "auth/login",
    ME: "auth/me",
    REFRESH: "auth/refresh",
    LOGOUT: "auth/logout",
  },
  PRODUCTS: {
    LIST: "products",
    CREATE: "products",
    UPDATE: "products/:id",
    DELETE: "products/:id",
  },
} as const;

type GetEndpointValues<T> = T extends Record<string, infer U> ? U : never;

type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Record<Param, string> & ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Record<Param, string>
      : Record<never, never>;

export type AllEndPointValues = GetEndpointValues<
  (typeof END_POINTS)[keyof typeof END_POINTS]
>;

type EndPointParams<T extends AllEndPointValues> = ExtractParams<T>;

export function buildEndpoint<T extends AllEndPointValues>(
  endpoint: T,
  params?: EndPointParams<T>,
): string {
  let url = endpoint as string;

  for (const [key, value] of Object.entries(params ?? {})) {
    url = url.replace(`:${key}`, String(value));
  }

  return url;
}