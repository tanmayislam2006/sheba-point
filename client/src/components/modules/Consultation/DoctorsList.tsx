"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";
import { getDoctors } from "@/services/doctor.service";

const DoctorsList = () => {
  const { data } = useQuery<ApiResponse<Doctor[]>>({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
  return (
    <div>
      {data?.data?.map((doctor) => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
    </div>
  );
};

export default DoctorsList;
