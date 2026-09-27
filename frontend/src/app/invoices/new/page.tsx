"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { customersApi, materialsApi, invoicesApi, settingsApi } from "@/lib/api";
import { Customer, Material } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    Promise.all([
      customersApi.getAll(),
      materialsApi.getActive(),
      settingsApi.get(),
    ]).then(([cRes, mRes, sRes]) => {
      setCustomers(cRes.data);
      setMaterials(mRes.data);
      if (sRes.data.defaultTaxRate) setTaxRate(String(sRes.data.defaultTaxRate));
    });
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
  };

  const selectMaterial = (index: number, materialId: string) => {
    const mat = materials.find((m) => m.id === parseInt(materialId));
    if (!mat) return;
    updateItem(index, {
      materialId: mat.id,
      materialName: mat.name,
      rate: mat.rate,
      unit: mat.unit,
      calculationType: mat.calculationType,
      specifications: mat.description || "",
    });
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount =
    discountType === "PERCENTAGE"
      ? subtotal * (parseFloat(discountValue) || 0) / 100
      : parseFloat(discountValue) || 0;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = taxEnabled ? taxableAmount * (parseFloat(taxRate) || 0) / 100 : 0;
  const total = taxableAmount + taxAmount;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const handleSave = async (status: string = "UNPAID") => {
    if (!customerId) { toast.error("Please select a customer"); return; }
    if (items.every((i) => i.lineTotal === 0)) { toast.error("Add at least one item"); return; }

    setSaving(true);
    try {
      await invoicesApi.create({
        customerId: parseInt(customerId),
        invoiceDate,
        dueDate: dueDate || null,
        paymentTerms,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        taxRate: taxEnabled ? parseFloat(taxRate) || 0 : 0,
        taxEnabled,
        customerNotes,
        internalNotes,
        status,
        items: items.filter((i) => i.materialId).map((i) => ({
          materialId: i.materialId,
          materialName: i.materialName,
          rate: i.rate,
          unit: i.unit,
          width: i.calculationType === "DIMENSION" ? parseFloat(i.width) || null : null,
          length: i.calculationType === "DIMENSION" ? parseFloat(i.length) || null : null,
          quantity: i.calculationType === "QUANTITY" ? parseFloat(i.quantity) || null : null,
          specifications: i.specifications,
        })),
      });
      toast.success("Invoice created successfully!");
      router.push("/invoices");
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to generate a new invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invoice Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invoice Header */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={customerId} onValueChange={(v: string | null) => setCustomerId(v || "")}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={(v: string | null) => setPaymentTerms(v || "")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 7">Net 7</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setItems([...items, newLineItem()])}>
                  <Plus className="mr-2 h-3 w-3" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-background/50 p-4 space-y-3 transition-all hover:border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs text-muted-foreground">Material</Label>
                        <Select value={item.materialId ? String(item.materialId) : ""} onValueChange={(v: string | null) => selectMaterial(idx, v || "")}>
                          <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.name} — ₹{m.rate}/{m.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {item.calculationType === "DIMENSION" ? (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Width</Label>
                            <Input type="number" value={item.width} onChange={(e) => updateItem(idx, { width: e.target.value })} placeholder="0" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Length</Label>
                            <Input type="number" value={item.length} onChange={(e) => updateItem(idx, { length: e.target.value })} placeholder="0" />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Quantity</Label>
                          <Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} placeholder="0" />
                        </div>
                      )}
                    </div>
                    {items.length > 1 && (
                      <Button size="sm" variant="ghost" className="ml-2 text-red-400 hover:text-red-600" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {item.materialId > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm">
                      <span className="text-muted-foreground">
                        {item.calculationType === "DIMENSION"
                          ? `${item.width || 0} × ${item.length || 0} = ${item.calculatedArea.toFixed(2)} ${item.unit}`
                          : `${item.quantity || 0} ${item.unit}`}
                        {" × ₹"}{item.rate}
                      </span>
                      <span className="font-bold text-primary">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Specifications</Label>
                    <Input value={item.specifications} onChange={(e) => updateItem(idx, { specifications: e.target.value })} placeholder="Material specs..." />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Notes</Label>
                <Textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Visible on the invoice PDF" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="For internal use only" rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Sticky Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card className="border-border shadow-lg">
              <CardHeader><CardTitle className="text-base">Cost Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Line Items</span><span>{formatCurrency(subtotal)}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <Label className="text-xs">Discount</Label>
                  <div className="flex gap-2">
                    <Select value={discountType} onValueChange={(v: string | null) => setDiscountType(v || "FIXED")}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed (₹)</SelectItem>
                        <SelectItem value="PERCENTAGE">Percent (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0" />
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-red-500">Discount</span><span className="text-red-500">- {formatCurrency(discountAmount)}</span></div>
                  )}
                </div>

                {/* Tax */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taxEnabled"
                      checked={taxEnabled}
                      onChange={(e) => setTaxEnabled(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="taxEnabled" className="text-xs cursor-pointer">GST / Tax</Label>
                  </div>
                  {taxEnabled && (
                    <div className="flex items-center gap-2">
                      <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-20" />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  )}
                  {taxEnabled && taxAmount > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST {taxRate}%</span><span className="text-emerald-600">+ {formatCurrency(taxAmount)}</span></div>
                  )}
                </div>

                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="bg-clip-text text-transparent">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSave("UNPAID")}
                disabled={saving}
                className="h-11 font-semibold shadow-md"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Invoice
              </Button>
              <Button variant="outline" onClick={() => handleSave("DRAFT")} disabled={saving}>
                Save as Draft
              </Button>
              <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
