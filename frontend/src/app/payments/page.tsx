"use client";

import React, { useEffect, useState } from "react";
import { invoicesApi } from "@/lib/api";
import { Invoice } from "@/types";
import { toast } from "sonner";
import { Receipt, IndianRupee, Clock } from "lucide-react";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  PAID: { dot: 'var(--success-500)', text: 'var(--success-700)', bg: 'var(--success-50)' },
  PARTIAL: { dot: 'var(--warning-500)', text: 'var(--warning-600)', bg: 'var(--warning-50)' },
  UNPAID: { dot: 'var(--danger-400)', text: 'var(--danger-600)', bg: 'var(--danger-50)' },
  DRAFT: { dot: 'var(--stone-400)', text: 'var(--stone-600)', bg: 'var(--stone-100)' },
};

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = usePageAnimation();

  useEffect(() => {
    invoicesApi.getAll().then((res) => {
      setInvoices(res.data.filter((i: Invoice) => i.status !== "CANCELLED"));
      setLoading(false);
    }).catch(() => { toast.error("Failed to load"); setLoading(false); });
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
  const totalReceived = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalPending = invoices.reduce((s, i) => s + ((i.totalAmount || 0) - (i.paidAmount || 0)), 0);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div data-animate="page-title">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>Payments</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>Track all invoice payments</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div data-animate="stat-card" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px' }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -3, boxShadow: 'var(--shadow-md)', duration: 0.3, ease: 'power2.out' })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, boxShadow: 'none', duration: 0.3, ease: 'power2.out' })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee style={{ width: '24px', height: '24px', color: 'var(--success-500)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)', marginBottom: '4px' }}>Total Received</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: 'var(--success-600)' }}>{fmt(totalReceived)}</div>
            </div>
          </div>
        </div>
        <div data-animate="stat-card" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px' }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -3, boxShadow: 'var(--shadow-md)', duration: 0.3, ease: 'power2.out' })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, boxShadow: 'none', duration: 0.3, ease: 'power2.out' })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '24px', height: '24px', color: 'var(--danger-500)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)', marginBottom: '4px' }}>Total Pending</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: 'var(--danger-600)' }}>{fmt(totalPending)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div data-animate="table-container" style={{
        background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px',
        overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--stone-200)' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--stone-800)' }}>Payment Status by Invoice</h3>
        </div>
        {loading ? (
          <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '200px', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
            <Receipt style={{ width: '40px', height: '40px', marginBottom: '8px' }} /><p>No invoices</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)' }}>
                {['Invoice', 'Customer', 'Total', 'Paid', 'Pending', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-500)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => {
                const sc = statusConfig[i.status] || statusConfig.DRAFT;
                return (
                  <tr key={i.id} data-animate="table-row" style={{ borderBottom: '1px solid var(--stone-100)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-50)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--stone-600)' }}>{i.invoiceNumber}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-800)' }}>{i.customer?.name}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--stone-900)' }}>{fmt(i.totalAmount)}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--success-600)' }}>{fmt(i.paidAmount)}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--danger-600)' }}>{fmt(i.totalAmount - i.paidAmount)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 500, background: sc.bg, color: sc.text }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot }} />
                        {i.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
