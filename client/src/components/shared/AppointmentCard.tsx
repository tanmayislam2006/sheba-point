import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, CheckCircle2, XCircle, FileText } from "lucide-react";

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "video" | "physical";
  status: "scheduled" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending";
  doctorImage?: string;
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100/80";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100/80";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-slate-100">
            <AvatarImage src={appointment.doctorImage} alt={appointment.doctorName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {appointment.doctorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-slate-900">{appointment.doctorName}</h4>
            <p className="text-sm text-slate-500">{appointment.specialty}</p>
          </div>
        </div>
        <Badge className={getStatusColor(appointment.status)} variant="outline">
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">{appointment.date}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">{appointment.time}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            {appointment.type === "video" ? (
              <Video className="h-4 w-4 text-slate-400" />
            ) : (
              <MapPin className="h-4 w-4 text-slate-400" />
            )}
            <span className="font-medium text-slate-700 capitalize">{appointment.type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Payment Status</span>
          <div className="flex items-center gap-1">
            {appointment.paymentStatus === "paid" ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <Clock className="h-4 w-4 text-amber-500" />
            )}
            <span className={`text-sm font-medium ${appointment.paymentStatus === "paid" ? "text-secondary" : "text-amber-500"}`}>
              {appointment.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        {appointment.status === "scheduled" && appointment.paymentStatus === "pending" && (
          <Button className="w-full bg-primary hover:bg-primary/90">Pay Now</Button>
        )}
        {appointment.status === "scheduled" && appointment.paymentStatus === "paid" && appointment.type === "video" && (
          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white gap-2">
            <Video className="h-4 w-4" /> Join Call
          </Button>
        )}
        {appointment.status === "completed" && (
          <Button variant="outline" className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5">
            <FileText className="h-4 w-4" /> View Prescription
          </Button>
        )}
        {appointment.status === "scheduled" && (
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
