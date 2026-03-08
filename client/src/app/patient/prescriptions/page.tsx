"use client";

import { PrescriptionCard, type Prescription } from "@/components/shared/PrescriptionCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const mockPrescriptions: Prescription[] = [
  {
    id: "RX-847291",
    doctorName: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    date: "Oct 15, 2023",
    diagnosis: "Mild Hypertension and Elevated Cholesterol",
    medicines: [
      { name: "Lisinopril", dosage: "10mg, 1 tablet daily", duration: "30 Days" },
      { name: "Atorvastatin", dosage: "20mg, 1 tablet at night", duration: "30 Days" }
    ],
    notes: "Please monitor blood pressure weekly and reduce salt intake."
  },
  {
    id: "RX-847292",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurologist",
    date: "Sep 28, 2023",
    diagnosis: "Tension Headaches",
    medicines: [
      { name: "Ibuprofen", dosage: "400mg as needed", duration: "10 Days" },
      { name: "Amitriptyline", dosage: "10mg at bedtime", duration: "14 Days" }
    ],
    notes: "Ensure adequate hydration and 7-8 hours of sleep."
  },
  {
    id: "RX-847293",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    date: "Aug 10, 2023",
    diagnosis: "Contact Dermatitis",
    medicines: [
      { name: "Hydrocortisone Cream 1%", dosage: "Apply to affected area twice daily", duration: "7 Days" },
      { name: "Cetirizine", dosage: "10mg, 1 tablet daily", duration: "14 Days" }
    ],
    notes: "Avoid contact with known allergens. Use gentle, fragrance-free soap."
  }
];

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Prescriptions</h1>
          <p className="text-sm text-slate-500">View and download your digital prescriptions.</p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search doctor, medicine..."
            className="pl-9 bg-white border-slate-200 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPrescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>
    </div>
  );
}