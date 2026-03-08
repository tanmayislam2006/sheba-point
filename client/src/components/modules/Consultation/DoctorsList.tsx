/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getDoctors } from "@/app/(commonLayout)/consultation/_actions";
import { useQuery } from "@tanstack/react-query";

const DoctorsList = () => {
     const { data  } = useQuery({
       queryKey: ["doctors"],
       queryFn: () => getDoctors(),
     });

     console.log(data,"DKDVKDDDDKFJDJFKDJFKDJKDJFDJF");

    //  non-prefetched query example
     const {data : nonPrefetchedData} = useQuery({
       queryKey: ["doctors-non-prefetched"],
       queryFn: () => getDoctors(),
     });

     console.log("Non Pre-Fetch Data will be get after ",nonPrefetchedData);

  return (
    <div>{data.data.map((doctor: any) => (
      <div key={doctor.id}>{doctor.name}</div>
    ))}</div>
  )
}

export default DoctorsList