import { useState } from "react";
import { useListBarang, useCreateBarang, useUpdateBarang, useDeleteBarang } from "@/hooks/use-api";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  kode_barang: z.string().min(1, "Kode wajib diisi"),
  nama_barang: z.string().min(1, "Nama wajib diisi"),
  kategori: z.string().optional(),
  satuan: z.string().optional(),
  harga_beli: z.string().optional(),
  stok_minimum: z.coerce.number().optional()
});

export default function Barang() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  
  const { data, isLoading } = useListBarang({ search, kategori: kategori === "ALL" ? undefined : kategori });
  const createMut = useCreateBarang();
  const updateMut = useUpdateBarang();
  const deleteMut = useDeleteBarang();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { kode_barang: "", nama_barang: "", kategori: "RAW", satuan: "KG", harga_beli: "0", stok_minimum: 10 }
  });

  const getBadgeColor = (cat: string) => {
    switch(cat?.toUpperCase()) {
      case 'RAW': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'BAG': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'MTC': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const openAdd = () => {
    setEditId(null);
    form.reset({ kode_barang: "", nama_barang: "", kategori: "RAW", satuan: "KG", harga_beli: "0", stok_minimum: 10 });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id_barang);
    form.reset({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      kategori: item.kategori || "",
      satuan: item.satuan || "",
      harga_beli: item.harga_beli || "0",
      stok_minimum: item.stok_minimum || 0
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editId) {
      updateMut.mutate({ id: editId, data: values }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/barang"] });
          toast({ title: "Berhasil", description: "Data barang diperbarui" });
          setIsModalOpen(false);
        }
      });
    } else {
      createMut.mutate({ data: values }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/barang"] });
          toast({ title: "Berhasil", description: "Barang baru ditambahkan" });
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if(confirm("Yakin ingin menghapus barang ini?")) {
      deleteMut.mutate({ id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/barang"] });
          toast({ title: "Dihapus", description: "Barang berhasil dihapus" });
        }
      });
    }
  };

  const barangList = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Master Data Barang</h1>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Tambah Barang
        </Button>
      </div>

      <Card className="glass-panel p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari kode / nama barang..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          <div className="relative w-full md:w-48 shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select 
              value={kategori} 
              onChange={e => setKategori(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="RAW">RAW</option>
              <option value="BAG">BAG</option>
              <option value="MTC">MTC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode</th>
                <th className="px-4 py-3 font-semibold">Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Satuan</th>
                <th className="px-4 py-3 font-semibold text-right">Harga Beli</th>
                <th className="px-4 py-3 font-semibold text-center">Min Stok</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Memuat data...</td></tr>
              ) : barangList.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data ditemukan</td></tr>
              ) : (
                barangList.map((item) => (
                  <tr key={item.id_barang} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{item.kode_barang}</td>
                    <td className="px-4 py-3 font-medium">{item.nama_barang}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full border", getBadgeColor(item.kategori || ''))}>
                        {item.kategori || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.satuan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(item.harga_beli)}</td>
                    <td className="px-4 py-3 text-center">{item.stok_minimum}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id_barang)} className="p-1.5 text-destructive hover:bg-destructive/20 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass border border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kode Barang *</label>
                <input {...form.register("kode_barang")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary uppercase outline-none" />
                {form.formState.errors.kode_barang && <span className="text-xs text-destructive">{form.formState.errors.kode_barang.message}</span>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kategori</label>
                <select {...form.register("kategori")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none appearance-none">
                  <option value="RAW">RAW</option>
                  <option value="BAG">BAG</option>
                  <option value="MTC">MTC</option>
                  <option value="NON-MTC">NON-MTC</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Barang *</label>
              <input {...form.register("nama_barang")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              {form.formState.errors.nama_barang && <span className="text-xs text-destructive">{form.formState.errors.nama_barang.message}</span>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Satuan</label>
                <input {...form.register("satuan")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Min Stok</label>
                <input type="number" {...form.register("stok_minimum")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Harga Beli</label>
                <input type="number" {...form.register("harga_beli")} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm focus:ring-1 focus:ring-primary outline-none" />
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
