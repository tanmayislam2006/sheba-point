import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getDoctors } from "./_actions";
import DoctorsList from "@/components/modules/Consultation/DoctorsList";

const ConsultationPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <>
      <h1 className="">ConsultationPage</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoctorsList />
      </HydrationBoundary>
    </>
  );
};

export default ConsultationPage;
