"use client";

import React, { useEffect, useState, useRef } from "react";
import { expensesApi } from "@/lib/api";
import { Expense } from "@/types";
import { Plus, Pencil, Trash2, Wallet, Search, TrendingDown, CalendarDays, Receipt, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const categories = ["Electricity", "Transport", "Material Purchase", "Office Expense", "Rent", "Salary", "Maintenance", "Other"];
const emptyExpense = { title: "", category: "Other", amount: "", expenseDate: new Date().toISOString().split("T")[0], paymentMethod: "CASH", description: "" };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyExpense);
  const [search, setSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("ALL");
  const containerRef = usePageAnimation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    try { setExpenses((await expensesApi.getAll()).data); }
    catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) { await expensesApi.update(editing.id, payload); toast.success("Expense updated"); }
      else { await expensesApi.create(payload); toast.success("Expense added"); }
      closeDialog(); loadExpenses();
    } catch { toast.error("Failed to save expense"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    try { await expensesApi.delete(id); toast.success("Expense deleted"); loadExpenses(); }
    catch { toast.error("Failed to delete"); }
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ title: e.title, category: e.category, amount: String(e.amount), expenseDate: e.expenseDate, paymentMethod: e.paymentMethod || "CASH", description: e.description || "" });
    setDialogOpen(true);
  };

  const openDialog = () => { setEditing(null); setForm(emptyExpense); setDialogOpen(true); };
  const closeDialog = () => {
    if (dialogRef.current) {
      gsap.to(dialogRef.current, { opacity: 0, scale: 0.98, y: 10, duration: 0.2, onComplete: () => { setDialogOpen(false); setEditing(null); setForm(emptyExpense); } });
    } else { setDialogOpen(false); setEditing(null); setForm(emptyExpense); }
  };

  useEffect(() => {
    if (dialogOpen && dialogRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [dialogOpen]);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = expenseCategory === "ALL" || e.category === expenseCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const monthlyExpenses = expenses.filter((e) => { const d = new Date(e.expenseDate); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).reduce((s, e) => s + Number(e.amount || 0), 0);
  const weeklyExpenses = expenses.filter((e) => { const d = new Date(e.expenseDate); d.setHours(0, 0, 0, 0); return d >= startOfWeek && d <= today; }).reduce((s, e) => s + Number(e.amount || 0), 0);

  const statCards = [
    { label: "Total Expenses", value: fmt(totalExpenses), sub: "All recorded expenses", iconBg: "var(--danger-50)", iconColor: "var(--danger-500)", Icon: Wallet },
    { label: "This Month", value: fmt(monthlyExpenses), sub: "Current month spending", iconBg: "var(--warning-50)", iconColor: "var(--warning-500)", Icon: CalendarDays },
    { label: "This Week", value: fmt(weeklyExpenses), sub: "Monday to today", iconBg: "var(--info-50)", iconColor: "var(--info-500)", Icon: TrendingDown },
    { label: "Records", value: String(expenses.length), sub: "Total transactions", iconBg: "var(--success-50)", iconColor: "var(--success-500)", Icon: Receipt },
  ];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div data-animate="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>Expenses</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>Track your business expenses</p>
        </div>
        <button onClick={openDialog} className="btn-primary" style={{ height: '42px', padding: '0 20px' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add Expense
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {statCards.map((stat) => (
          <div key={stat.label} data-animate="stat-card" style={{
            padding: '20px', background: '#FFFFFF', border: '1px solid var(--stone-200)',
            borderRadius: '14px', boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--stone-900)' }}>{stat.value}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.Icon style={{ width: '20px', height: '20px', color: stat.iconColor }} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-400)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div data-animate="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {["ALL", ...categories].map((c) => (
            <button key={c} onClick={() => setExpenseCategory(c)} style={{
              height: '34px', padding: '0 14px', borderRadius: '8px',
              border: expenseCategory === c ? 'none' : '1px solid var(--stone-200)',
              background: expenseCategory === c ? 'var(--primary-950)' : '#FFFFFF',
              color: expenseCategory === c ? '#FFFFFF' : 'var(--stone-600)',
              fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap' as const,
            }}>
              {c === "ALL" ? "All" : c}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--stone-400)' }} />
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-refined" style={{ paddingLeft: '40px', height: '42px' }} />
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
            <Wallet style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
            <p>No expenses found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)' }}>
                {['Title', 'Category', 'Date', 'Method', 'Amount', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: h === 'Amount' || h === 'Actions' ? 'right' : 'left',
                    fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
                    textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-500)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} data-animate="table-row" style={{ borderBottom: '1px solid var(--stone-100)', transition: 'background 0.2s' }}
                  onMouseEnter={(ev) => { ev.currentTarget.style.background = 'var(--stone-50)'; }}
                  onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-800)' }}>{e.title}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 500, background: 'var(--stone-100)', color: 'var(--stone-600)' }}>{e.category}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)' }}>{e.expenseDate}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)' }}>{e.paymentMethod?.replace("_", " ")}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--danger-600)' }}>{fmt(e.amount)}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button onClick={() => openEdit(e)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)', transition: 'all 0.2s' }}
                        onMouseEnter={(ev) => { ev.currentTarget.style.background = 'var(--stone-100)'; ev.currentTarget.style.color = 'var(--stone-600)'; }}
                        onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.color = 'var(--stone-400)'; }}
                      ><Pencil style={{ width: '16px', height: '16px' }} /></button>
                      <button onClick={() => handleDelete(e.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)', transition: 'all 0.2s' }}
                        onMouseEnter={(ev) => { ev.currentTarget.style.background = 'var(--danger-50)'; ev.currentTarget.style.color = 'var(--danger-500)'; }}
                        onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.color = 'var(--stone-400)'; }}
                      ><Trash2 style={{ width: '16px', height: '16px' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={overlayRef} onClick={closeDialog} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)' }} />
          <div ref={dialogRef} style={{ position: 'relative', width: '100%', maxWidth: '520px', background: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-xl)', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--stone-900)' }}>{editing ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={closeDialog} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Electricity bill" className="input-refined" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-refined" style={{ appearance: 'auto' }}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="input-refined" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Date</label>
                  <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} className="input-refined" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="input-refined" style={{ appearance: 'auto' }}>
                    {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"].map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button onClick={closeDialog} style={{ height: '42px', padding: '0 20px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>{editing ? "Update" : "Add"} Expense <ArrowRight style={{ width: '16px', height: '16px' }} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
