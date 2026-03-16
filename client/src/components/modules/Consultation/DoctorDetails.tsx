"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDoctorById } from "@/services/doctor.service";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/types/doctor";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

const feeFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const DoctorDetails = ({ id }: { id: string }) => {
  const { data, error, isPending, refetch } = useQuery<ApiResponse<Doctor>>({
    queryKey: ["doctor", id],
    queryFn: () => getDoctorById(id),
  });

  if (isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="h-96 animate-pulse rounded-[2rem] border border-border/70 bg-muted/60" />
        <div className="h-96 animate-pulse rounded-[2rem] border border-border/70 bg-muted/60" />
      </div>
    );
  }

  if (error || !data?.data) {
    const message =
      error instanceof Error ? error.message : "Unable to load doctor details right now.";

    return (
      <Alert variant="destructive" className="rounded-3xl">
        <AlertDescription className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>{message}</span>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const doctor = data.data;
  const availableSchedules =
    doctor.doctorSchedules?.filter((item) => !item.isBooked) ?? [];
  const recentReviews = doctor.reviews?.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/consultation"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to consultation
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-background to-muted/30 pt-0 shadow-sm">
          <CardHeader className="border-b border-border/70 bg-gradient-to-r from-muted/60 via-background to-background pt-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-primary text-2xl font-semibold text-primary-foreground">
                {doctor.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">{doctor.name}</h1>
                  <p className="mt-1 text-base text-muted-foreground">
                    {doctor.designation || "Specialist Doctor"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.specialties?.map((item) => (
                    <span
                      key={`${doctor.id}-${item.specialty.title}`}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {item.specialty.title}
                    </span>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <Star className="size-4" />
                      Rating
                    </div>
                    <p className="mt-2 text-xl font-semibold">
                      {doctor.averageRating?.toFixed(1) ?? "New"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <CalendarDays className="size-4" />
                      Open slots
                    </div>
                    <p className="mt-2 text-xl font-semibold">{availableSchedules.length}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <BadgeCheck className="size-4" />
                      Experience
                    </div>
                    <p className="mt-2 text-xl font-semibold">
                      {doctor.experience ? `${doctor.experience}+ yrs` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Professional overview</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Qualification
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {doctor.qualification || "Not added yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Registration
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {doctor.registrationNumber || "Not added yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <BriefcaseBusiness className="size-4" />
                    Working place
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {doctor.currentWorkingPlace || "Not added yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <MapPin className="size-4" />
                    Address
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {doctor.address || "Not added yet"}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Next available schedule</h2>
              <div className="space-y-3">
                {availableSchedules.length > 0 ? (
                  availableSchedules.slice(0, 5).map((item) => (
                    <div
                      key={item.schedule.id}
                      className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{formatDateTime(item.schedule.startDateTime)}</p>
                        <p className="text-sm text-muted-foreground">
                          Ends {formatDateTime(item.schedule.endDateTime)}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                        Available
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                    No open schedule has been published yet.
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-border/70 bg-background shadow-sm">
            <CardHeader>
              <CardTitle>Consultation summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Appointment fee
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {typeof doctor.appointmentFee === "number"
                    ? feeFormatter.format(doctor.appointmentFee)
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <span>{doctor.email || "Email not shared"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0" />
                  <span>{doctor.contactNumber || "Phone not shared"}</span>
                </div>
              </div>

              <Link href="/dashboard/book-appointments" className="block">
                <Button size="lg" className="h-11 w-full rounded-2xl">
                  Continue to booking
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-border/70 bg-background shadow-sm">
            <CardHeader>
              <CardTitle>Patient reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{review.rating.toFixed(1)} / 5</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment || "Patient left a rating without a written review."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Reviews will appear here after patients share feedback.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
