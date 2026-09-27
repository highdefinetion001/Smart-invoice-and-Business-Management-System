"use client";

import React, { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { BusinessSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((res) => setSettings(res.data)).catch(() => toast.error("Failed to load settings")).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.update(settings as unknown as Record<string, unknown>);
      toast.success("Settings saved");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const update = (field: keyof BusinessSettings, value: string | number) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground">Configure your business profile</p></div>
        <Button onClick={handleSave} disabled={saving} className="">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Business Name</Label><Input value={settings?.businessName || ""} onChange={(e) => update("businessName", e.target.value)} placeholder="Your Business Name" /></div>
            <div className="space-y-2"><Label>Address</Label><Textarea value={settings?.address || ""} onChange={(e) => update("address", e.target.value)} placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={settings?.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={settings?.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>GSTIN</Label><Input value={settings?.gstNumber || ""} onChange={(e) => update("gstNumber", e.target.value)} placeholder="GST Number" /></div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Invoice Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Invoice Prefix</Label><Input value={settings?.invoicePrefix || ""} onChange={(e) => update("invoicePrefix", e.target.value)} placeholder="INV" /></div>
              <div className="space-y-2"><Label>Default GST Rate (%)</Label><Input type="number" value={settings?.defaultTaxRate || ""} onChange={(e) => update("defaultTaxRate", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Invoice Footer</Label><Textarea value={settings?.invoiceFooter || ""} onChange={(e) => update("invoiceFooter", e.target.value)} placeholder="Thank you for your business." /></div>
            <div className="space-y-2"><Label>Bank Details</Label><Textarea value={settings?.bankDetails || ""} onChange={(e) => update("bankDetails", e.target.value)} placeholder="Bank name, A/C number, IFSC..." /></div>
            <div className="space-y-2"><Label>UPI Details</Label><Input value={settings?.upiDetails || ""} onChange={(e) => update("upiDetails", e.target.value)} placeholder="yourname@upi" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
