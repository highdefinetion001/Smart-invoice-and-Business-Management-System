"use client";

import React, { useEffect, useState, useRef } from "react";
import { materialsApi } from "@/lib/api";
import { Material } from "@/types";
import { Plus, Pencil, Trash2, Package, Search, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";

const emptyMaterial = { name: "", code: "", rate: "", unit: "sq.ft", calculationType: "DIMENSION", description: "" };

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyMaterial);
  const [search, setSearch] = useState("");
  const containerRef = usePageAnimation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try {
      const res = await materialsApi.getAll();
      setMaterials(res.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, rate: parseFloat(form.rate), isActive: true };
      if (editing) {
        await materialsApi.update(editing.id, payload);
        toast.success("Material updated");
      } else {
        await materialsApi.create(payload);
        toast.success("Material created");
      }
      closeDialog();
      loadMaterials();
    } catch { toast.error("Failed to save material"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this material?")) return;
    try {
      await materialsApi.delete(id);
      toast.success("Material deleted");
      loadMaterials();
    } catch { toast.error("Failed to delete material"); }
  };

  const openEdit = (m: Material) => {
    setEditing(m);
    setForm({ name: m.name, code: m.code, rate: String(m.rate), unit: m.unit, calculationType: m.calculationType, description: m.description || "" });
    setDialogOpen(true);
  };

  const openDialog = () => {
    setEditing(null);
    setForm(emptyMaterial);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      gsap.to(dialogRef.current, {
        opacity: 0, scale: 0.98, y: 10, duration: 0.2,
        onComplete: () => { setDialogOpen(false); setEditing(null); setForm(emptyMaterial); }
      });
    } else {
      setDialogOpen(false); setEditing(null); setForm(emptyMaterial);
    }
  };

  // Animate dialog open
  useEffect(() => {
    if (dialogOpen && dialogRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(dialogRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(
        dialogRef.current.querySelectorAll('[data-animate="dialog-field"]'),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [dialogOpen]);

  const filtered = materials.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div data-animate="page-title">
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600,
          color: 'var(--stone-900)', marginBottom: '4px',
        }}>Materials</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>
          Manage your material catalog and pricing
        </p>
      </div>

      {/* Toolbar */}
      <div data-animate="toolbar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            width: '16px', height: '16px', color: 'var(--stone-400)',
          }} />
          <input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-refined"
            style={{ paddingLeft: '40px', height: '42px' }}
          />
        </div>
        <button onClick={openDialog} className="btn-primary" style={{ height: '42px', padding: '0 20px' }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          Add Material
        </button>
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
            <Package style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
            <p>No materials found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--stone-50)', borderBottom: '1px solid var(--stone-200)',
              }}>
                {['Material', 'Code', 'Rate', 'Unit', 'Status', 'Actions'].map((h) => (
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
              {filtered.map((m, idx) => (
                <tr
                  key={m.id}
                  data-animate="table-row"
                  style={{
                    borderBottom: '1px solid var(--stone-100)',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: 'var(--stone-900)' }}>{m.name}</div>
                    {m.description && (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-400)', marginTop: '2px' }}>{m.description}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--stone-600)' }}>
                    {m.code}
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: 'var(--stone-900)' }}>
                    ₹{m.rate}
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--stone-500)' }}>
                    {m.unit}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                      fontFamily: 'var(--font-sans)', fontWeight: 500,
                      background: m.isActive ? 'var(--success-50)' : 'var(--stone-100)',
                      color: m.isActive ? 'var(--success-700)' : 'var(--stone-500)',
                    }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: m.isActive ? 'var(--success-500)' : 'var(--stone-400)',
                      }} />
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button
                        onClick={() => openEdit(m)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--stone-400)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-100)'; e.currentTarget.style.color = 'var(--stone-600)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--stone-400)'; }}
                      >
                        <Pencil style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--stone-400)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.color = 'var(--danger-500)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--stone-400)'; }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
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
          <div ref={overlayRef} onClick={closeDialog}
            style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)' }} />
          <div ref={dialogRef} style={{
            position: 'relative', width: '100%', maxWidth: '520px',
            background: '#FFFFFF', borderRadius: '16px', padding: '32px',
            boxShadow: 'var(--shadow-xl)', zIndex: 1,
          }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--stone-900)' }}>
                {editing ? "Edit Material" : "Add New Material"}
              </h2>
              <button onClick={closeDialog} style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--stone-400)',
              }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div data-animate="dialog-field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                  Material Name *
                </label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Acrylic Sheet" className="input-refined" />
              </div>

              <div data-animate="dialog-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                    Material Code *
                  </label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="ACR-001" className="input-refined" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                    Rate *
                  </label>
                  <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    placeholder="150" className="input-refined" style={{ paddingLeft: '28px' }} />
                </div>
              </div>

              <div data-animate="dialog-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                    Unit *
                  </label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="input-refined" style={{ appearance: 'auto' }}>
                    <option value="sq.ft">Square Feet</option>
                    <option value="sq.m">Square Meter</option>
                    <option value="running ft">Running Feet</option>
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="meter">Meter</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                    Calculation Type *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                    {[{ val: 'DIMENSION', label: 'Dimensions' }, { val: 'QUANTITY', label: 'Quantity' }].map((opt) => (
                      <label key={opt.val} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-700)',
                      }}>
                        <input type="radio" name="calcType" value={opt.val}
                          checked={form.calculationType === opt.val}
                          onChange={() => setForm({ ...form, calculationType: opt.val })}
                          style={{ accentColor: 'var(--primary-950)' }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div data-animate="dialog-field">
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="5mm transparent acrylic"
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)',
                    borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px',
                    color: 'var(--stone-900)', resize: 'vertical', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow-primary)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Actions */}
              <div data-animate="dialog-field" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button onClick={closeDialog} style={{
                  height: '42px', padding: '0 20px', borderRadius: '10px',
                  border: '1px solid var(--stone-200)', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-600)',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
                  Save Material
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
