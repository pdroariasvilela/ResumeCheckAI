import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NetworkException,
  NotFoundException,
  RequestCancelledException,
  ServiceUnavailableException,
  TooManyRequestsException,
  UnauthorizedException,
} from "@/shared/utils/custom-errors";
import { buildEndpoint, END_POINTS } from "./endpoints";

export type ApiClientOptions = {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
};

export type ApiErrorResponse = {
  message?: string;
  code?: string;
  errors?: unknown;
  details?: unknown;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type TokenProvider = () =>
  | { accessToken: string | null; refreshToken: string | null }
  | Promise<{ accessToken: string | null; refreshToken: string | null }>;

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type RefreshResponse = {
  success: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokens?: Partial<TokenPair>;
  };
};

export class ApiClientConfig {
  public readonly abortControllers: Map<string, AbortController>;
  private readonly client: AxiosInstance;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  private isRefreshing = false;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenProvider?: TokenProvider;
  private tokenUpdater?: (tokens: TokenPair | null) => void | Promise<void>;
  private onUnauthorized?: () => void;
  private failedQueue: {
    resolve: (value: TokenPair) => void;
    reject: (error: unknown) => void;
  }[] = [];

  constructor(public readonly baseURL: string, options: ApiClientOptions = {}) {
    const { timeout, retryAttempts = 2, retryDelay = 600 } = options;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    });

    this.abortControllers = new Map<string, AbortController>();
    this.setupInterceptors();
  }

  setAuthTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  setTokenUpdater(updater: (tokens: TokenPair | null) => void | Promise<void>): void {
    this.tokenUpdater = updater;
  }

  setOnUnauthorized(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  private async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    if (!this.tokenProvider) {
      return { accessToken: this.accessToken, refreshToken: this.refreshToken };
    }

    try {
      const tokens = await this.tokenProvider();
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      return tokens;
    } catch {
      return { accessToken: this.accessToken, refreshToken: this.refreshToken };
    }
  }

  private isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return (
      url.includes(END_POINTS.AUTH.LOGIN) ||
      url.includes(END_POINTS.AUTH.REGISTER) ||
      url.includes(END_POINTS.AUTH.REFRESH) ||
      url.includes(END_POINTS.AUTH.LOGOUT)
    );
  }

  private setHeader(
    headers: InternalAxiosRequestConfig["headers"] | AxiosRequestConfig["headers"] | undefined,
    key: string,
    value: string,
  ): void {
    if (!headers) return;
    if ("set" in headers && typeof headers.set === "function") {
      headers.set(key, value);
      return;
    }
    (headers as Record<string, string>)[key] = value;
  }

  private removeHeader(
    headers: InternalAxiosRequestConfig["headers"] | AxiosRequestConfig["headers"] | undefined,
    key: string,
  ): void {
    if (!headers) return;
    if ("delete" in headers && typeof headers.delete === "function") {
      headers.delete(key);
      return;
    }
    delete (headers as Record<string, string>)[key];
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const tokens = await this.getTokens();
        this.setHeader(config.headers, "X-Client-Type", "mobile");
        if (tokens.accessToken) {
          this.setHeader(config.headers, "Authorization", `Bearer ${tokens.accessToken}`);
        } else {
          this.removeHeader(config.headers, "Authorization");
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiErrorResponse>) => this.handleResponseError(error),
    );
  }

  private async handleResponseError(error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> {
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? "";

      const message = data?.message ?? "Ocurrió un error inesperado";
      const code = data?.code ?? `(HTTP_${String(status)})`;
      const details = {
        errors: data?.errors,
        details: data?.details,
        raw: data,
      };

      switch (status) {
        case 400:
          throw new BadRequestException(message, details, String(code));
        case 401: {
          if (!this.isAuthEndpoint(url) && error.config && !(error.config as RetryableRequestConfig)._retry) {
            return this.handleTokenRefresh(error);
          }
          if (this.isAuthEndpoint(url)) {
            this.handleUnauthorized();
            throw new UnauthorizedException(message, details, String(code));
          }
          throw new UnauthorizedException(message, details, String(code));
        }
        case 403:
          throw new ForbiddenException(message, details, String(code));
        case 404:
          throw new NotFoundException(message, details, String(code));
        case 409:
          throw new ConflictException(message, details, String(code));
        case 429:
          throw new TooManyRequestsException(message, details, String(code));
        case 500:
          throw new InternalServerErrorException(message, details, String(code));
        case 502:
          throw new BadGatewayException(message, details, String(code));
        case 503:
          throw new ServiceUnavailableException(message, details, String(code));
        default:
          throw new Error(`${message} (${String(code)})`);
      }
    }

    if (error.request) {
      throw new NetworkException();
    }

    if (axios.isCancel(error)) {
      throw new RequestCancelledException();
    }

    throw new Error("Error al procesar la solicitud");
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof UnauthorizedException) return false;
    if (!axios.isAxiosError(error)) return false;

    const status = error.response?.status;
    if (status !== undefined && status >= 400 && status < 500) return false;

    return (
      !error.response || (status !== undefined && status >= 500 && status < 600)
    );
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempts: number = this.retryAttempts,
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (err) {
      if (attempts > 1 && this.shouldRetry(err)) {
        await this.sleep(this.retryDelay);
        return this.retryRequest(requestFn, attempts - 1);
      }
      throw err;
    }
  }

  private extractTokens(payload: RefreshResponse | undefined): TokenPair | null {
    const data = payload?.data;
    const accessToken = data?.accessToken ?? data?.tokens?.accessToken;
    const refreshToken = data?.refreshToken ?? data?.tokens?.refreshToken;

    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  }

  private async persistTokens(tokens: TokenPair | null): Promise<void> {
    this.setAuthTokens({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
    });
    if (this.tokenUpdater) {
      await this.tokenUpdater(tokens);
    }
  }

  private async handleTokenRefresh(
    originalError: AxiosError<ApiErrorResponse>,
  ): Promise<AxiosResponse> {
    if (this.isRefreshing) {
      return new Promise<TokenPair>((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then((tokens) => {
        if (originalError.config?.headers) {
          originalError.config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return this.client.request(originalError.config!);
      });
    }

    this.isRefreshing = true;

    try {
      const tokens = await this.getTokens();
      if (!tokens.refreshToken) {
        throw new UnauthorizedException("No hay refresh token disponible");
      }

      const refreshUrl = buildEndpoint(END_POINTS.AUTH.REFRESH);
      const response = await axios.post<RefreshResponse>(
        `${this.baseURL}/${refreshUrl}`.replace(/\/+/g, "/").replace(":/", "://"),
        { refreshToken: tokens.refreshToken },
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
            "X-Client-Type": "mobile",
            Authorization: `Bearer ${tokens.refreshToken}`,
          },
        },
      );

      const newTokens = this.extractTokens(response.data);
      if (!newTokens) {
        throw new UnauthorizedException("No se pudo renovar la sesion");
      }

      await this.persistTokens(newTokens);
      this.processQueue(null, newTokens);

      const requestConfig = originalError.config as RetryableRequestConfig;
      requestConfig._retry = true;
      if (requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      }
      return this.client.request(originalError.config!);
    } catch (err) {
      await this.persistTokens(null);
      this.processQueue(err, null);
      this.handleUnauthorized();
      throw new UnauthorizedException(
        "La sesion expiro. Inicia sesion nuevamente.",
        {},
        "SESSION_EXPIRED",
      );
    } finally {
      // Siempre resetear el flag, incluso si falló
      this.isRefreshing = false;
    }
  }

  private processQueue(error: unknown, tokens: TokenPair | null): void {
    this.failedQueue.forEach((p) => {
      if (error || !tokens) p.reject(error);
      else p.resolve(tokens);
    });
    this.failedQueue = [];
  }

  private handleUnauthorized(): void {
    this.onUnauthorized?.();
  }

  public cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (!controller) return;
    controller.abort(`Solicitud ${requestId} cancelada`);
    this.abortControllers.delete(requestId);
  }

  public cancelAllRequests(): void {
    this.abortControllers.forEach((controller, requestId) => {
      controller.abort(`Solicitud ${requestId} cancelada`);
    });
    this.abortControllers.clear();
  }

  public async request<T>(
    config: AxiosRequestConfig,
    requestId?: string,
  ): Promise<AxiosResponse<T>> {
    if (requestId) {
      const controller = new AbortController();
      this.abortControllers.set(requestId, controller);
      config.signal = controller.signal;
    }

    try {
      const response = await this.retryRequest<T>(() =>
        this.client.request<T>(config),
      );

      if (requestId) this.abortControllers.delete(requestId);
      return response;
    } catch (err) {
      if (requestId) this.abortControllers.delete(requestId);
      throw err;
    }
  }
}
