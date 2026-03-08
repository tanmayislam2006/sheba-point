"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BookingModal } from "@/components/shared/BookingModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Award, Shield, MessageSquare, Video, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DoctorProfilePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const doctor = {
    id: "d1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 128,
    experience: 15,
    fee: 150,
    location: "New York Medical Center, NY",
    about: "Dr. Sarah Jenkins is a board-certified Cardiologist with over 15 years of experience treating a wide range of cardiovascular diseases. She specializes in preventive cardiology, heart failure, and complex arrhythmias. She completed her fellowship at Johns Hopkins Hospital and is dedicated to providing compassionate, patient-centered care.",
    education: [
      "MD, Harvard Medical School",
      "Residency, Internal Medicine, Mayo Clinic",
      "Fellowship, Cardiology, Johns Hopkins Hospital"
    ],
    languages: ["English", "Spanish"]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="public" />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative"></div>
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-md bg-white">
                <AvatarImage src="/placeholder-avatar.jpg" alt={doctor.name} />
                <AvatarFallback className="text-4xl font-bold text-primary">{doctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                    <Shield className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                </div>
                <p className="text-lg font-medium text-primary">{doctor.specialty}</p>
              </div>
              <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
                <Button size="lg" className="flex-1 sm:w-48 bg-primary hover:bg-primary/90 shadow-sm" onClick={() => setIsBookingModalOpen(true)}>
                  Book Appointment
                </Button>
                <Button size="lg" variant="outline" className="flex-1 sm:w-48 border-slate-300">
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Rating</p>
                  <p className="font-semibold text-slate-900">{doctor.rating} <span className="text-sm font-normal text-slate-500">({doctor.reviews})</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Experience</p>
                  <p className="font-semibold text-slate-900">{doctor.experience}+ Years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Availability</p>
                  <p className="font-semibold text-slate-900 truncate">Available Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Location</p>
                  <p className="font-semibold text-slate-900 truncate" title={doctor.location}>{doctor.location.split(',')[0]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto w-full justify-start rounded-xl overflow-x-auto hide-scrollbar">
            <TabsTrigger value="about" className="px-6 py-2.5 text-base font-medium data-[state=active]:bg-slate-100 rounded-lg">About</TabsTrigger>
            <TabsTrigger value="availability" className="px-6 py-2.5 text-base font-medium data-[state=active]:bg-slate-100 rounded-lg">Availability</TabsTrigger>
            <TabsTrigger value="reviews" className="px-6 py-2.5 text-base font-medium data-[state=active]:bg-slate-100 rounded-lg">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> About Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-6">
                <p className="text-slate-600 leading-relaxed text-base">{doctor.about}</p>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" /> Education & Training
                    </h3>
                    <ul className="space-y-2 text-slate-600">
                      {doctor.education.map((edu, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400" /> Languages Spoken
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-50 text-slate-700 font-normal py-1 px-3">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Schedule & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                  <div className="bg-slate-50 rounded-xl p-5 flex-1 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Video className="h-5 w-5 text-secondary" />
                      <h4 className="font-semibold text-slate-900">Video Consultation</h4>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">${doctor.fee}</p>
                    <p className="text-sm text-slate-500">per 30 min session</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5 flex-1 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-slate-900">Clinic Visit</h4>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">${doctor.fee + 50}</p>
                    <p className="text-sm text-slate-500">{doctor.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900">Available Time Slots</h4>
                  <div className="flex flex-wrap gap-2">
                    {["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"].map((time, i) => (
                      <Button key={i} variant="outline" className="border-slate-200 hover:border-primary hover:text-primary transition-colors">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
               <CardContent className="py-12 text-center">
                 <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                   <Star className="h-8 w-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Be the first to review {doctor.name} after your consultation.</p>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctorName={doctor.name}
      />
    </div>
  );
}