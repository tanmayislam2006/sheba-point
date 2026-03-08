"use client";

import { DashboardWidget } from "@/components/shared/DashboardWidget";
import { Users, User, CalendarDays, DollarSign, Activity, BriefcaseMedical, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const recentTransactions = [
  { id: "TX1294", patient: "Emma Watson", doctor: "Dr. Sarah Jenkins", amount: 150, status: "completed", date: "Today, 10:30 AM" },
  { id: "TX1295", patient: "John Doe", doctor: "Dr. Michael Chen", amount: 200, status: "completed", date: "Today, 11:15 AM" },
  { id: "TX1296", patient: "Michael Smith", doctor: "Dr. Emily Rodriguez", amount: 120, status: "pending", date: "Today, 01:00 PM" },
  { id: "TX1297", patient: "Sarah Lee", doctor: "Dr. James Wilson", amount: 100, status: "completed", date: "Yesterday, 04:45 PM" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Overview</h1>
        <p className="mt-2 text-lg text-slate-500">System metrics and platform activity summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Total Users"
          value="24,593"
          icon={Users}
          iconColor="primary"
          trend={{ value: 12.5, isPositive: true }}
        />
        <DashboardWidget
          title="Total Doctors"
          value="1,245"
          icon={BriefcaseMedical}
          iconColor="secondary"
          trend={{ value: 4.2, isPositive: true }}
        />
        <DashboardWidget
          title="Today's Appointments"
          value="842"
          icon={CalendarDays}
          iconColor="amber"
          trend={{ value: 2.1, isPositive: false }}
        />
        <DashboardWidget
          title="Total Revenue"
          value="$124,500"
          icon={DollarSign}
          iconColor="purple"
          trend={{ value: 18.4, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Revenue Analytics</CardTitle>
            <div className="flex gap-2">
               <Badge variant="outline" className="bg-slate-50 cursor-pointer">Daily</Badge>
               <Badge className="bg-primary hover:bg-primary/90 cursor-pointer text-white">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 m-6">
             <div className="text-center">
                <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Chart Component Placeholder</p>
                <p className="text-xs text-slate-400 mt-1">Integrate Recharts or Chart.js here</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Appointments Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 m-6">
             <div className="text-center">
                <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Bar Chart Placeholder</p>
                <p className="text-xs text-slate-400 mt-1">Appointments per day distribution</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 pl-6">Transaction ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Patient</TableHead>
                <TableHead className="font-semibold text-slate-700">Doctor</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50">
                  <TableCell className="pl-6 font-medium text-slate-900">{tx.id}</TableCell>
                  <TableCell className="text-slate-600">{tx.patient}</TableCell>
                  <TableCell className="text-slate-600">{tx.doctor}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{tx.date}</TableCell>
                  <TableCell className="font-semibold text-slate-900">${tx.amount}</TableCell>
                  <TableCell className="pr-6">
                    {tx.status === "completed" ? (
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 font-medium">Completed</Badge>
                    ) : (
                       <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-medium">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}