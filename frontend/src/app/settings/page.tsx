"use client";

import React, { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { BusinessSettings } from "@/types";
import { Loader2, Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { usePageAnimation } from "@/hooks/usePageAnimation";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const containerRef = usePageAnimation();

  useEffect(() => {
    settingsApi.get().then((res) => setSettings(res.data)).catch(() => toast.error("Failed to load settings")).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try { await settingsApi.update(settings as unknown as Record<string, unknown>); toast.success("Settings saved"); }
    catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const update = (field: keyof BusinessSettings, value: string | number) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--primary-950)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--stone-600)', marginBottom: '6px' }}>{children}</label>
  );

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div data-animate="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--stone-900)', marginBottom: '4px' }}>Settings</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-400)' }}>Configure your business profile</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
          {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
          Save Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Business Information */}
        <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px' }}>
          <div className="section-label" style={{ marginBottom: '24px' }}>Business Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div data-animate="field">
              <FieldLabel>Business Name</FieldLabel>
              <input value={settings?.businessName || ""} onChange={(e) => update("businessName", e.target.value)} placeholder="Your Business Name" className="input-refined" />
            </div>
            <div data-animate="field">
              <FieldLabel>Address</FieldLabel>
              <textarea value={settings?.address || ""} onChange={(e) => update("address", e.target.value)} placeholder="Full address" rows={3}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
              />
            </div>
            <div data-animate="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><FieldLabel>Phone</FieldLabel><input value={settings?.phone || ""} onChange={(e) => update("phone", e.target.value)} className="input-refined" /></div>
              <div><FieldLabel>Email</FieldLabel><input value={settings?.email || ""} onChange={(e) => update("email", e.target.value)} className="input-refined" /></div>
            </div>
            <div data-animate="field">
              <FieldLabel>GSTIN</FieldLabel>
              <input value={settings?.gstNumber || ""} onChange={(e) => update("gstNumber", e.target.value)} placeholder="GST Number" className="input-refined" />
            </div>
          </div>
        </div>

        {/* Invoice Configuration */}
        <div data-animate="card" style={{ background: '#FFFFFF', border: '1px solid var(--stone-200)', borderRadius: '14px', padding: '28px' }}>
          <div className="section-label" style={{ marginBottom: '24px' }}>Invoice Configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div data-animate="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><FieldLabel>Invoice Prefix</FieldLabel><input value={settings?.invoicePrefix || ""} onChange={(e) => update("invoicePrefix", e.target.value)} placeholder="INV" className="input-refined" /></div>
              <div><FieldLabel>Default GST Rate (%)</FieldLabel><input type="number" value={settings?.defaultTaxRate || ""} onChange={(e) => update("defaultTaxRate", e.target.value)} className="input-refined" /></div>
            </div>
            <div data-animate="field">
              <FieldLabel>Invoice Footer</FieldLabel>
              <textarea value={settings?.invoiceFooter || ""} onChange={(e) => update("invoiceFooter", e.target.value)} placeholder="Thank you for your business." rows={3}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
              />
            </div>
            <div data-animate="field">
              <FieldLabel>Bank Details</FieldLabel>
              <textarea value={settings?.bankDetails || ""} onChange={(e) => update("bankDetails", e.target.value)} placeholder="Bank name, A/C number, IFSC..." rows={3}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--stone-200)', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--stone-900)', resize: 'vertical', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
              />
            </div>
            <div data-animate="field">
              <FieldLabel>UPI Details</FieldLabel>
              <input value={settings?.upiDetails || ""} onChange={(e) => update("upiDetails", e.target.value)} placeholder="yourname@upi" className="input-refined" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
