"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { customersApi, materialsApi, invoicesApi, settingsApi } from "@/lib/api";
import { Customer, Material } from "@/types";
import { Plus, Trash2, ArrowLeft, Loader2, ArrowRight, X, Ruler } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";
import { invoiceAnimations } from "@/lib/animations";

interface LineItem {
  materialId: number;
  materialName: string;
  rate: number;
  unit: string;
  calculationType: string;
  width: string;
  length: string;
  quantity: string;
  specifications: string;
  calculatedArea: number;
  lineTotal: number;
}

const newLineItem = (): LineItem => ({
  materialId: 0, materialName: "", rate: 0, unit: "", calculationType: "DIMENSION",
  width: "", length: "", quantity: "", specifications: "", calculatedArea: 0, lineTotal: 0,
});

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 15");
  const [items, setItems] = useState<LineItem[]>([newLineItem()]);
  const [discountType, setDiscountType] = useState("FIXED");
  const [discountValue, setDiscountValue] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState("18");
  const [customerNotes, setCustomerNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" });
  const containerRef = usePageAnimation();
  const lineItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      customersApi.getAll(),
      materialsApi.getActive(),
      settingsApi.get(),
    ]).then(([cRes, mRes, sRes]) => {
      setCustomers(cRes.data);
      setMaterials(mRes.data);
      if (sRes.data.defaultTaxRate) setTaxRate(String(sRes.data.defaultTaxRate));
    }).catch(() => {});
  }, []);

  const calculateItem = useCallback((item: LineItem): LineItem => {
    const rate = item.rate || 0;
    if (item.calculationType === "DIMENSION") {
      const w = parseFloat(item.width) || 0;
      const l = parseFloat(item.length) || 0;
      const area = w * l;
      return { ...item, calculatedArea: area, lineTotal: area * rate, quantity: String(area) };
    }
    const qty = parseFloat(item.quantity) || 0;
    return { ...item, calculatedArea: 0, lineTotal: qty * rate };
  }, []);

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = calculateItem({ ...updated[index], ...updates });
      return updated;
    });
    // Flash calculation row
    setTimeout(() => {
      const el = lineItemRefs.current[index];
      if (el) {
        const calcRow = el.querySelector('[data-calc="result"]');
        if (calcRow) {
          gsap.fromTo(calcRow,
            { backgroundColor: 'rgba(212, 160, 23, 0.08)' },
            { backgroundColor: 'transparent', duration: 0.8, ease: 'power2.out' }
          );
        }
      }
    }, 50);
  };

  const selectMaterial = (index: number, materialId: string) => {
    const mat = materials.find((m) => m.id === parseInt(materialId));
    if (!mat) return;
    updateItem(index, {
      materialId: mat.id, materialName: mat.name, rate: mat.rate,
      unit: mat.unit, calculationType: mat.calculationType, specifications: mat.description || "",
    });
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const el = lineItemRefs.current[index];
    if (el) {
      gsap.to(el, {
        opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0,
        duration: 0.4, ease: 'power2.inOut',
        onComplete: () => setItems((prev) => prev.filter((_, i) => i !== index)),
      });
    } else {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addItem = () => {
    setItems([...items, newLineItem()]);
    setTimeout(() => {
      const newIndex = items.length;
      const el = lineItemRefs.current[newIndex];
      if (el) invoiceAnimations.lineItemAdd(el);
    }, 50);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = discountType === "PERCENTAGE"
    ? subtotal * (parseFloat(discountValue) || 0) / 100
    : parseFloat(discountValue) || 0;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = taxEnabled ? taxableAmount * (parseFloat(taxRate) || 0) / 100 : 0;
  const total = taxableAmount + taxAmount;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) { toast.error("Customer name and phone are required"); return; }
    setCreatingCustomer(true);
    try {
      const response = await customersApi.create(newCustomer);
      const created = response.data;
      setCustomers((prev) => [...prev, created]);
      setCustomerId(String(created.id));
      toast.success("Customer created");
      setNewCustomerOpen(false);
      setNewCustomer({ name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" });
    } catch { toast.error("Failed to create customer"); }
    finally { setCreatingCustomer(false); }
  };

  const handleSave = async (status: string = "UNPAID") => {
    if (!customerId) { toast.error("Please select a customer"); return; }
    if (items.every((i) => i.lineTotal === 0)) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      await invoicesApi.create({
        customerId: parseInt(customerId), invoiceDate, dueDate: dueDate || null,
        paymentTerms, discountType, discountValue: parseFloat(discountValue) || 0,
        taxRate: taxEnabled ? parseFloat(taxRate) || 0 : 0, taxEnabled, customerNotes, internalNotes, status,
        items: items.filter((i) => i.materialId).map((i) => ({
          materialId: i.materialId, materialName: i.materialName, rate: i.rate, unit: i.unit,
          width: i.calculationType === "DIMENSION" ? parseFloat(i.width) || null : null,
          length: i.calculationType === "DIMENSION" ? parseFloat(i.length) || null : null,
          quantity: i.calculationType === "QUANTITY" ? parseFloat(i.quantity) || null : null,
          specifications: i.specifications,
        })),
      });
      toast.success("Invoice created successfully!");
      router.push("/invoices");
    } catch { toast.error("Failed to create invoice"); }
    finally { setSaving(false); }
  };

  // Dialog animation
  useEffect(() => {
    if (newCustomerOpen && dialogRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [newCustomerOpen]);

  const activeItems = items.filter(i => i.materialId > 0);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div data-animate="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.back()} style={{
            width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--stone-200)',
            background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--stone-500)',
          }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)' }}>
              Create Invoice
            </h1>
          </div>
        </div>
        <div data-animate="toolbar" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleSave("DRAFT")} disabled={saving} style={{
            height: '42px', padding: '0 20px', borderRadius: '10px', border: '1px solid var(--stone-200)',
            background: '#FFFFFF', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
            color: 'var(--stone-600)', cursor: 'pointer',
          }}>
            Save Draft
          </button>
          <button onClick={() => handleSave("UNPAID")} disabled={saving} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
            {saving && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} />}
            Save Invoice <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* LEFT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Invoice Details */}
          <div data-animate="card" style={{
            background: '#FFFFFF', border: '1px solid var(--stone-200)',
            borderRadius: '14px', padding: '28px',
          }}>
            <div className="section-label" style={{ marginBottom: '20px' }}>Invoice Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div data-animate="field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Customer *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                    className="input-refined" style={{ flex: 1, height: '46px', appearance: 'auto' }}>
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                  <button onClick={() => setNewCustomerOpen(true)} style={{
                    width: '46px', height: '46px', borderRadius: '10px', border: '1px solid var(--stone-200)',
                    background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--stone-500)', flexShrink: 0,
                  }}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>
              </div>
              <div data-animate="field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="input-refined" style={{ height: '46px' }} />
              </div>
              <div data-animate="field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-refined" style={{ height: '46px' }} />
              </div>
              <div data-animate="field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Payment Terms</label>
                <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="input-refined" style={{ height: '46px', appearance: 'auto' }}>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="section-label" style={{ marginBottom: '16px' }}>Line Items</div>
            {items.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => { lineItemRefs.current[idx] = el; }}
                style={{
                  background: '#FFFFFF', border: '1px solid var(--stone-200)',
                  borderRadius: '14px', padding: '24px', marginBottom: '16px', position: 'relative',
                }}
              >
                {/* Item badge */}
                <span style={{
                  position: 'absolute', top: '-10px', left: '20px',
                  background: 'var(--stone-900)', color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                  padding: '2px 10px', borderRadius: '6px',
                }}>
                  Item {idx + 1}
                </span>

                {/* Remove */}
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                    background: 'transparent', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger-500)'; e.currentTarget.style.background = 'var(--danger-50)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--stone-400)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                )}

                {/* Material select */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Material</label>
                  <select value={item.materialId ? String(item.materialId) : ""} onChange={(e) => selectMaterial(idx, e.target.value)}
                    className="input-refined" style={{ height: '46px', appearance: 'auto' }}>
                    <option value="">Select material</option>
                    {materials.map((m) => (
                      <option key={m.id} value={String(m.id)}>{m.name} — ₹{m.rate}/{m.unit}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensions or Quantity */}
                {item.calculationType === "DIMENSION" ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-500)', marginBottom: '4px' }}>Width</label>
                      <input type="number" value={item.width} onChange={(e) => updateItem(idx, { width: e.target.value })} placeholder="0" className="input-refined" style={{ height: '42px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-500)', marginBottom: '4px' }}>Length</label>
                      <input type="number" value={item.length} onChange={(e) => updateItem(idx, { length: e.target.value })} placeholder="0" className="input-refined" style={{ height: '42px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-500)', marginBottom: '4px' }}>Unit</label>
                      <div style={{ height: '42px', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-500)', padding: '0 12px', background: 'var(--stone-50)', borderRadius: '10px', border: '1px solid var(--stone-200)' }}>
                        {item.unit || "—"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '12px', maxWidth: '200px' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-500)', marginBottom: '4px' }}>Quantity</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} placeholder="0" className="input-refined" style={{ height: '42px' }} />
                  </div>
                )}

                {/* Rate */}
                {item.materialId > 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--stone-600)', marginBottom: '12px' }}>
                    Rate: ₹{item.rate}/{item.unit}
                  </div>
                )}

                {/* Calculation result */}
                {item.materialId > 0 && (
                  <div data-calc="result" className="calc-result" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ruler style={{ width: '16px', height: '16px', color: 'var(--stone-400)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--stone-600)' }}>
                        {item.calculationType === "DIMENSION"
                          ? `${item.width || 0} × ${item.length || 0} = ${item.calculatedArea.toFixed(2)} ${item.unit}`
                          : `${item.quantity || 0} ${item.unit}`
                        }
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--stone-900)' }}>
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                )}

                {/* Specifications */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-500)', marginBottom: '4px' }}>Specifications</label>
                  <input value={item.specifications} onChange={(e) => updateItem(idx, { specifications: e.target.value })} placeholder="Additional specifications..." className="input-refined" style={{ height: '42px' }} />
                </div>
              </div>
            ))}

            {/* Add Line Item */}
            <button onClick={addItem} className="btn-add-dashed" data-animate="card">
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Line Item
            </button>
          </div>

          {/* Notes */}
          <div data-animate="card" style={{
            background: '#FFFFFF', border: '1px solid var(--stone-200)',
            borderRadius: '14px', padding: '28px',
          }}>
            <div className="section-label" style={{ marginBottom: '20px' }}>Notes</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Customer Notes</label>
                <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Visible on the invoice PDF" rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Internal Notes</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="For internal use only" rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Cost Summary */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div data-animate="card" style={{
            position: 'sticky', top: '24px',
            background: '#FFFFFF', border: '1px solid var(--stone-200)',
            borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-md)',
          }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--stone-900)' }}>
                Cost Summary
              </span>
              <span style={{
                background: 'var(--primary-100)', color: 'var(--primary-700)',
                fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
                padding: '2px 8px', borderRadius: '6px',
              }}>
                {activeItems.length} item{activeItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Item summaries */}
            {activeItems.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {activeItems.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px 0',
                    borderBottom: idx < activeItems.length - 1 ? '1px solid var(--stone-100)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {item.materialName}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--stone-400)' }}>
                          {item.calculationType === "DIMENSION"
                            ? `${item.calculatedArea.toFixed(1)} ${item.unit}`
                            : `${item.quantity} ${item.unit}`}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500, color: 'var(--stone-800)', flexShrink: 0, marginLeft: '12px' }}>
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--stone-200)', margin: '16px 0' }} />

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 500, color: 'var(--stone-800)' }}>{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Discount</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                  style={{
                    width: '110px', height: '36px', borderRadius: '8px',
                    border: '1px solid var(--stone-200)', fontFamily: 'var(--font-sans)',
                    fontSize: '13px', padding: '0 8px', outline: 'none', appearance: 'auto',
                  }}>
                  <option value="FIXED">Fixed (₹)</option>
                  <option value="PERCENTAGE">Percent (%)</option>
                </select>
                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0"
                  style={{
                    flex: 1, height: '36px', borderRadius: '8px',
                    border: '1px solid var(--stone-200)', fontFamily: 'var(--font-sans)',
                    fontSize: '13px', padding: '0 12px', outline: 'none',
                  }} />
              </div>
              {discountAmount > 0 && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--danger-500)', textAlign: 'right' }}>
                  - {formatCurrency(discountAmount)}
                </div>
              )}
            </div>

            {/* GST */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input type="checkbox" id="taxEnabled" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-950)' }} />
                <label htmlFor="taxEnabled" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', cursor: 'pointer' }}>
                  GST
                </label>
                {taxEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
                      style={{ width: '50px', height: '30px', borderRadius: '6px', border: '1px solid var(--stone-200)', fontFamily: 'var(--font-sans)', fontSize: '13px', padding: '0 8px', textAlign: 'center', outline: 'none' }} />
                    <span style={{ fontSize: '13px', color: 'var(--stone-500)' }}>%</span>
                  </div>
                )}
              </div>
              {taxEnabled && taxAmount > 0 && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--success-600)', textAlign: 'right' }}>
                  + {formatCurrency(taxAmount)}
                </div>
              )}
            </div>

            {/* Final divider */}
            <div style={{ height: '2px', background: 'var(--stone-900)', margin: '16px 0' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700,
                color: 'var(--stone-900)', textTransform: 'uppercase' as const,
                letterSpacing: 'var(--tracking-wider)',
              }}>
                Total
              </span>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700,
                color: 'var(--stone-900)', letterSpacing: '-0.02em',
              }}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* New Customer Dialog */}
      {newCustomerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={overlayRef} onClick={() => setNewCustomerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)' }} />
          <div ref={dialogRef} style={{
            position: 'relative', width: '100%', maxWidth: '520px',
            background: '#FFFFFF', borderRadius: '16px', padding: '32px',
            boxShadow: 'var(--shadow-xl)', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--stone-900)' }}>New Customer</h2>
              <button onClick={() => setNewCustomerOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Name *</label>
                  <input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="ABC Pvt Ltd" className="input-refined" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Phone *</label>
                  <input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+91 98765 43210" className="input-refined" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>Email</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="customer@example.com" className="input-refined" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button onClick={() => setNewCustomerOpen(false)} disabled={creatingCustomer} style={{ height: '42px', padding: '0 20px', borderRadius: '10px', border: '1px solid var(--stone-200)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleCreateCustomer} disabled={creatingCustomer} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
                  {creatingCustomer && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} />}
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}