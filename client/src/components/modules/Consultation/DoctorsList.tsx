"use client";
import { getDoctors } from "@/app/(commonLayout)/consultation/_actions";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";

const DoctorsList = () => {
  const { data } = useQuery<ApiResponse<Doctor[]>>({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

  // non-prefetched query example
  const { data: nonPrefetchedData } = useQuery<ApiResponse<Doctor[]>>({
    queryKey: ["doctors-non-prefetched"],
    queryFn: getDoctors,
  });

  console.log("Prefetch Data:", data);
  console.log("Non Pre-Fetch Data:", nonPrefetchedData);

  return (
    <div>
      {data?.data?.map((doctor) => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
    </div>
  );
};

export default DoctorsList;
