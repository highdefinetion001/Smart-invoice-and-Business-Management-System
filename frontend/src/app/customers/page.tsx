"use client";

import React, { useEffect, useState, useRef } from "react";
import { customersApi } from "@/lib/api";
import { Customer } from "@/types";
import { Plus, Pencil, Trash2, Users, Search, Eye, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const emptyCustomer = { name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [search, setSearch] = useState("");
  const containerRef = usePageAnimation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try { setCustomers((await customersApi.getAll()).data); }
    catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error("Name and Phone are required"); return; }
    try {
      if (editing) { await customersApi.update(editing.id, form); toast.success("Customer updated"); }
      else { await customersApi.create(form); toast.success("Customer created"); }
      closeDialog(); loadCustomers();
    } catch { toast.error("Failed to save customer"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    try { await customersApi.delete(id); toast.success("Customer deleted"); loadCustomers(); }
    catch { toast.error("Failed to delete customer"); }
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || "", address: c.address || "", gstNumber: c.gstNumber || "", notes: c.notes || "" });
    setDialogOpen(true);
  };

  const openDialog = () => { setEditing(null); setForm(emptyCustomer); setDialogOpen(true); };

  const closeDialog = () => {
    if (dialogRef.current) {
      gsap.to(dialogRef.current, { opacity: 0, scale: 0.98, y: 10, duration: 0.2, onComplete: () => { setDialogOpen(false); setEditing(null); setForm(emptyCustomer); } });
    } else { setDialogOpen(false); setEditing(null); setForm(emptyCustomer); }
  };

  useEffect(() => {
    if (dialogOpen && dialogRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(dialogRef.current.querySelectorAll('[data-animate="dialog-field"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
    }
  }, [dialogOpen]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div data-animate="page-title">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>
          Customers
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>
          Manage your customer directory
        </p>
      </div>

      {/* Toolbar */}
      <div data-animate="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--stone-400)' }} />
          <input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-refined" style={{ paddingLeft: '40px', height: '42px' }} />
        </div>
        <button onClick={openDialog} className="btn-primary" style={{ height: '42px', padding: '0 20px' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add Customer
        </button>
      </div>

      {/* Customer Cards */}
      <div data-animate="table-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '200px', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
            <Users style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
            <p>No customers found</p>
          </div>
        ) : filtered.map((c) => (
          <div
            key={c.id}
            data-animate="customer-card"
            style={{
              background: '#FFFFFF', border: '1px solid var(--stone-200)',
              borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.3s ease', cursor: 'default',
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -2, boxShadow: '0 4px 6px -1px rgba(28,25,23,0.06), 0 2px 4px -2px rgba(28,25,23,0.06)', duration: 0.3, ease: 'power2.out' });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, boxShadow: '0 1px 2px 0 rgba(28,25,23,0.03)', duration: 0.3, ease: 'power2.out' });
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--primary-100)', color: 'var(--primary-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700, flexShrink: 0,
                }}>
                  {getInitials(c.name)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>
                    {c.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)' }}>
                    {c.phone}
                    {c.email && <> • {c.email}</>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => openEdit(c)} style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-100)'; e.currentTarget.style.color = 'var(--stone-600)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--stone-400)'; }}
                >
                  <Pencil style={{ width: '16px', height: '16px' }} />
                </button>
                <button onClick={() => handleDelete(c.id)} style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.color = 'var(--danger-500)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--stone-400)'; }}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>

            {/* Financial row */}
            {c.gstNumber && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--stone-100)', display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--stone-400)', marginBottom: '2px' }}>
                    GST Number
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--stone-600)' }}>
                    {c.gstNumber}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={overlayRef} onClick={closeDialog} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)' }} />
          <div ref={dialogRef} style={{
            position: 'relative', width: '100%', maxWidth: '520px',
            background: '#FFFFFF', borderRadius: '16px', padding: '32px',
            boxShadow: 'var(--shadow-xl)', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--stone-900)' }}>
                {editing ? "Edit Customer" : "Add Customer"}
              </h2>
              <button onClick={closeDialog} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div data-animate="dialog-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Customer Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ABC Pvt Ltd" className="input-refined" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Phone Number *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-refined" />
                </div>
              </div>
              <div data-animate="dialog-field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="customer@example.com" className="input-refined" />
              </div>
              <div data-animate="dialog-field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address..." rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                />
              </div>
              <div data-animate="dialog-field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>GST Number (Optional)</label>
                <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="GSTIN" className="input-refined" />
              </div>

              <div data-animate="dialog-field" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button onClick={closeDialog} style={{ height: '42px', padding: '0 20px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
                  {editing ? "Update" : "Create"} Customer <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
