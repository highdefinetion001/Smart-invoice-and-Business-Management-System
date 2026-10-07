"use client";

import React, { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { usePageAnimation } from "@/hooks/usePageAnimation";

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = usePageAnimation();

  useEffect(() => {
    dashboardApi.getData().then((res) => setData(res.data)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const netAmount = (data?.totalSales || 0) - (data?.totalExpenses || 0);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div data-animate="page-title">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>Reports</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>Business summary and analytics</p>
      </div>

      {/* Business Summary */}
      <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>Business Summary</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '15px' }}>
            <span style={{ color: 'var(--stone-500)' }}>Total Sales</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--success-600)' }}>{fmt(data?.totalSales || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '15px' }}>
            <span style={{ color: 'var(--stone-500)' }}>Total Expenses</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--danger-600)' }}>- {fmt(data?.totalExpenses || 0)}</span>
          </div>
          <div style={{ height: '2px', background: 'var(--stone-200)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: 'var(--stone-900)' }}>Net Business Amount</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: netAmount >= 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>{fmt(netAmount)}</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Sales Report */}
        <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px' }}>
          <div className="section-label" style={{ marginBottom: '20px' }}>Sales Report</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Total Sales', value: fmt(data?.totalSales || 0), color: 'var(--stone-900)' },
              { label: 'Total Invoices', value: String(data?.totalInvoices || 0), color: 'var(--stone-900)' },
              { label: 'Paid Amount', value: fmt(data?.totalPaid || 0), color: 'var(--success-600)' },
              { label: 'Pending Amount', value: fmt(data?.totalPending || 0), color: 'var(--warning-600)' },
              { label: 'This Month', value: fmt(data?.currentMonthSales || 0), color: 'var(--primary-700)' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <span style={{ color: 'var(--stone-500)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Report */}
        <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px' }}>
          <div className="section-label" style={{ marginBottom: '20px' }}>Expense Report</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              <span style={{ color: 'var(--stone-500)' }}>Total Expenses</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--danger-600)' }}>{fmt(data?.totalExpenses || 0)}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--stone-100)' }} />
            {data?.expensesByCategory?.map((ec, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <span style={{ color: 'var(--stone-500)' }}>{ec.category}</span>
                <span style={{ fontWeight: 500, color: 'var(--stone-800)' }}>{fmt(ec.amount)}</span>
              </div>
            ))}
            {(!data?.expensesByCategory || data.expensesByCategory.length === 0) && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>No expense categories yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div data-animate="chart-panel" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>Monthly Sales Trend</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.monthlySales || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-100)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--stone-400)' }} stroke="var(--stone-200)" />
            <YAxis tick={{ fontSize: 12, fill: 'var(--stone-400)' }} stroke="var(--stone-200)" />
            <Tooltip
              formatter={(v) => [fmt(Number(v)), "Sales"]}
              contentStyle={{ borderRadius: '10px', border: '1px solid var(--stone-200)', fontFamily: 'var(--font-sans)' }}
            />
            <Bar dataKey="sales" fill="var(--primary-800)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
