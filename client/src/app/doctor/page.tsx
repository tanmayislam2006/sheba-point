"use client";

import { DashboardWidget } from "@/components/shared/DashboardWidget";
import { Users, CalendarDays, DollarSign, Pill, Video, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const todaysAppointments = [
  { id: "A1", patient: "Emma Watson", time: "09:00 AM", type: "video", status: "completed" },
  { id: "A2", patient: "John Doe", time: "10:30 AM", type: "physical", status: "in-progress" },
  { id: "A3", patient: "Michael Smith", time: "01:00 PM", type: "video", status: "scheduled" },
  { id: "A4", patient: "Sarah Lee", time: "03:30 PM", type: "physical", status: "scheduled" },
];

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dr. Sarah Jenkins</h1>
        <p className="mt-2 text-lg text-slate-500">Here's a summary of your schedule today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Today's Appointments"
          value="8"
          icon={CalendarDays}
          iconColor="primary"
        />
        <DashboardWidget
          title="Total Patients"
          value="1,245"
          icon={Users}
          iconColor="secondary"
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardWidget
          title="Pending Prescriptions"
          value="4"
          icon={Pill}
          iconColor="amber"
        />
        <DashboardWidget
          title="This Month's Earnings"
          value="$12,450"
          icon={DollarSign}
          iconColor="purple"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-lg font-bold">Today's Schedule</CardTitle>
            <Button variant="link" className="text-primary px-0" asChild>
              <Link href="/doctor/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center h-12 w-16 bg-white rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">{apt.time.split(" ")[1]}</span>
                    <span className="text-sm font-bold text-slate-900">{apt.time.split(" ")[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{apt.patient}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 capitalize">{apt.type} Visit</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {apt.status === "completed" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">Completed</Badge>}
                  {apt.status === "in-progress" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100/80">In Progress</Badge>}
                  {apt.status === "scheduled" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">Scheduled</Badge>}

                  {apt.status === "in-progress" && (
                     <Button size="sm" className="bg-primary text-xs ml-2">Resume Call</Button>
                  )}
                  {apt.status === "scheduled" && apt.type === "video" && (
                     <Button size="sm" variant="outline" className="text-primary border-primary/30 text-xs gap-1 ml-2">
                       <Video className="h-3.5 w-3.5" /> Start Call
                     </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-bold">Action Required</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4 mt-2">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                 <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
                       <Pill className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Write Prescription</h4>
                      <p className="text-xs text-slate-600 mt-1">Emma Watson's consultation completed. Prescription pending.</p>
                      <Button size="sm" className="mt-3 text-xs w-full bg-amber-500 hover:bg-amber-600" asChild>
                        <Link href="/doctor/prescriptions/create?patient=Emma Watson">Create Prescription</Link>
                      </Button>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}