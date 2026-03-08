"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DoctorCard, type Doctor } from "@/components/shared/DoctorCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Sarah Jenkins", specialty: "Cardiologist", rating: 4.9, reviews: 128, experience: 15, fee: 150, location: "New York, NY", availability: "Available Today" },
  { id: "d2", name: "Dr. Michael Chen", specialty: "Neurologist", rating: 4.8, reviews: 94, experience: 12, fee: 200, location: "San Francisco, CA", availability: "Next Avail: Tomorrow" },
  { id: "d3", name: "Dr. Emily Rodriguez", specialty: "Dermatologist", rating: 4.7, reviews: 215, experience: 8, fee: 120, location: "Chicago, IL", availability: "Available Today" },
  { id: "d4", name: "Dr. James Wilson", specialty: "Pediatrician", rating: 4.9, reviews: 340, experience: 20, fee: 100, location: "Austin, TX", availability: "Next Avail: Mon" },
  { id: "d5", name: "Dr. Olivia Bennett", specialty: "Orthopedic", rating: 4.6, reviews: 85, experience: 10, fee: 180, location: "Boston, MA", availability: "Available Today" },
  { id: "d6", name: "Dr. William Taylor", specialty: "Psychiatrist", rating: 4.8, reviews: 150, experience: 14, fee: 160, location: "Seattle, WA", availability: "Next Avail: Wed" },
];

const specialties = ["Cardiologist", "Neurologist", "Dermatologist", "Pediatrician", "Orthopedic", "Psychiatrist", "Dentist"];

export default function DoctorListingPage() {
  const [feeRange, setFeeRange] = useState([50, 300]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="public" />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 h-fit sticky top-24 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                Filters
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                  <FilterX className="h-4 w-4" />
                </Button>
              </h2>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Specialty</Label>
              <div className="space-y-2">
                {specialties.slice(0, 5).map((spec) => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox id={`spec-${spec}`} className="border-slate-300 text-primary focus:ring-primary" />
                    <label htmlFor={`spec-${spec}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600">
                      {spec}
                    </label>
                  </div>
                ))}
                <Button variant="link" className="px-0 h-auto text-primary text-sm font-medium">Show all</Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Consultation Fee</span>
                <span className="text-slate-500 font-normal">${feeRange[0]} - ${feeRange[1]}</span>
              </Label>
              <Slider
                defaultValue={[50, 300]}
                max={500}
                step={10}
                value={feeRange}
                onValueChange={setFeeRange}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Availability</Label>
              <div className="space-y-2">
                {["Available Today", "Available Tomorrow", "Next 7 Days"].map((avail) => (
                  <div key={avail} className="flex items-center space-x-2">
                    <Checkbox id={`avail-${avail}`} className="border-slate-300 text-primary" />
                    <label htmlFor={`avail-${avail}`} className="text-sm font-medium leading-none text-slate-600">
                      {avail}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Experience (Years)</Label>
              <Select>
                <SelectTrigger className="w-full border-slate-200">
                  <SelectValue placeholder="Any Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Experience</SelectItem>
                  <SelectItem value="5+">5+ Years</SelectItem>
                  <SelectItem value="10+">10+ Years</SelectItem>
                  <SelectItem value="15+">15+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search doctors, specialties, clinics..."
                  className="pl-10 h-12 w-full border-slate-200 bg-slate-50 focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-slate-500 whitespace-nowrap hidden sm:inline-block">Sort by:</span>
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-full sm:w-[180px] h-12 border-slate-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="fee_low">Fee: Low to High</SelectItem>
                    <SelectItem value="fee_high">Fee: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <h1 className="text-xl font-bold text-slate-900">{mockDoctors.length} Doctors found</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}