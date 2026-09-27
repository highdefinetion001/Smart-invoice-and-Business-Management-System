"use client";

import React, { useEffect, useState } from "react";
import { materialsApi } from "@/lib/api";
import { Material } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";

const emptyMaterial = { name: "", code: "", rate: "", unit: "sq.ft", calculationType: "DIMENSION", description: "" };

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyMaterial);
  const [search, setSearch] = useState("");

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try {
      const res = await materialsApi.getAll();
      setMaterials(res.data);
    } catch { toast.error("Failed to load materials"); }
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
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyMaterial);
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

  const filtered = materials.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials</h1>
          <p className="text-sm text-muted-foreground">Manage your material catalog and rates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditing(null); setForm(emptyMaterial); } }}>
          <DialogTrigger>
            <Button className="shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Material" : "Add Material"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acrylic Sheet" />
                </div>
                <div className="space-y-2">
                  <Label>Material Code</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ACR-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate (₹)</Label>
                  <Input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="150" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={form.unit} onValueChange={(v: string | null) => setForm({ ...form, unit: v || "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sq.ft">Sq. ft</SelectItem>
                      <SelectItem value="sq.m">Sq. m</SelectItem>
                      <SelectItem value="running ft">Running ft</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Calculation Type</Label>
                <Select value={form.calculationType} onValueChange={(v: string | null) => setForm({ ...form, calculationType: v || "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIMENSION">Dimensions (Width × Length × Rate)</SelectItem>
                    <SelectItem value="QUANTITY">Quantity (Qty × Rate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="5mm transparent acrylic" />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editing ? "Update Material" : "Create Material"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Materials</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <Package className="mb-2 h-10 w-10" />
              <p>No materials found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} className="group">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{m.code}</TableCell>
                    <TableCell className="font-semibold text-primary">₹{m.rate}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {m.calculationType === "DIMENSION" ? "Dimension" : "Quantity"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={m.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-muted-foreground"}>
                        {m.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
