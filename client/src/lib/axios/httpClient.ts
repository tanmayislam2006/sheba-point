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

const isServer = typeof window === "undefined";

async function refreshServerTokensIfNeeded(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const [{ isTokenExpired, isTokenExpiringSoon }, { getNewTokensWithRefreshToken }] =
    await Promise.all([
      import("../tokenUtils"),
      import("@/services/auth.service"),
    ]);

  const shouldRefresh =
    !accessToken ||
    (await isTokenExpired(accessToken)) ||
    (await isTokenExpiringSoon(accessToken, 300));

  if (!shouldRefresh) {
    return;
  }

  try {
    await getNewTokensWithRefreshToken(refreshToken);
  } catch (error) {
    console.error("Error refreshing token in http client:", error);
  }
}

async function getServerCookieHeader(): Promise<string | undefined> {
  if (!isServer) {
    return undefined;
  }

  const { cookies, headers } = await import("next/headers");
  const requestHeaders = await headers();
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const tokenAlreadyRefreshed = requestHeaders.get("x-token-refreshed") === "1";

  if (refreshToken && !tokenAlreadyRefreshed) {
    await refreshServerTokensIfNeeded(accessToken ?? "", refreshToken);
  }

  const refreshedCookieStore = await cookies();
  const cookieHeader = refreshedCookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return cookieHeader || undefined;
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
      axiosError.response?.data?.message ??
      axiosError.message ??
      "Request failed";

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
    const serverCookieHeader = await getServerCookieHeader();
    const mergedHeaders: RequestHeaders = {
      ...(options?.headers ?? {}),
      ...(serverCookieHeader ? { Cookie: serverCookieHeader } : {}),
    };

    const response = await axiosClient.request<TResponse>({
      url: endpoint,
      method,
      params: options?.params,
      headers: mergedHeaders,
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
