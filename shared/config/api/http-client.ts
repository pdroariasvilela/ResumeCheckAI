import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiClientConfig } from "./api-client";

export class HttpClient {
  constructor(private readonly client: ApiClientConfig) {}

  get<T>(url: string, config?: AxiosRequestConfig, requestId?: string): Promise<AxiosResponse<T>> {
    return this.client.request<T>({ method: "GET", url, ...config }, requestId);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig, requestId?: string): Promise<AxiosResponse<T>> {
    return this.client.request<T>({ method: "POST", url, data, ...config }, requestId);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig, requestId?: string): Promise<AxiosResponse<T>> {
    return this.client.request<T>({ method: "PUT", url, data, ...config }, requestId);
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig, requestId?: string): Promise<AxiosResponse<T>> {
    return this.client.request<T>({ method: "PATCH", url, data, ...config }, requestId);
  }

  delete<T>(url: string, data?: unknown, config?: AxiosRequestConfig, requestId?: string): Promise<AxiosResponse<T>> {
    return this.client.request<T>({ method: "DELETE", url, data, ...config }, requestId);
  }

  cancelRequest(requestId: string) {
    this.client.cancelRequest(requestId);
  }

  cancelAllRequests() {
    this.client.cancelAllRequests();
  }
}