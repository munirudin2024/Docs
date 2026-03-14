import { useState } from "react";
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from "@/hooks/use-api";
import { Plus, Search, Edit2, MapPin, Phone, Mail, Globe, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  kode_supplier: z.string().min(1, "Wajib diisi"),
  nama_supplier: z.string().min(1, "Wajib diisi"),
  alamat: z.string().optional(),
  kota: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  no_telepon: z.string().optional(),
  website: z.string().optional(),
  contact_person: z.string().optional()
});

export default function Supplier() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data, isLoading } = useSuppliers({ search });
  const createMut = useCreateSupplier();
  const updateMut = useUpdateSupplier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { kode_supplier: "", nama_supplier: "", alamat: "", kota: "", email: "", no_telepon: "", website: "", contact_person: "" }
  });

  const openAdd = () => {
    setEditId(null);
    form.reset({ kode_supplier: "", nama_supplier: "", alamat: "", kota: "", email: "", no_telepon: "", website: "", contact_person: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id_supplier);
    form.reset({
      kode_supplier: item.kode_supplier,
      nama_supplier: item.nama_supplier,
      alamat: item.alamat || "",
      kota: item.kota || "",
      email: item.email || "",
      no_telepon: item.no_telepon || "",
      website: item.website || "",
      contact_person: item.contact_person || ""
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editId) {
      updateMut.mutate({ id: editId, data: values }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/supplier"] });
          toast({ title: "Berhasil", description: "Data supplier diperbarui" });
          setIsModalOpen(false);
        }
      });
    } else {
      createMut.mutate({ data: values }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/supplier"] });
          toast({ title: "Berhasil", description: "Supplier baru ditambahkan" });
          setIsModalOpen(false);
        }
      });
    }
  };

  const supplierList = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Master Data Supplier</h1>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Tambah Supplier
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari nama / kode supplier..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-panel border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border border-border">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat data supplier...</div>
      ) : supplierList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">Tidak ada supplier ditemukan</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplierList.map((item) => (
            <Card key={item.id_supplier} className="glass-panel overflow-hidden group">
              <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white font-bold shadow-md">
                      {item.nama_supplier.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base line-clamp-1" title={item.nama_supplier}>{item.nama_supplier}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{item.kode_supplier}</p>
                    </div>
                  </div>
                  <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  {item.kota && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> <span className="truncate">{item.kota}</span></div>}
                  {item.no_telepon && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> <span>{item.no_telepon}</span></div>}
                  {item.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <span className="truncate">{item.email}</span></div>}
                  {item.website && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> <span className="truncate">{item.website}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-panel p-0 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Kota</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {supplierList.map((item) => (
                <tr key={item.id_supplier} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.nama_supplier}</div>
                    <div className="font-mono text-xs text-muted-foreground">{item.kode_supplier}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{item.contact_person || '-'}</div>
                    <div className="text-xs">{item.no_telepon}</div>
                  </td>
                  <td className="px-4 py-3">{item.kota || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-500/20 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass border border-border sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Supplier" : "Tambah Supplier Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kode Supplier *</label>
                <input {...form.register("kode_supplier")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary uppercase outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nama Supplier *</label>
                <input {...form.register("nama_supplier")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contact Person</label>
                <input {...form.register("contact_person")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">No. Telepon</label>
                <input {...form.register("no_telepon")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input type="email" {...form.register("email")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kota</label>
                <input {...form.register("kota")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
