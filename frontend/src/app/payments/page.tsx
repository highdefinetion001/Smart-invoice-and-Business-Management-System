"use client";

import React, { useEffect, useState } from "react";
import { invoicesApi } from "@/lib/api";
import { Invoice } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Receipt } from "lucide-react";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoicesApi.getAll().then((res) => {
      setInvoices(res.data.filter((i: Invoice) => i.status !== "CANCELLED"));
      setLoading(false);
    }).catch(() => { toast.error("Failed to load"); setLoading(false); });
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);
  const totalReceived = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalPending = invoices.reduce((s, i) => s + ((i.totalAmount || 0) - (i.paidAmount || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">Track all invoice payments</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Received</p><p className="text-2xl font-bold text-emerald-600">{fmt(totalReceived)}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Pending</p><p className="text-2xl font-bold text-red-600">{fmt(totalPending)}</p></CardContent></Card>
      </div>
      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Payment Status by Invoice</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
          : invoices.length === 0 ? <div className="flex h-40 flex-col items-center justify-center text-muted-foreground"><Receipt className="mb-2 h-10 w-10" /><p>No invoices</p></div>
          : <Table>
              <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Pending</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono font-semibold text-primary">{i.invoiceNumber}</TableCell>
                  <TableCell>{i.customer?.name}</TableCell>
                  <TableCell>{fmt(i.totalAmount)}</TableCell>
                  <TableCell className="text-emerald-600">{fmt(i.paidAmount)}</TableCell>
                  <TableCell className="text-red-600">{fmt(i.totalAmount - i.paidAmount)}</TableCell>
                  <TableCell><Badge variant="outline" className={i.status === "PAID" ? "bg-emerald-50 text-emerald-700" : i.status === "PARTIAL" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>}
        </CardContent>
      </Card>
    </div>
  );
}
