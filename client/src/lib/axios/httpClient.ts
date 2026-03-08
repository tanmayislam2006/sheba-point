import { env } from "@/env";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = env.NEXT_PUBLIC_URL;

type RequestHeaders = Record<string, string>;

export interface ApiRequestOption<TBody = unknown> {
  params?: Record<string, unknown>;
  headers?: RequestHeaders;
  signal?: AbortSignal;
  data?: TBody;
}

export interface HttpClientErrorShape {
  message: string;
  status: number;
  data?: unknown;
}

export class HttpClientError extends Error {
  status: number;
  data?: unknown;

  constructor({ message, status, data }: HttpClientErrorShape) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.data = data;
  }
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeError = (error: unknown): HttpClientError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 500;
    const message =
      axiosError.response?.data?.message ?? axiosError.message ?? "Request failed";

    return new HttpClientError({
      message,
      status,
      data: axiosError.response?.data,
    });
  }

  return new HttpClientError({
    message: "Unexpected client error",
    status: 500,
    data: error,
  });
};

async function request<TResponse, TBody = unknown>(
  method: AxiosRequestConfig["method"],
  endpoint: string,
  options?: ApiRequestOption<TBody>,
): Promise<TResponse> {
  try {
    const response = await axiosClient.request<TResponse>({
      url: endpoint,
      method,
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
      data: options?.data,
    });

    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export const httpClient = {
  get: <TResponse>(endpoint: string, options?: ApiRequestOption) =>
    request<TResponse>("get", endpoint, options),
  post: <TResponse, TBody = unknown>(
    endpoint: string,
    data?: TBody,
    options?: Omit<ApiRequestOption<TBody>, "data">,
  ) => request<TResponse, TBody>("post", endpoint, { ...options, data }),
  put: <TResponse, TBody = unknown>(
    endpoint: string,
    data?: TBody,
    options?: Omit<ApiRequestOption<TBody>, "data">,
  ) => request<TResponse, TBody>("put", endpoint, { ...options, data }),
  patch: <TResponse, TBody = unknown>(
    endpoint: string,
    data?: TBody,
    options?: Omit<ApiRequestOption<TBody>, "data">,
  ) => request<TResponse, TBody>("patch", endpoint, { ...options, data }),
  delete: <TResponse>(endpoint: string, options?: ApiRequestOption) =>
    request<TResponse>("delete", endpoint, options),
};
