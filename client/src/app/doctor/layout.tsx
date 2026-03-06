import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar role="doctor" />
      <div className="flex flex-1 container mx-auto px-0 sm:px-6 lg:px-8">
        <Sidebar role="doctor" />
        <main className="flex-1 p-6 sm:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}