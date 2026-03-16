"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";
import { getDoctors } from "@/services/doctor.service";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, CalendarDays, IndianRupee, SearchX, Star } from "lucide-react";

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number") {
    return "Contact for fee";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getAvailableSlots = (doctor: Doctor) =>
  doctor.doctorSchedules?.filter((schedule) => !schedule.isBooked).length ?? 0;

const DoctorsList = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const { data, error, isPending, refetch } = useQuery<ApiResponse<Doctor[]>>({
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

  const doctors = data?.data ?? [];

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Unable to load doctors right now.";

    return (
      <Alert variant="destructive" className="rounded-3xl">
        <AlertDescription className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>{message}</span>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (doctors.length === 0) {
    return (
      <Card className="rounded-3xl border border-dashed border-border/80 bg-muted/30 py-10 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
            <SearchX className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">No doctors matched this search</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Try a different name, specialty, workplace, or qualification.
            </p>
          </div>
          <Link href="/consultation" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Clear search
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {doctors.map((doctor) => {
        const specialties = doctor.specialties?.map((item) => item.specialty.title) ?? [];
        const availableSlots = getAvailableSlots(doctor);

        return (
          <Card
            key={doctor.id}
            className="rounded-3xl border border-border/70 bg-gradient-to-b from-background via-background to-muted/20 pt-0 shadow-sm transition-transform duration-200 hover:-translate-y-1"
          >
            <CardHeader className="border-b border-border/70 bg-gradient-to-r from-muted/60 via-background to-background pt-6">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
                  {doctor.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-2">
                  <CardTitle className="text-xl font-semibold">{doctor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {doctor.designation || "Specialist Doctor"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="size-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Rating</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">
                    {doctor.averageRating?.toFixed(1) ?? "New"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Slots</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">{availableSlots}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <BriefcaseBusiness className="mt-0.5 size-4 shrink-0" />
                  <span>{doctor.currentWorkingPlace || "Working place not added yet"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <IndianRupee className="mt-0.5 size-4 shrink-0" />
                  <span>{formatCurrency(doctor.appointmentFee)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">
                  {doctor.qualification || "Qualification will be updated soon"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {doctor.experience ? `${doctor.experience}+ years of experience` : "Experience information coming soon"}
                </p>
              </div>
            </CardContent>

            <CardFooter className="justify-between gap-3 border-t border-border/70 bg-background/80">
              <p className="text-xs text-muted-foreground">
                {doctor.reviews?.length ?? 0} patient reviews
              </p>
              <Link
                href={`/consultation/doctor/${doctor.id}`}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                View details
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default DoctorsList;
