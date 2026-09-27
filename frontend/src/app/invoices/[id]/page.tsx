"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { invoicesApi, paymentsApi } from "@/lib/api";
import { Invoice, Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, IndianRupee, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700", PARTIAL: "bg-amber-50 text-amber-700",
  UNPAID: "bg-red-50 text-red-700", DRAFT: "bg-zinc-100 text-zinc-600", CANCELLED: "bg-zinc-100 text-muted-foreground",
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

  useEffect(() => {
    if (id) loadInvoice();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInvoice = async () => {
    try {
      const [invRes, payRes] = await Promise.all([
        invoicesApi.getById(Number(id)),
        paymentsApi.getByInvoice(Number(id)),
      ]);
      setInvoice(invRes.data);
      setPayments(payRes.data);
    } catch { toast.error("Failed to load invoice"); }
    finally { setLoading(false); }
  };

  const handleRecordPayment = async () => {
    try {
      await paymentsApi.record(Number(id), {
        amount: parseFloat(payAmount),
        paymentDate: payDate,
        paymentMethod: payMethod,
      });
      toast.success("Payment recorded");
      setPayDialogOpen(false);
      setPayAmount("");
      loadInvoice();
    } catch { toast.error("Failed to record payment"); }
  };

  const handleDelete = async () => {
    if (!confirm("Cancel this invoice?")) return;
    try { await invoicesApi.delete(Number(id)); toast.success("Invoice cancelled"); router.push("/invoices"); }
    catch { toast.error("Failed to cancel invoice"); }
  };

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  if (!invoice) return <div className="text-center text-muted-foreground">Invoice not found</div>;

  const outstanding = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
          </div>
          <Badge className={statusColors[invoice.status] || ""}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
              <DialogTrigger>
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600"><IndianRupee className="mr-2 h-4 w-4" /> Record Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="rounded-lg bg-background p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span>Invoice Amount</span><span className="font-semibold">{fmt(invoice.totalAmount)}</span></div>
                    <div className="flex justify-between"><span>Paid</span><span className="text-emerald-600">{fmt(invoice.paidAmount)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Outstanding</span><span className="text-red-600">{fmt(outstanding)}</span></div>
                  </div>
                  <div className="space-y-2"><Label>Payment Amount (₹)</Label><Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={String(outstanding)} /></div>
                  <div className="space-y-2"><Label>Payment Method</Label>
                    <Select value={payMethod} onValueChange={(v: string | null) => setPayMethod(v || "CASH")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"].map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}
                    </SelectContent></Select>
                  </div>
                  <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
                  <Button onClick={handleRecordPayment} className="w-full bg-emerald-600 hover:bg-emerald-700">Record Payment</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {invoice.status !== "CANCELLED" && (
            <Button variant="outline" className="text-red-500" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Cancel Invoice</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Material</TableHead><TableHead>Dimensions / Qty</TableHead><TableHead>Rate</TableHead><TableHead className="text-right">Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {invoice.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="font-medium">{item.materialName}</div>{item.specifications && <div className="text-xs text-muted-foreground">{item.specifications}</div>}</TableCell>
                      <TableCell>{item.width && item.length ? `${item.width} × ${item.length} ${item.unit} = ${item.calculatedArea} ${item.unit}` : `${item.quantity} ${item.unit}`}</TableCell>
                      <TableCell>₹{item.rate}/{item.unit}</TableCell>
                      <TableCell className="text-right font-semibold">{fmt(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No payments recorded yet</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.paymentDate}</TableCell>
                        <TableCell><Badge variant="secondary">{p.paymentMethod?.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">{fmt(p.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Summary */}
        <Card className="h-fit border-border shadow-lg">
          <CardHeader><CardTitle className="text-base">Invoice Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
            {invoice.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>Discount ({invoice.discountType === "PERCENTAGE" ? `${invoice.discountValue}%` : "Fixed"})</span><span>- {fmt(invoice.discountAmount)}</span></div>}
            {invoice.taxAmount > 0 && <div className="flex justify-between text-emerald-600"><span>GST {invoice.taxRate}%</span><span>+ {fmt(invoice.taxAmount)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{fmt(invoice.totalAmount)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-emerald-600 font-semibold">{fmt(invoice.paidAmount)}</span></div>
            <div className="flex justify-between font-bold"><span>Outstanding</span><span className="text-red-600">{fmt(outstanding)}</span></div>
            {invoice.customerNotes && <><Separator /><div><p className="text-xs text-muted-foreground mb-1">Customer Notes</p><p className="text-zinc-600">{invoice.customerNotes}</p></div></>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
