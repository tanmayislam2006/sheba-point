"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Activity,
  Bell,
  User,
  LogOut,
  Users,
  CreditCard,
  Settings,
  Pill,
  BriefcaseMedical
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const patientItems: SidebarItem[] = [
  { title: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { title: "My Appointments", href: "/patient/appointments", icon: CalendarDays },
  { title: "My Prescriptions", href: "/patient/prescriptions", icon: Pill },
  { title: "Medical Reports", href: "/patient/reports", icon: FileText },
  { title: "Notifications", href: "/patient/notifications", icon: Bell },
  { title: "Profile", href: "/patient/profile", icon: User },
];

const doctorItems: SidebarItem[] = [
  { title: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { title: "My Schedule", href: "/doctor/schedule", icon: Activity },
  { title: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
  { title: "Patients", href: "/doctor/patients", icon: Users },
  { title: "Prescriptions", href: "/doctor/prescriptions", icon: Pill },
  { title: "Notifications", href: "/doctor/notifications", icon: Bell },
  { title: "Profile", href: "/doctor/profile", icon: User },
];

const adminItems: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Doctors", href: "/admin/doctors", icon: BriefcaseMedical },
  { title: "Patients", href: "/admin/patients", icon: User },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Specialties", href: "/admin/specialties", icon: FileText },
  { title: "Reports", href: "/admin/reports", icon: Activity },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ role }: { role: "patient" | "doctor" | "admin" }) {
  const pathname = usePathname();

  const items = role === "patient" ? patientItems : role === "doctor" ? doctorItems : adminItems;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 shrink-0 py-6 px-4">
      <div className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-4 font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-slate-500")} />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="pt-4 border-t border-slate-200 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
