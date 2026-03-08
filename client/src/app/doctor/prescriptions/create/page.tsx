"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function CreatePrescriptionPage() {
  const [medicines, setMedicines] = useState([
    { id: "m1", name: "", dosage: "", duration: "" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { id: `m${Date.now()}`, name: "", dosage: "", duration: "" }]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const handleGenerate = () => {
    // API Call logic
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Prescription Generated!</h2>
          <p className="text-slate-500">The digital prescription has been successfully saved and sent to the patient.</p>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
              <FileText className="h-4 w-4" /> Preview PDF
            </Button>
            <Button variant="outline" className="w-full border-slate-300" onClick={() => setIsSubmitted(false)}>
              Write Another Prescription
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Prescription</h1>
        <p className="text-sm text-slate-500">Fill in the diagnosis and medical advice for the patient.</p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Details</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Emma Watson</h3>
            <p className="text-sm text-slate-600">Consultation Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center">
             <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</span>
             <p className="text-sm font-bold text-primary mt-0.5">Dr. Sarah Jenkins</p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="diagnosis" className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Diagnosis / Chief Complaint
            </Label>
            <Textarea
              id="diagnosis"
              placeholder="E.g. Viral Fever with mild sore throat"
              className="min-h-[100px] border-slate-200 focus-visible:ring-primary/20 text-base"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-slate-900">Medicines Prescribed</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedicine} className="border-primary/20 text-primary hover:bg-primary/5 gap-1">
                <Plus className="h-4 w-4" /> Add Medicine
              </Button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200 space-y-4">
              {medicines.map((medicine, index) => (
                <div key={medicine.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start relative p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <div className="sm:col-span-5 space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine Name</Label>
                    <Input placeholder="E.g. Paracetamol 500mg" className="border-slate-200" />
                  </div>
                  <div className="sm:col-span-4 space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dosage Instruction</Label>
                    <Input placeholder="E.g. 1-0-1 after meals" className="border-slate-200" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</Label>
                    <Input placeholder="E.g. 5 Days" className="border-slate-200" />
                  </div>
                  <div className="sm:col-span-1 pt-7 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeMedicine(medicine.id)}
                      disabled={medicines.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <Label htmlFor="notes" className="text-base font-semibold text-slate-900">Advice & Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific instructions, diet recommendations, or next visit details..."
              className="min-h-[80px] border-slate-200 focus-visible:ring-primary/20 text-base"
            />
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="outline" className="border-slate-300 w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-base px-8">
            Generate Prescription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}