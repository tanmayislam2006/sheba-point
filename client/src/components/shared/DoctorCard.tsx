import { Star, MapPin, Clock, DollarSign, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  fee: number;
  location: string;
  availability: string;
  imageUrl?: string;
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-slate-200">
      <CardHeader className="flex flex-row gap-4 items-start pb-2">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage src={doctor.imageUrl || "/placeholder-avatar.jpg"} alt={doctor.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {doctor.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">{doctor.name}</h3>
              <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-700">{doctor.rating}</span>
              <span className="text-xs text-amber-600/70">({doctor.reviews})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-slate-400" />
            <span>{doctor.experience} Years Exp.</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span>${doctor.fee} / Visit</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{doctor.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <span className="text-secondary font-medium">{doctor.availability}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">Video Consult</Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">Clinic Visit</Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-3">
        <Button variant="outline" className="flex-1 border-slate-300" asChild>
          <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" asChild>
          <Link href={`/doctors/${doctor.id}?book=true`}>Book Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
