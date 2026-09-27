"use client";

import React, { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { DashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getData().then((res) => setData(res.data)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;

  const netAmount = (data?.totalSales || 0) - (data?.totalExpenses || 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Business summary and analytics</p></div>

      {/* Business Summary */}
      <Card className="border-border shadow-lg">
        <CardHeader><CardTitle className="text-base">Business Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Sales</span><span className="font-semibold text-emerald-600">{fmt(data?.totalSales || 0)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Expenses</span><span className="font-semibold text-rose-600">- {fmt(data?.totalExpenses || 0)}</span></div>
          <Separator />
          <div className="flex justify-between text-lg font-bold"><span>Net Business Amount</span><span className={netAmount >= 0 ? "text-emerald-600" : "text-red-600"}>{fmt(netAmount)}</span></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Report */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Sales Report</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Total Sales</span><span className="font-semibold">{fmt(data?.totalSales || 0)}</span></div>
            <div className="flex justify-between"><span>Total Invoices</span><span className="font-semibold">{data?.totalInvoices || 0}</span></div>
            <div className="flex justify-between"><span>Paid Amount</span><span className="font-semibold text-emerald-600">{fmt(data?.totalPaid || 0)}</span></div>
            <div className="flex justify-between"><span>Pending Amount</span><span className="font-semibold text-amber-600">{fmt(data?.totalPending || 0)}</span></div>
            <div className="flex justify-between"><span>This Month</span><span className="font-semibold text-primary">{fmt(data?.currentMonthSales || 0)}</span></div>
          </CardContent>
        </Card>

        {/* Expense Report */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Expense Report</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Total Expenses</span><span className="font-semibold text-rose-600">{fmt(data?.totalExpenses || 0)}</span></div>
            <Separator />
            {data?.expensesByCategory?.map((ec, i) => (
              <div key={i} className="flex justify-between"><span className="text-muted-foreground">{ec.category}</span><span>{fmt(ec.amount)}</span></div>
            ))}
            {(!data?.expensesByCategory || data.expensesByCategory.length === 0) && <p className="text-muted-foreground">No expense categories yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Monthly Sales Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => String(fmt(Number(v)))} />
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
