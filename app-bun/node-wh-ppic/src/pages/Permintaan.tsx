import { useState } from "react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle2, Clock, XCircle, ChevronDown, Package, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const SATUAN_LIST = ["gram", "ml", "liter", "lembar", "pcs", "set", "roll", "kg", "meter", "box", "drum", "unit"];

export interface PermintaanBarangItem {
  kode_barang: string;
  nama_barang: string;
  jumlah: number;
  satuan: string;
}

export interface PermintaanRecord {
  id: number;
  no_permintaan: string;
  nama_pemohon: string;
  departemen: string;
  tanggal: string;
  bulan: number;
  tahun: number;
  status: "PENDING" | "DISETUJUI" | "DITOLAK" | "SELESAI";
  items: PermintaanBarangItem[];
  catatan?: string;
}

export let mockPermintaanDB: PermintaanRecord[] = [
  {
    id: 1, no_permintaan: "PRQ-2025-001", nama_pemohon: "Rudi Hartono", departemen: "Byproduct",
    tanggal: "2025-01-20", bulan: 1, tahun: 2025, status: "DISETUJUI",
    items: [
      { kode_barang: "BRG-001", nama_barang: "Tepung Terigu Protein Tinggi", jumlah: 200, satuan: "kg" },
      { kode_barang: "BRG-002", nama_barang: "Gula Pasir Putih", jumlah: 50, satuan: "kg" },
    ],
    catatan: "Untuk produksi batch maret",
  },
  {
    id: 2, no_permintaan: "PRQ-2025-002", nama_pemohon: "Hendra Wijaya", departemen: "Maintenance",
    tanggal: "2025-01-21", bulan: 1, tahun: 2025, status: "PENDING",
    items: [
      { kode_barang: "BRG-006", nama_barang: "Pelumas Mesin 20W-50", jumlah: 10, satuan: "liter" },
      { kode_barang: "BRG-007", nama_barang: "Filter Udara Kompresor", jumlah: 3, satuan: "pcs" },
    ],
    catatan: "PM bulanan kompresor line 2",
  },
  {
    id: 3, no_permintaan: "PRQ-2025-003", nama_pemohon: "Rudi Hartono", departemen: "Byproduct",
    tanggal: "2025-01-18", bulan: 1, tahun: 2025, status: "SELESAI",
    items: [{ kode_barang: "BRG-004", nama_barang: "Kantong Plastik 5kg", jumlah: 2000, satuan: "pcs" }],
  },
  {
    id: 4, no_permintaan: "PRQ-2025-004", nama_pemohon: "Hendra Wijaya", departemen: "Maintenance",
    tanggal: "2025-02-03", bulan: 2, tahun: 2025, status: "DISETUJUI",
    items: [{ kode_barang: "BRG-008", nama_barang: "Sarung Tangan Latex", jumlah: 5, satuan: "box" }],
    catatan: "Stok habis",
  },
  {
    id: 5, no_permintaan: "PRQ-2025-005", nama_pemohon: "Rudi Hartono", departemen: "Byproduct",
    tanggal: "2025-03-10", bulan: 3, tahun: 2025, status: "PENDING",
    items: [
      { kode_barang: "BRG-011", nama_barang: "Pewarna Makanan Merah", jumlah: 500, satuan: "gram" },
      { kode_barang: "BRG-003", nama_barang: "Minyak Goreng Kemasan", jumlah: 20, satuan: "liter" },
    ],
    catatan: "Batch produksi Q2",
  },
];

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  DISETUJUI: { label: "Disetujui", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
  DITOLAK: { label: "Ditolak", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
  SELESAI: { label: "Selesai", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
};

const BULAN_LIST = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function Permintaan() {
  const user = auth.getUser();
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterBulan, setFilterBulan] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [formItems, setFormItems] = useState<PermintaanBarangItem[]>([{ kode_barang: "", nama_barang: "", jumlah: 1, satuan: "pcs" }]);
  const [catatan, setCatatan] = useState("");

  const { data: permintaan = [], isLoading } = useQuery({
    queryKey: ["mock-permintaan"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      if (user?.role === "BYPRODUCT") return mockPermintaanDB.filter(p => p.departemen === "Byproduct");
      if (user?.role === "MAINTENANCE") return mockPermintaanDB.filter(p => p.departemen === "Maintenance");
      return [...mockPermintaanDB];
    },
  });

  const createMut = useMutation({
    mutationFn: async (data: Pick<PermintaanRecord, "items" | "catatan">) => {
      await new Promise(r => setTimeout(r, 400));
      const now = new Date();
      const newItem: PermintaanRecord = {
        id: Date.now(),
        no_permintaan: `PRQ-${now.getFullYear()}-${String(mockPermintaanDB.length + 1).padStart(3, "0")}`,
        nama_pemohon: user?.name || "",
        departemen: user?.department || "",
        tanggal: now.toISOString().split("T")[0],
        bulan: now.getMonth() + 1,
        tahun: now.getFullYear(),
        status: "PENDING",
        ...data,
      };
      mockPermintaanDB.push(newItem);
      return newItem;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock-permintaan"] });
      setIsModalOpen(false);
      setFormItems([{ kode_barang: "", nama_barang: "", jumlah: 1, satuan: "pcs" }]);
      setCatatan("");
    },
  });

  const filtered = permintaan.filter(p => {
    if (filterBulan && p.bulan !== filterBulan) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.no_permintaan.toLowerCase().includes(q) ||
        p.nama_pemohon.toLowerCase().includes(q) ||
        p.items.some(i => i.nama_barang.toLowerCase().includes(q) || i.kode_barang.toLowerCase().includes(q));
    }
    return true;
  });

  const stats = {
    total: permintaan.length,
    pending: permintaan.filter(p => p.status === "PENDING").length,
    disetujui: permintaan.filter(p => p.status === "DISETUJUI").length,
    selesai: permintaan.filter(p => p.status === "SELESAI").length,
  };

  const handleAddItem = () => setFormItems(p => [...p, { kode_barang: "", nama_barang: "", jumlah: 1, satuan: "pcs" }]);
  const handleRemoveItem = (i: number) => setFormItems(p => p.filter((_, idx) => idx !== i));
  const handleItemChange = (i: number, field: keyof PermintaanBarangItem, value: string | number) =>
    setFormItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" /> Permintaan Barang
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola dan pantau permintaan barang antar departemen</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Buat Permintaan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Menunggu", value: stats.pending, color: "text-yellow-400" },
          { label: "Disetujui", value: stats.disetujui, color: "text-blue-400" },
          { label: "Selesai", value: stats.selesai, color: "text-green-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 glass-panel border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor, pemohon, barang..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <select value={filterBulan} onChange={e => setFilterBulan(Number(e.target.value))}
          className="px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option value={0}>Semua Bulan</option>
          {BULAN_LIST.slice(1).map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i} className="p-4 glass-panel animate-pulse h-20" />) :
          filtered.length === 0 ? (
            <Card className="glass-panel p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada permintaan ditemukan</p>
            </Card>
          ) : filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === item.id;
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-panel border border-border/50 overflow-hidden">
                  <div className="p-4 cursor-pointer flex items-center justify-between gap-4" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{item.no_permintaan}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.nama_pemohon} · {item.departemen} · {BULAN_LIST[item.bulan]} {item.tahun}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">{item.items.length} item</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />{cfg.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border/50 px-4 pb-4 pt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detail Barang</p>
                      <div className="rounded-lg overflow-hidden border border-border/40">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary/40">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Kode</th>
                              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Nama Barang</th>
                              <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium">Jumlah</th>
                              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Satuan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.items.map((bi, i) => (
                              <tr key={i} className="border-t border-border/30">
                                <td className="px-3 py-2 font-mono text-xs text-primary">{bi.kode_barang}</td>
                                <td className="px-3 py-2 font-medium">{bi.nama_barang}</td>
                                <td className="px-3 py-2 text-right font-semibold">{bi.jumlah.toLocaleString("id-ID")}</td>
                                <td className="px-3 py-2 text-muted-foreground">{bi.satuan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {item.catatan && <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Catatan:</span> {item.catatan}</p>}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl glass-panel border border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Permintaan Barang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-sm grid grid-cols-2 gap-1">
              <p className="text-muted-foreground">Pemohon: <span className="text-foreground font-medium">{user?.name}</span></p>
              <p className="text-muted-foreground">Departemen: <span className="text-foreground font-medium">{user?.department}</span></p>
              <p className="text-muted-foreground">Tanggal: <span className="text-foreground font-medium">{new Date().toLocaleDateString("id-ID")}</span></p>
              <p className="text-muted-foreground">Role: <span className="text-foreground font-medium">{user?.role}</span></p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Daftar Barang yang Diminta</label>
              <div className="space-y-2">
                {formItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" placeholder="Kode (cth: BRG-001)" value={item.kode_barang}
                      onChange={e => handleItemChange(i, "kode_barang", e.target.value.toUpperCase())}
                      className="col-span-3 px-2 py-2 text-xs rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono" />
                    <input type="text" placeholder="Nama barang" value={item.nama_barang}
                      onChange={e => handleItemChange(i, "nama_barang", e.target.value)}
                      className="col-span-4 px-2 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input type="number" placeholder="Jml" value={item.jumlah} min={0.001} step={0.001}
                      onChange={e => handleItemChange(i, "jumlah", Number(e.target.value))}
                      className="col-span-2 px-2 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <select value={item.satuan} onChange={e => handleItemChange(i, "satuan", e.target.value)}
                      className="col-span-2 px-2 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                      {SATUAN_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formItems.length > 1 && (
                      <button onClick={() => handleRemoveItem(i)} className="col-span-1 p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors flex justify-center">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2 border-dashed" onClick={handleAddItem}>
                <Plus className="w-3 h-3 mr-1" /> Tambah Barang
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Catatan (opsional)</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                placeholder="Keperluan / keterangan tambahan..."
                className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={() => createMut.mutate({ items: formItems, catatan })}
              disabled={createMut.isPending || formItems.some(i => !i.nama_barang)}
              className="bg-primary hover:bg-primary/90">
              {createMut.isPending ? "Menyimpan..." : "Kirim Permintaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
