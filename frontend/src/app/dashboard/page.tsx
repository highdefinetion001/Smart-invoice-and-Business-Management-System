"use client";

import React, { useEffect, useState, useRef } from "react";
import { dashboardApi } from "@/lib/api";
import { DashboardData } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { gsap } from "gsap";
import { counterAnimation } from "@/lib/animations";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const DONUT_COLORS = ["#3D3935", "#D4A017", "#A8A29E", "#B8860B", "#78716C", "#57534E"];

// Fallback data when API is unavailable
const FALLBACK: DashboardData = {
  totalSales: 245000,
  totalPaid: 193000,
  totalPending: 52000,
  totalExpenses: 72500,
  totalInvoices: 48,
  currentMonthSales: 68000,
  monthlySales: [
    { month: "Jan", year: 2026, sales: 32000 },
    { month: "Feb", year: 2026, sales: 45000 },
    { month: "Mar", year: 2026, sales: 38000 },
    { month: "Apr", year: 2026, sales: 52000 },
    { month: "May", year: 2026, sales: 61000 },
    { month: "Jun", year: 2026, sales: 68000 },
  ],
  expensesByCategory: [
    { category: "Materials", amount: 32000 },
    { category: "Labor", amount: 18000 },
    { category: "Transport", amount: 8500 },
    { category: "Utilities", amount: 6000 },
    { category: "Office", amount: 8000 },
  ],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = usePageAnimation();
  const countersAnimated = useRef(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getData();
      setData(res.data);
    } catch {
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  // Animate counters after data loads
  useEffect(() => {
    if (!data || countersAnimated.current) return;
    countersAnimated.current = true;

    const timeout = setTimeout(() => {
      document.querySelectorAll('[data-counter]').forEach((el) => {
        const target = parseFloat(el.getAttribute('data-counter-target') || '0');
        const isCurrency = el.getAttribute('data-counter-currency') === 'true';
        if (isCurrency) {
          counterAnimation.currencyCountUp(el as HTMLElement, target);
        } else {
          counterAnimation.countUp(el as HTMLElement, target);
        }
      });

      // Badge pop in
      gsap.fromTo(
        '[data-animate="badge"]',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.4)', delay: 0.2 }
      );
    }, 600);

    return () => clearTimeout(timeout);
  }, [data]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--stone-200)',
          borderTopColor: 'var(--primary-950)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const d = data || FALLBACK;

  const stats = [
    {
      label: "Total Sales",
      value: d.totalSales,
      change: "+12.5%",
      positive: true,
      iconBg: "var(--accent-50)",
      iconColor: "var(--accent-500)",
      Icon: TrendingUp,
    },
    {
      label: "Pending Amount",
      value: d.totalPending,
      change: "-8.2%",
      positive: false,
      iconBg: "var(--warning-50)",
      iconColor: "var(--warning-500)",
      Icon: Clock,
    },
    {
      label: "Paid Amount",
      value: d.totalPaid,
      change: "+15.3%",
      positive: true,
      iconBg: "var(--success-50)",
      iconColor: "var(--success-500)",
      Icon: IndianRupee,
    },
    {
      label: "Expenses",
      value: d.totalExpenses,
      change: "+3.1%",
      positive: true,
      iconBg: "var(--info-50)",
      iconColor: "var(--info-500)",
      Icon: Wallet,
    },
  ];

  const recentInvoices = [
    { id: "INV-048", customer: "ABC Pvt Ltd", amount: 12500, status: "Paid" },
    { id: "INV-047", customer: "XYZ Enterprises", amount: 8500, status: "Partial" },
    { id: "INV-046", customer: "PQR Industries", amount: 15200, status: "Pending" },
    { id: "INV-045", customer: "DEF Corp", amount: 6800, status: "Paid" },
    { id: "INV-044", customer: "GHI Ltd", amount: 22000, status: "Paid" },
  ];

  const paymentOverview = [
    { label: "Paid", value: 78, color: "var(--success-500)" },
    { label: "Partial", value: 14, color: "var(--warning-500)" },
    { label: "Pending", value: 8, color: "var(--danger-400)" },
  ];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div data-animate="page-title" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--stone-900)',
            marginBottom: '4px',
          }}>
            Dashboard
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--stone-400)',
          }}>
            Your business overview at a glance
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid var(--stone-200)',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--stone-500)',
          }}>
            <Bell style={{ width: '18px', height: '18px' }} />
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px 6px',
            borderRadius: '10px',
            border: '1px solid var(--stone-200)',
            background: '#FFFFFF',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User style={{ width: '16px', height: '16px', color: 'var(--primary-700)' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--stone-700)' }}>Admin</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-animate="stat-card"
            style={{
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid var(--stone-200)',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'default',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                y: -4,
                boxShadow: '0 20px 25px -5px rgba(28, 25, 23, 0.08), 0 8px 10px -6px rgba(28, 25, 23, 0.06)',
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                boxShadow: '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.06)',
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
          >
            {/* Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: stat.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <stat.Icon style={{ width: '20px', height: '20px', color: stat.iconColor }} />
            </div>

            {/* Label */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--stone-500)',
              marginBottom: '4px',
            }}>
              {stat.label}
            </div>

            {/* Value */}
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--stone-900)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              <span
                data-counter
                data-counter-target={stat.value}
                data-counter-currency="true"
              >
                ₹0
              </span>
            </div>

            {/* Change badge */}
            <div
              data-animate="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                background: stat.positive ? 'var(--success-50)' : 'var(--danger-50)',
                color: stat.positive ? 'var(--success-600)' : 'var(--danger-600)',
              }}
            >
              {stat.positive ? (
                <ArrowUpRight style={{ width: '12px', height: '12px' }} />
              ) : (
                <ArrowDownRight style={{ width: '12px', height: '12px' }} />
              )}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        {/* Sales Chart */}
        <div
          data-animate="chart-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid var(--stone-200)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--stone-800)',
              marginBottom: '4px',
            }}>
              Monthly Sales
            </h3>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--stone-400)',
            }}>
              Revenue trends over the last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={d.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--stone-400)' }} stroke="var(--stone-200)" />
              <YAxis tick={{ fontSize: 12, fill: 'var(--stone-400)' }} stroke="var(--stone-200)" />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid var(--stone-200)',
                  boxShadow: 'var(--shadow-md)',
                  fontFamily: 'var(--font-sans)',
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
              />
              <Bar dataKey="sales" fill="var(--primary-800)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Invoices */}
        <div
          data-animate="chart-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid var(--stone-200)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--stone-800)',
            marginBottom: '20px',
          }}>
            Recent Invoices
          </h3>
          <div>
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--stone-100)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--stone-600)',
                    marginBottom: '2px',
                  }}>
                    {inv.id}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--stone-800)',
                  }}>
                    {inv.customer}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--stone-900)',
                    marginBottom: '2px',
                  }}>
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    color: inv.status === 'Paid'
                      ? 'var(--success-600)'
                      : inv.status === 'Partial'
                        ? 'var(--warning-600)'
                        : 'var(--danger-500)',
                  }}>
                    <span className={`status-dot status-dot--${inv.status.toLowerCase()}`} />
                    {inv.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Expenses Donut */}
        <div
          data-animate="chart-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid var(--stone-200)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--stone-800)',
            marginBottom: '4px',
          }}>
            Expenses by Category
          </h3>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--stone-400)',
            marginBottom: '16px',
          }}>
            Distribution of business expenses
          </p>
          {d.expensesByCategory && d.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={d.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="amount"
                  nameKey="category"
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {d.expensesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid var(--stone-200)',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--stone-400)',
              fontSize: '14px',
            }}>
              No expense data yet
            </div>
          )}
        </div>

        {/* Payment Overview */}
        <div
          data-animate="chart-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid var(--stone-200)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--stone-800)',
            marginBottom: '4px',
          }}>
            Payment Overview
          </h3>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--stone-400)',
            marginBottom: '32px',
          }}>
            Invoice payment status breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {paymentOverview.map((item) => (
              <div key={item.label}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                }}>
                  <span style={{ color: 'var(--stone-600)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: 'var(--stone-800)', fontWeight: 600 }}>{item.value}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--stone-100)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${item.value}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: '4px',
                    transition: 'width 1s ease-out',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
