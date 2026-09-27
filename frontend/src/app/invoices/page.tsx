"use client";

import React, { useEffect, useState } from "react";
import { invoicesApi } from "@/lib/api";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-red-50 text-red-700 border-red-200",
  DRAFT: "bg-zinc-100 text-zinc-600 border-border",
  CANCELLED: "bg-zinc-100 text-muted-foreground border-border",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const router = useRouter();

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try { setInvoices((await invoicesApi.getAll()).data); }
    catch { toast.error("Failed to load invoices"); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Create and manage your invoices</p>
        </div>
        <Button
          onClick={() => router.push("/invoices/new")}
          className="shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "UNPAID", "PARTIAL", "PAID", "DRAFT", "CANCELLED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className={filter === s ? "bg-indigo-600" : ""}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {filtered.length} Invoice{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground"><FileText className="mb-2 h-10 w-10" /><p>No invoices found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id} className="group cursor-pointer" onClick={() => router.push(`/invoices/${inv.id}`)}>
                    <TableCell className="font-mono font-semibold text-primary">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{inv.customer?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.invoiceDate}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(inv.totalAmount - inv.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[inv.status] || ""} variant="outline">{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/invoices/${inv.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
