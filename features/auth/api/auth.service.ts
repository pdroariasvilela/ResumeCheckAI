import { buildEndpoint, END_POINTS, httpClient } from "@/shared/config/api";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AuthSession,
  AuthTokens,
  LoginDto,
  MePayload,
  RegisterDto,
  User,
} from "@/shared/types/auth";

type AuthResponseData = {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  tokens?: Partial<AuthTokens>;
};

class AuthService {
  private parseSession(data: AuthResponseData): AuthSession {
    const accessToken = data.accessToken ?? data.tokens?.accessToken;
    const refreshToken = data.refreshToken ?? data.tokens?.refreshToken;

    if (!data.user || !accessToken || !refreshToken) {
      throw new Error("Respuesta de autenticacion invalida");
    }

    return {
      user: data.user,
      accessToken,
      refreshToken,
    };
  }

  async login(payload: LoginDto): Promise<AuthSession> {
    const endpoint = buildEndpoint(END_POINTS.AUTH.LOGIN);
    const response = await httpClient.post<ApiResponse<AuthResponseData>>(endpoint, payload);
    return this.parseSession(response.data.data);
  }

  async register(payload: RegisterDto): Promise<AuthSession> {
    const endpoint = buildEndpoint(END_POINTS.AUTH.REGISTER);
    const response = await httpClient.post<ApiResponse<AuthResponseData>>(endpoint, payload);
    return this.parseSession(response.data.data);
  }

  async me(): Promise<MePayload> {
    const endpoint = buildEndpoint(END_POINTS.AUTH.ME);
    const response = await httpClient.get<ApiResponse<MePayload>>(endpoint);
    return response.data.data;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const endpoint = buildEndpoint(END_POINTS.AUTH.REFRESH);
    const response = await httpClient.post<ApiResponse<AuthResponseData>>(endpoint, {
      refreshToken,
    });

    const accessToken = response.data.data.accessToken ?? response.data.data.tokens?.accessToken;
    const nextRefreshToken =
      response.data.data.refreshToken ?? response.data.data.tokens?.refreshToken;

    if (!accessToken || !nextRefreshToken) {
      throw new Error("Respuesta de refresh invalida");
    }

    return { accessToken, refreshToken: nextRefreshToken };
  }

  async logout(): Promise<void> {
    const endpoint = buildEndpoint(END_POINTS.AUTH.LOGOUT);
    await httpClient.post(endpoint);
  }
}

export const authService = new AuthService();
