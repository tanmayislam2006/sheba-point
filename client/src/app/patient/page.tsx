"use client";

import { DashboardWidget } from "@/components/shared/DashboardWidget";
import { AppointmentCard, type Appointment } from "@/components/shared/AppointmentCard";
import { CalendarDays, Pill, Activity, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockUpcoming: Appointment[] = [
  {
    id: "a1",
    doctorName: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    date: "Oct 24, 2023",
    time: "10:00 AM",
    type: "video",
    status: "scheduled",
    paymentStatus: "paid"
  }
];

export default function PatientDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back, John!</h1>
        <p className="mt-2 text-lg text-slate-500">Here's an overview of your health journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Upcoming Appointments"
          value="2"
          icon={CalendarDays}
          iconColor="primary"
        />
        <DashboardWidget
          title="Total Consultations"
          value="14"
          icon={Activity}
          iconColor="secondary"
        />
        <DashboardWidget
          title="Active Prescriptions"
          value="3"
          icon={Pill}
          iconColor="purple"
        />
        <DashboardWidget
          title="Unread Notifications"
          value="5"
          icon={Bell}
          iconColor="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointment</h2>
            <Button variant="link" className="text-primary hover:text-primary/80 px-0" asChild>
              <Link href="/patient/appointments">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6">
            {mockUpcoming.map((apt) => (
               <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Notifications</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex items-start gap-3 bg-blue-50/50">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-slate-900">Appointment Reminder</p>
                   <p className="text-xs text-slate-500 mt-0.5">Your video consultation with Dr. Jenkins is tomorrow at 10:00 AM.</p>
                   <span className="text-[10px] text-slate-400 mt-2 block">2 hours ago</span>
                </div>
             </div>
             <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600 shrink-0">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-slate-900">New Prescription Added</p>
                   <p className="text-xs text-slate-500 mt-0.5">Dr. Chen has uploaded a new prescription for you.</p>
                   <span className="text-[10px] text-slate-400 mt-2 block">1 day ago</span>
                </div>
             </div>
             <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-slate-900">Profile Updated</p>
                   <p className="text-xs text-slate-500 mt-0.5">Your medical records have been successfully updated.</p>
                   <span className="text-[10px] text-slate-400 mt-2 block">3 days ago</span>
                </div>
             </div>
             <Button variant="ghost" className="w-full text-sm text-slate-500 rounded-none hover:text-primary" asChild>
                <Link href="/patient/notifications">View All Notifications</Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}