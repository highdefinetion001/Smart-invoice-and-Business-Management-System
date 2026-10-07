"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { invoicesApi, paymentsApi } from "@/lib/api";
import { Invoice, Payment } from "@/types";
import { ArrowLeft, IndianRupee, Trash2, Download, X } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  PAID: { dot: 'var(--success-500)', text: 'var(--success-700)', bg: 'var(--success-50)' },
  PARTIAL: { dot: 'var(--warning-500)', text: 'var(--warning-600)', bg: 'var(--warning-50)' },
  UNPAID: { dot: 'var(--danger-400)', text: 'var(--danger-600)', bg: 'var(--danger-50)' },
  DRAFT: { dot: 'var(--stone-400)', text: 'var(--stone-600)', bg: 'var(--stone-100)' },
  CANCELLED: { dot: 'var(--stone-400)', text: 'var(--stone-500)', bg: 'var(--stone-100)' },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const containerRef = usePageAnimation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (id) loadInvoice(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInvoice = async () => {
    try {
      const [invRes, payRes] = await Promise.all([invoicesApi.getById(Number(id)), paymentsApi.getByInvoice(Number(id))]);
      setInvoice(invRes.data); setPayments(payRes.data);
    } catch { toast.error("Failed to load invoice"); }
    finally { setLoading(false); }
  };

  const handleRecordPayment = async () => {
    try {
      await paymentsApi.record(Number(id), { amount: parseFloat(payAmount), paymentDate: payDate, paymentMethod: payMethod });
      toast.success("Payment recorded"); setPayDialogOpen(false); setPayAmount(""); loadInvoice();
    } catch { toast.error("Failed to record payment"); }
  };

  const handleDelete = async () => {
    if (!confirm("Cancel this invoice?")) return;
    try { await invoicesApi.delete(Number(id)); toast.success("Invoice cancelled"); router.push("/invoices"); }
    catch { toast.error("Failed to cancel"); }
  };

  useEffect(() => {
    if (payDialogOpen && dialogRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [payDialogOpen]);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  if (!invoice) return <div style={{ textAlign: 'center', color: 'var(--stone-400)', padding: '40px' }}>Invoice not found</div>;

  const outstanding = invoice.totalAmount - invoice.paidAmount;
  const sc = statusConfig[invoice.status] || statusConfig.DRAFT;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div data-animate="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.back()} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-500)' }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--stone-900)' }}>{invoice.invoiceNumber}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 600, background: sc.bg, color: sc.text }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot }} />
                {invoice.status}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)', marginTop: '2px' }}>{invoice.customer?.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <button onClick={() => setPayDialogOpen(true)} className="btn-primary" style={{ height: '42px', padding: '0 20px', background: 'var(--success-600)' }}>
              <IndianRupee style={{ width: '16px', height: '16px' }} /> Record Payment
            </button>
          )}
          <a href={invoicesApi.getPdfUrl(invoice.id)} target="_blank" rel="noopener noreferrer">
            <button style={{ height: '42px', padding: '0 20px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: '#FFFFFF', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download style={{ width: '16px', height: '16px' }} /> Download PDF
            </button>
          </a>
          {invoice.status !== "CANCELLED" && (
            <button onClick={handleDelete} style={{ height: '42px', padding: '0 16px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--danger-500)' }}>
              <Trash2 style={{ width: '16px', height: '16px' }} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Line Items Table */}
          <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--stone-200)' }}>
              <div className="section-label">Line Items</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)' }}>
                  {['Material', 'Dimensions / Qty', 'Rate', 'Amount'].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Amount' ? 'right' : 'left', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-500)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--stone-100)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-800)' }}>{item.materialName}</div>
                      {item.specifications && <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-400)', marginTop: '2px' }}>{item.specifications}</div>}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--stone-600)' }}>
                      {item.width && item.length ? `${item.width} × ${item.length} = ${item.calculatedArea} ${item.unit}` : `${item.quantity} ${item.unit}`}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--stone-600)' }}>₹{item.rate}/{item.unit}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--stone-900)' }}>{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--stone-200)' }}>
              <div className="section-label">Payment History</div>
            </div>
            {payments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>No payments recorded yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)' }}>
                    {['Date', 'Method', 'Reference', 'Amount'].map((h) => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Amount' ? 'right' : 'left', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-500)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--stone-100)' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)' }}>{p.paymentDate}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 500, background: 'var(--stone-100)', color: 'var(--stone-600)' }}>{p.paymentMethod?.replace("_", " ")}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-400)' }}>{p.reference || "—"}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--success-600)' }}>{fmt(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Summary */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div data-animate="card" style={{ position: 'sticky', top: '24px', background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
            <div className="section-label" style={{ marginBottom: '20px' }}>Invoice Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <span style={{ color: 'var(--stone-500)' }}>Subtotal</span><span style={{ fontWeight: 500 }}>{fmt(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--danger-500)' }}>
                  <span>Discount ({invoice.discountType === "PERCENTAGE" ? `${invoice.discountValue}%` : "Fixed"})</span><span>- {fmt(invoice.discountAmount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--success-600)' }}>
                  <span>GST {invoice.taxRate}%</span><span>+ {fmt(invoice.taxAmount)}</span>
                </div>
              )}
              <div style={{ height: '2px', background: 'var(--stone-900)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700, color: 'var(--stone-900)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, color: 'var(--stone-900)' }}>{fmt(invoice.totalAmount)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--stone-200)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <span style={{ color: 'var(--stone-500)' }}>Paid</span><span style={{ fontWeight: 600, color: 'var(--success-600)' }}>{fmt(invoice.paidAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700 }}>
                <span style={{ color: 'var(--stone-900)' }}>Outstanding</span><span style={{ color: 'var(--danger-600)' }}>{fmt(outstanding)}</span>
              </div>
            </div>
            {invoice.customerNotes && (
              <>
                <div style={{ height: '1px', background: 'var(--stone-200)', margin: '16px 0' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-400)', marginBottom: '4px' }}>Customer Notes</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)' }}>{invoice.customerNotes}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      {payDialogOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={overlayRef} onClick={() => setPayDialogOpen(false)} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)' }} />
          <div ref={dialogRef} style={{ position: 'relative', width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-xl)', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--stone-900)' }}>Record Payment</h2>
              <button onClick={() => setPayDialogOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            {/* Summary */}
            <div style={{ background: 'var(--stone-50)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--stone-500)' }}>Invoice Amount</span><span style={{ fontWeight: 600 }}>{fmt(invoice.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--stone-500)' }}>Paid</span><span style={{ color: 'var(--success-600)' }}>{fmt(invoice.paidAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700 }}>
                <span>Outstanding</span><span style={{ color: 'var(--danger-600)' }}>{fmt(outstanding)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Payment Amount (₹)</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={String(outstanding)} className="input-refined" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Method</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="input-refined" style={{ appearance: 'auto' }}>
                    {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"].map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Date</label>
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="input-refined" />
                </div>
              </div>
              <button onClick={handleRecordPayment} className="btn-primary" style={{ width: '100%', height: '46px', background: 'var(--success-600)' }}>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
