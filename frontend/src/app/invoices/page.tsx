"use client";

import React, { useEffect, useState } from "react";
import { invoicesApi } from "@/lib/api";
import { Invoice } from "@/types";
import { Plus, Search, FileText, Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  PAID: { dot: 'var(--success-500)', text: 'var(--success-700)', bg: 'var(--success-50)' },
  PARTIAL: { dot: 'var(--warning-500)', text: 'var(--warning-600)', bg: 'var(--warning-50)' },
  UNPAID: { dot: 'var(--danger-400)', text: 'var(--danger-600)', bg: 'var(--danger-50)' },
  DRAFT: { dot: 'var(--stone-400)', text: 'var(--stone-600)', bg: 'var(--stone-100)' },
  CANCELLED: { dot: 'var(--stone-400)', text: 'var(--stone-500)', bg: 'var(--stone-100)' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const router = useRouter();
  const containerRef = usePageAnimation();

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try { setInvoices((await invoicesApi.getAll()).data); }
    catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = ["ALL", "UNPAID", "PARTIAL", "PAID", "DRAFT", "CANCELLED"];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div data-animate="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>
            Invoices
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>
            Create and manage your invoices
          </p>
        </div>
        <button onClick={() => router.push("/invoices/new")} className="btn-primary" style={{ height: '42px', padding: '0 20px' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div data-animate="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '8px',
                border: filter === s ? 'none' : '1px solid var(--stone-200)',
                background: filter === s ? 'var(--primary-950)' : '#FFFFFF',
                color: filter === s ? '#FFFFFF' : 'var(--stone-600)',
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--stone-400)' }} />
          <input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-refined" style={{ paddingLeft: '40px', height: '42px' }} />
        </div>
      </div>

      {/* Table */}
      <div data-animate="table-container" style={{
        background: '#FFFFFF', border: '1px solid var(--stone-200)',
        borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
      }}>
        {loading ? (
          <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '200px', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
            <FileText style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
            <p>No invoices found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)' }}>
                {['Invoice', 'Customer', 'Date', 'Amount', 'Paid', 'Due', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: h === 'Actions' ? 'right' : 'left',
                    fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
                    textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)',
                    color: 'var(--stone-500)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const sc = statusConfig[inv.status] || statusConfig.DRAFT;
                return (
                  <tr
                    key={inv.id}
                    data-animate="table-row"
                    style={{ borderBottom: '1px solid var(--stone-100)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-50)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--stone-600)' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-800)' }}>
                      {inv.customer?.name || "—"}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)' }}>
                      {inv.invoiceDate}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--stone-900)' }}>
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--success-600)' }}>
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--danger-600)' }}>
                      {formatCurrency(inv.totalAmount - inv.paidAmount)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        fontFamily: 'var(--font-sans)', fontWeight: 500,
                        background: sc.bg, color: sc.text,
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot }} />
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <Link href={`/invoices/${inv.id}`} onClick={(e) => e.stopPropagation()}>
                          <button style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
                          }}>
                            <Eye style={{ width: '16px', height: '16px' }} />
                          </button>
                        </Link>
                        <a href={invoicesApi.getPdfUrl(inv.id)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <button style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
                          }}>
                            <Download style={{ width: '16px', height: '16px' }} />
                          </button>
                        </a>
                      </div>
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
