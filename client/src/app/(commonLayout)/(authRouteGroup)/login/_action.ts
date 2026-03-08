"use server";

import { HttpClientError, httpClient } from "@/lib/axios/httpClient";
import { setToken } from "@/lib/tokenUtils";
import { ApiResponse } from "@/types/api";
import { LoginData } from "@/types/auth";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";

export const loginAction = async (
  payload: ILoginPayload,
): Promise<ApiResponse<LoginData>> => {
  const parsedPayload = loginZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0]?.message || "Invalid input";

    return {
      status: 400,
      success: false,
      message: firstError,
    };
  }

  try {
    const response = await httpClient.post<ApiResponse<LoginData>, ILoginPayload>(
      "/auth/login",
      parsedPayload.data,
    );
    if (response.success && response.data) {
      await Promise.all([
        setToken("better-auth.session_token", response.data.token),
        setToken("accessToken", response.data.accessToken),
        setToken("refreshToken", response.data.refreshToken),
      ]);
    }

    return response;
  } catch (error) {
    if (error instanceof HttpClientError) {
      return {
        status: error.status,
        success: false,
        message: error.message,
      };
    }

    return {
      status: 500,
      success: false,
      message: "Unexpected error while logging in",
    };
  }
};
