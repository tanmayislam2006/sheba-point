"use server";

import { HttpClientError, httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api";
import { RegisterData } from "@/types/auth";
import { IRegisterPayload, registerZodSchema } from "@/zod/auth.validation";

export const registerAction = async (
  payload: IRegisterPayload,
): Promise<ApiResponse<RegisterData>> => {
  const parsedPayload = registerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0]?.message || "Invalid input";

    return {
      status: 400,
      success: false,
      message: firstError,
    };
  }

  try {
    const response = await httpClient.post<ApiResponse<RegisterData>, IRegisterPayload>(
      "/auth/register",
      parsedPayload.data,
    );

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
      message: "Unexpected error while registering",
    };
  }
};
