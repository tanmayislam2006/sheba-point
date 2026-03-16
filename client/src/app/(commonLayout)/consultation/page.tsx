import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import DoctorsList from "@/components/modules/Consultation/DoctorsList";
import { getDoctors } from "@/services/doctor.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ConsultationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ searchTerm?: string }>;
}) => {
  const { searchTerm = "" } = await searchParams;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["doctors", searchTerm],
      queryFn: () =>
        getDoctors({
          searchTerm: searchTerm || undefined,
          limit: 12,
          sortBy: "averageRating",
          sortOrder: "desc",
          include: "doctorSchedules,reviews",
        }),
    });
  } catch {
    // Let the client query render the fallback state if prefetch fails.
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,0.8)_100%)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Consultation
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Find the right doctor with a cleaner consultation workflow.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Search by specialty, workplace, qualification, or doctor name and move straight into the profile that fits the patient need.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-background/90 p-5 shadow-sm backdrop-blur">
            <form className="space-y-4" action="/consultation">
              <div className="space-y-2">
                <label htmlFor="searchTerm" className="text-sm font-medium">
                  Search doctors
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchTerm"
                    name="searchTerm"
                    defaultValue={searchTerm}
                    placeholder="Cardiology, MBBS, city hospital, Dr. name..."
                    className="h-12 rounded-2xl pl-9"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl">
                Search consultation
              </Button>
            </form>
          </div>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <DoctorsList searchTerm={searchTerm} />
        </HydrationBoundary>
      </section>
    </div>
  );
};

export default ConsultationPage;
