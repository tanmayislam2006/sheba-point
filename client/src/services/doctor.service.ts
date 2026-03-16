"use server"
import { httpClient } from "@/lib/axios/httpClient";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";

export interface GetDoctorsParams {
  searchTerm?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  include?: string;
}

export const getDoctors = async (
  params?: GetDoctorsParams,
): Promise<ApiResponse<Doctor[]>> => {
  return httpClient.get<ApiResponse<Doctor[]>>("/doctor", {
    params,
  });
};

export const getDoctorById = async (
  id: string,
): Promise<ApiResponse<Doctor>> => {
  return httpClient.get<ApiResponse<Doctor>>(`/doctor/${id}`);
};
