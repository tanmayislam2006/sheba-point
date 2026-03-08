"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, FileText, CheckCircle2, Clock, XCircle, Video, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const appointments = [
  { id: "APT-1001", doctor: "Dr. Sarah Jenkins", specialty: "Cardiologist", date: "2023-10-24", time: "10:00 AM", status: "scheduled", payment: "paid", type: "video" },
  { id: "APT-1002", doctor: "Dr. Michael Chen", specialty: "Neurologist", date: "2023-10-20", time: "02:30 PM", status: "completed", payment: "paid", type: "physical" },
  { id: "APT-1003", doctor: "Dr. Emily Rodriguez", specialty: "Dermatologist", date: "2023-10-15", time: "11:00 AM", status: "cancelled", payment: "pending", type: "video" },
  { id: "APT-1004", doctor: "Dr. James Wilson", specialty: "Pediatrician", date: "2023-10-28", time: "09:00 AM", status: "scheduled", payment: "pending", type: "physical" },
];

export default function AppointmentsPage() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "scheduled": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">Scheduled</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">Completed</Badge>;
      case "cancelled": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100/80">Cancelled</Badge>;
      default: return null;
    }
  };

  const getPaymentBadge = (status: string) => {
    return status === "paid" ?
      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50"><CheckCircle2 className="mr-1 h-3 w-3" />Paid</Badge> :
      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-500">Manage and track your healthcare appointments.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Book New Appointment</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <Input placeholder="Search doctor, ID..." className="max-w-xs border-slate-200" />
         <Select defaultValue="all">
           <SelectTrigger className="w-[180px] border-slate-200">
             <SelectValue placeholder="Status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Statuses</SelectItem>
             <SelectItem value="scheduled">Scheduled</SelectItem>
             <SelectItem value="completed">Completed</SelectItem>
             <SelectItem value="cancelled">Cancelled</SelectItem>
           </SelectContent>
         </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Doctor</TableHead>
                <TableHead className="font-semibold text-slate-700">Date & Time</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{apt.doctor.charAt(4)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{apt.doctor}</div>
                        <div className="text-xs text-slate-500">{apt.specialty}</div>
                      </div>
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
                  <TableCell>{getPaymentBadge(apt.payment)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === "scheduled" && apt.payment === "pending" && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">Pay Now</Button>
                      )}
                      {apt.status === "completed" && (
                        <Button size="sm" variant="outline" className="border-slate-300 text-xs gap-1">
                          <FileText className="h-3.5 w-3.5" /> Rx
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
    </div>
  );
}