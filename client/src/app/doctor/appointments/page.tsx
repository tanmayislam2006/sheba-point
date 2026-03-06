"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, FileText, CheckCircle2, Video, MapPin, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const appointments = [
  { id: "APT-1001", patient: "Emma Watson", date: "Today", time: "09:00 AM", status: "completed", type: "video" },
  { id: "APT-1002", patient: "John Doe", date: "Today", time: "10:30 AM", status: "in-progress", type: "physical" },
  { id: "APT-1003", patient: "Michael Smith", date: "Today", time: "01:00 PM", status: "scheduled", type: "video" },
  { id: "APT-1004", patient: "Sarah Lee", date: "Today", time: "03:30 PM", status: "scheduled", type: "physical" },
  { id: "APT-1005", patient: "James Wilson", date: "Tomorrow", time: "10:00 AM", status: "scheduled", type: "video" },
];

export default function DoctorAppointmentsPage() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "scheduled": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">Scheduled</Badge>;
      case "in-progress": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100/80">In Progress</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">Completed</Badge>;
      case "cancelled": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100/80">Cancelled</Badge>;
      default: return null;
    }
  };

  const renderTable = (filterStatus: string[]) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Patient</TableHead>
              <TableHead className="font-semibold text-slate-700">Date & Time</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.filter(a => filterStatus.includes(a.status)).map((apt) => (
              <TableRow key={apt.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">{apt.patient.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-slate-900">{apt.patient}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-900">{apt.date}</div>
                  <div className="text-xs text-slate-500">{apt.time}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {apt.type === "video" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span className="text-sm capitalize">{apt.type}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {apt.status === "scheduled" && (
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">Start Consult</Button>
                    )}
                    {apt.status === "in-progress" && (
                      <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 text-xs gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                      </Button>
                    )}
                    {apt.status === "completed" && (
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs gap-1" asChild>
                         <Link href={`/doctor/prescriptions/create?patient=${apt.patient}`}><Edit3 className="h-3.5 w-3.5" /> Write Rx</Link>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                      <span className="sr-only">View Details</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500">Manage your daily schedule and consultations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <Input placeholder="Search patient name..." className="max-w-md border-slate-200" />
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="bg-slate-100 p-1 h-auto w-full justify-start rounded-xl overflow-x-auto hide-scrollbar">
          <TabsTrigger value="today" className="px-6 py-2.5 text-base font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Today's Queue</TabsTrigger>
          <TabsTrigger value="scheduled" className="px-6 py-2.5 text-base font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="px-6 py-2.5 text-base font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          {renderTable(["scheduled", "in-progress", "completed"])}
        </TabsContent>
        <TabsContent value="scheduled">
          {renderTable(["scheduled"])}
        </TabsContent>
        <TabsContent value="completed">
           {renderTable(["completed"])}
        </TabsContent>
      </Tabs>
    </div>
  );
}