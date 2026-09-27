"use client";

import React, { useEffect, useState } from "react";
import { expensesApi } from "@/lib/api";
import { Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Wallet, Search } from "lucide-react";
import { toast } from "sonner";

const categories = ["Electricity", "Transport", "Material Purchase", "Office Expense", "Rent", "Salary", "Maintenance", "Other"];
const emptyExpense = { title: "", category: "Other", amount: "", expenseDate: new Date().toISOString().split("T")[0], paymentMethod: "CASH", description: "" };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyExpense);
  const [search, setSearch] = useState("");

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    try { setExpenses((await expensesApi.getAll()).data); }
    catch { toast.error("Failed to load expenses"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) { await expensesApi.update(editing.id, payload); toast.success("Expense updated"); }
      else { await expensesApi.create(payload); toast.success("Expense added"); }
      setDialogOpen(false); setEditing(null); setForm(emptyExpense); loadExpenses();
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

  const fmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
  const filtered = expenses.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));
  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Expenses</h1><p className="text-sm text-muted-foreground">Track your business expenses</p></div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditing(null); setForm(emptyExpense); } }}>
          <DialogTrigger>
            <Button className="shadow-md"><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Electricity bill" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v: string | null) => setForm({ ...form, category: v || "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v: string | null) => setForm({ ...form, paymentMethod: v || "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"].map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}
                  </SelectContent></Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add Expense"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-rose-600">{fmt(totalExpenses)}</p></CardContent></Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Expenses</CardTitle>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
          : filtered.length === 0 ? <div className="flex h-40 flex-col items-center justify-center text-muted-foreground"><Wallet className="mb-2 h-10 w-10" /><p>No expenses</p></div>
          : <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((e) => (
                <TableRow key={e.id} className="group">
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{e.expenseDate}</TableCell>
                  <TableCell className="text-muted-foreground">{e.paymentMethod?.replace("_", " ")}</TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">{fmt(e.amount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>}
        </CardContent>
      </Card>
    </div>
  );
}
