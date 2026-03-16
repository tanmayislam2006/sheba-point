import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import DoctorDetails from "@/components/modules/Consultation/DoctorDetails";
import { getDoctorById } from "@/services/doctor.service";

const ConsultationDoctorByIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["doctor", id],
      queryFn: () => getDoctorById(id),
    });
  } catch {
    // Let the client-side query render an error state if fetch fails.
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,0.8)_100%)]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DoctorDetails id={id} />
        </HydrationBoundary>
      </section>
    </div>
  );
};

export default ConsultationDoctorByIdPage;
