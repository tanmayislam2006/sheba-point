import { FileText, Download, Calendar, Pill } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Prescription {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; duration: string }[];
  notes?: string;
}

export function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary/10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${prescription.doctorName}`} />
            <AvatarFallback className="text-primary font-semibold">{prescription.doctorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-slate-900 leading-none">{prescription.doctorName}</h4>
            <p className="text-sm text-slate-500 mt-1">{prescription.specialty}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {prescription.date}
          </span>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            #{prescription.id}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" /> Diagnosis
          </h5>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {prescription.diagnosis}
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-secondary" /> Medicines
          </h5>
          <div className="space-y-2">
            {prescription.medicines.map((med, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-white border border-slate-100 shadow-sm">
                <div>
                  <span className="font-medium text-slate-800">{med.name}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{med.dosage}</p>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                  {med.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes && (
          <div>
             <h5 className="text-sm font-semibold text-slate-700 mb-1">Advice/Notes</h5>
             <p className="text-sm text-slate-500 italic">"{prescription.notes}"</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t border-slate-100 flex gap-3">
        <Button variant="outline" className="flex-1 border-primary/20 text-primary hover:bg-primary/5">
           View Full Details
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}