import { httpClient } from "@/lib/axios/httpClient";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";

export const getDoctors = async () => {
  const doctor = await httpClient.get<ApiResponse<Doctor[]>>("/doctor");
  return doctor;
};
