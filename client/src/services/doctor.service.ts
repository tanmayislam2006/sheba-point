"use server";
import { httpClient } from "@/lib/axios/httpClient";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";

export const getDoctors = async (): Promise<ApiResponse<Doctor[]>> => {
  return httpClient.get<ApiResponse<Doctor[]>>("/doctor");
};
