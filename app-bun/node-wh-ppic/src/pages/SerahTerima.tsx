import { useState } from "react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckSquare, Plus, ChevronDown, Search, ClipboardCheck, Tag, Hash, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const BULAN_LIST = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export interface SerahTerimaItem {
  kode_barang: string;
  nama_barang: string;
  no_batch: string;
  no_label: number | string;
  jumlah: number;
  satuan: string;
  metode: "FEFO" | "FIFO";
  kondisi: "BAIK" | "RUSAK" | "PERLU_CEK";
}

export interface SerahTerimaRecord {
  id: number;
  no_serah_terima: string;
  no_permintaan_ref?: string;
  penyerah: string;
  dept_penyerah: string;
  penerima: string;
  dept_penerima: string;
  tanggal: string;
  waktu: string;
  bulan: number;
  tahun: number;
  gudang_asal: string;
  status: "MENUNGGU" | "DIKONFIRMASI" | "SELESAI";
  dikonfirmasi_oleh?: string;
  waktu_konfirmasi?: string;
  items: SerahTerimaItem[];
  catatan?: string;
}

let mockSTDB: SerahTerimaRecord[] = [
  {
    id: 1, no_serah_terima: "ST-2025-001", no_permintaan_ref: "PRQ-2025-001",
    penyerah: "Andi Saputra", dept_penyerah: "Gudang",
    penerima: "Rudi Hartono", dept_penerima: "Byproduct",
    tanggal: "2025-01-21", waktu: "09:30", bulan: 1, tahun: 2025,
    gudang_asal: "GDG-01 Gudang Utama", status: "DIKONFIRMASI",
    dikonfirmasi_oleh: "Rudi Hartono", waktu_konfirmasi: "2025-01-21 09:45",
    items: [
      { kode_barang: "BRG-001", nama_barang: "Tepung Terigu Protein Tinggi", no_batch: "BTH-2024-001", no_label: 1, jumlah: 200, satuan: "kg", metode: "FEFO", kondisi: "BAIK" },
      { kode_barang: "BRG-002", nama_barang: "Gula Pasir Putih", no_batch: "BTH-2024-002", no_label: 2, jumlah: 50, satuan: "kg", metode: "FIFO", kondisi: "BAIK" },
    ],
    catatan: "Barang diterima dalam kondisi baik",
  },
  {
    id: 2, no_serah_terima: "ST-2025-002", no_permintaan_ref: "PRQ-2025-002",
    penyerah: "Andi Saputra", dept_penyerah: "Gudang",
    penerima: "Hendra Wijaya", dept_penerima: "Maintenance",
    tanggal: "2025-01-22", waktu: "14:00", bulan: 1, tahun: 2025,
    gudang_asal: "GDG-02 Gudang Bahan Baku", status: "MENUNGGU",
    items: [
      { kode_barang: "BRG-006", nama_barang: "Pelumas Mesin 20W-50", no_batch: "BTH-2024-006", no_label: 6, jumlah: 10, satuan: "liter", metode: "FIFO", kondisi: "BAIK" },
      { kode_barang: "BRG-007", nama_barang: "Filter Udara Kompresor", no_batch: "BTH-2024-007", no_label: 7, jumlah: 3, satuan: "pcs", metode: "FIFO", kondisi: "BAIK" },
    ],
  },
  {
    id: 3, no_serah_terima: "ST-2025-003",
    penyerah: "Budi Santoso", dept_penyerah: "Gudang",
    penerima: "Rudi Hartono", dept_penerima: "Byproduct",
    tanggal: "2025-02-05", waktu: "08:15", bulan: 2, tahun: 2025,
    gudang_asal: "GDG-01 Gudang Utama", status: "SELESAI",
    dikonfirmasi_oleh: "Rudi Hartono", waktu_konfirmasi: "2025-02-05 08:30",
    items: [
      { kode_barang: "BRG-004", nama_barang: "Kantong Plastik 5kg", no_batch: "BTH-2024-004", no_label: 4, jumlah: 2000, satuan: "pcs", metode: "FIFO", kondisi: "BAIK" },
    ],
  },
];

const STATUS_CFG = {
  MENUNGGU: { label: "Menunggu Konfirmasi", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SELESAI: { label: "Selesai", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

const KONDISI_CFG = {
  BAIK: "text-green-400",
  RUSAK: "text-red-400",
  PERLU_CEK: "text-yellow-400",
};

const METODE_CFG = {
  FEFO: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  FIFO: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function SerahTerima() {
  const user = auth.getUser();
  const qclient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [konfirmasiId, setKonfirmasiId] = useState<number | null>(null);
  const [filterBulan, setFilterBulan] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    penerima: "", dept_penerima: "", no_permintaan_ref: "",
    gudang_asal: "GDG-01 Gudang Utama", catatan: "",
    items: [{ kode_barang: "", nama_barang: "", no_batch: "", no_label: "", jumlah: 1, satuan: "pcs", metode: "FIFO" as "FEFO" | "FIFO", kondisi: "BAIK" as "BAIK" | "RUSAK" | "PERLU_CEK" }],
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["mock-serah-terima"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      if (user?.role === "BYPRODUCT") return mockSTDB.filter(r => r.dept_penerima === "Byproduct" || r.dept_penyerah === "Byproduct");
      if (user?.role === "MAINTENANCE") return mockSTDB.filter(r => r.dept_penerima === "Maintenance" || r.dept_penyerah === "Maintenance");
      return [...mockSTDB];
    },
  });

  const konfirmasiMut = useMutation({
    mutationFn: async (id: number) => {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockSTDB.findIndex(r => r.id === id);
      if (idx > -1) {
        mockSTDB[idx].status = "DIKONFIRMASI";
        mockSTDB[idx].dikonfirmasi_oleh = user?.name;
        mockSTDB[idx].waktu_konfirmasi = new Date().toLocaleString("id-ID");
      }
    },
    onSuccess: () => { qclient.invalidateQueries({ queryKey: ["mock-serah-terima"] }); setKonfirmasiId(null); },
  });

  const createMut = useMutation({
    mutationFn: async (data: typeof form) => {
      await new Promise(r => setTimeout(r, 500));
      const now = new Date();
      const rec: SerahTerimaRecord = {
        id: Date.now(),
        no_serah_terima: `ST-${now.getFullYear()}-${String(mockSTDB.length + 1).padStart(3, "0")}`,
        no_permintaan_ref: data.no_permintaan_ref || undefined,
        penyerah: user?.name || "",
        dept_penyerah: user?.department || "",
        penerima: data.penerima,
        dept_penerima: data.dept_penerima,
        tanggal: now.toISOString().split("T")[0],
        waktu: now.toTimeString().slice(0, 5),
        bulan: now.getMonth() + 1, tahun: now.getFullYear(),
        gudang_asal: data.gudang_asal,
        status: "MENUNGGU",
        catatan: data.catatan || undefined,
        items: data.items.map(i => ({ ...i, no_label: Number(i.no_label) || i.no_label })) as SerahTerimaItem[],
      };
      mockSTDB.push(rec);
      return rec;
    },
    onSuccess: () => { qclient.invalidateQueries({ queryKey: ["mock-serah-terima"] }); setIsModalOpen(false); },
  });

  const filtered = records.filter(r => {
    if (filterBulan && r.bulan !== filterBulan) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.no_serah_terima.toLowerCase().includes(q) ||
        r.penerima.toLowerCase().includes(q) || r.penyerah.toLowerCase().includes(q) ||
        r.items.some(i => i.nama_barang.toLowerCase().includes(q) || i.no_batch.toLowerCase().includes(q));
    }
    return true;
  });

  const handleFormItemChange = (i: number, field: string, value: string | number) =>
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));

  const canKonfirmasi = (r: SerahTerimaRecord) =>
    r.status === "MENUNGGU" && (user?.role === "BYPRODUCT" || user?.role === "MAINTENANCE" || user?.role === "ADMIN" || user?.role === "WH_SUPERVISOR");

  const canCreate = ["ADMIN", "WH_SUPERVISOR", "WH_STAFF", "PPIC"].includes(user?.role || "");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" /> Serah Terima Barang
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Bukti serah terima + konfirmasi penerima — FEFO / FIFO tracking</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Buat Serah Terima
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Menunggu Konfirmasi", value: records.filter(r => r.status === "MENUNGGU").length, color: "text-yellow-400" },
          { label: "Dikonfirmasi", value: records.filter(r => r.status === "DIKONFIRMASI").length, color: "text-blue-400" },
          { label: "Selesai", value: records.filter(r => r.status === "SELESAI").length, color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="p-4 glass-panel border border-border/50">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i} className="p-4 glass-panel animate-pulse h-20" />) :
          filtered.length === 0 ? (
            <Card className="glass-panel p-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada data serah terima</p>
            </Card>
          ) : filtered.map(r => {
            const cfg = STATUS_CFG[r.status];
            const isExpanded = expandedId === r.id;
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-panel border border-border/50 overflow-hidden">
                  <div className="p-4 flex flex-wrap gap-3 items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{r.no_serah_terima}</p>
                          {r.no_permintaan_ref && <span className="text-xs text-muted-foreground">← {r.no_permintaan_ref}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {r.penyerah} → {r.penerima} · {BULAN_LIST[r.bulan]} {r.tahun} · {r.waktu}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canKonfirmasi(r) && (
                        <Button size="sm" variant="outline" className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                          onClick={(e) => { e.stopPropagation(); setKonfirmasiId(r.id); }}>
                          <CheckSquare className="w-3 h-3 mr-1" /> Konfirmasi
                        </Button>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-secondary/30 rounded p-2"><span className="text-muted-foreground">Gudang Asal:</span><br /><span className="font-medium">{r.gudang_asal}</span></div>
                        <div className="bg-secondary/30 rounded p-2"><span className="text-muted-foreground">Tanggal:</span><br /><span className="font-medium">{r.tanggal} {r.waktu}</span></div>
                        <div className="bg-secondary/30 rounded p-2"><span className="text-muted-foreground">Penyerah:</span><br /><span className="font-medium">{r.penyerah} ({r.dept_penyerah})</span></div>
                        <div className="bg-secondary/30 rounded p-2"><span className="text-muted-foreground">Penerima:</span><br /><span className="font-medium">{r.penerima} ({r.dept_penerima})</span></div>
                      </div>

                      {r.dikonfirmasi_oleh && (
                        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded p-2 border border-green-500/20">
                          <CheckSquare className="w-3 h-3" />
                          Dikonfirmasi oleh <strong>{r.dikonfirmasi_oleh}</strong> pada {r.waktu_konfirmasi}
                        </div>
                      )}

                      <div className="rounded-lg overflow-hidden border border-border/40">
                        <table className="w-full text-xs">
                          <thead className="bg-secondary/50">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Kode</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nama Barang</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" />No Batch</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground"><Hash className="w-3 h-3 inline" /> Label</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Jumlah</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Satuan</th>
                              <th className="text-center px-3 py-2 font-medium text-muted-foreground"><ArrowUpDown className="w-3 h-3 inline" />Metode</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Kondisi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.items.map((item, i) => (
                              <tr key={i} className="border-t border-border/30">
                                <td className="px-3 py-2 font-mono text-primary">{item.kode_barang}</td>
                                <td className="px-3 py-2 font-medium">{item.nama_barang}</td>
                                <td className="px-3 py-2 font-mono text-muted-foreground">{item.no_batch}</td>
                                <td className="px-3 py-2 text-center font-bold">{item.no_label}</td>
                                <td className="px-3 py-2 text-right font-semibold">{Number(item.jumlah).toLocaleString("id-ID")}</td>
                                <td className="px-3 py-2 text-muted-foreground">{item.satuan}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${METODE_CFG[item.metode]}`}>{item.metode}</span>
                                </td>
                                <td className={`px-3 py-2 font-medium ${KONDISI_CFG[item.kondisi]}`}>{item.kondisi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {r.catatan && <p className="text-xs text-muted-foreground"><span className="font-medium">Catatan:</span> {r.catatan}</p>}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Konfirmasi Modal */}
      <Dialog open={!!konfirmasiId} onOpenChange={() => setKonfirmasiId(null)}>
        <DialogContent className="max-w-sm glass-panel border border-border/50">
          <DialogHeader><DialogTitle>Konfirmasi Penerimaan</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Apakah Anda menerima barang sesuai dokumen serah terima ini? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKonfirmasiId(null)}>Batal</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => konfirmasiId && konfirmasiMut.mutate(konfirmasiId)}
              disabled={konfirmasiMut.isPending}>
              <CheckSquare className="w-4 h-4 mr-2" />{konfirmasiMut.isPending ? "Memproses..." : "Ya, Saya Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buat Serah Terima Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl glass-panel border border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Buat Dokumen Serah Terima</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ref. Permintaan (opsional)</label>
                <input value={form.no_permintaan_ref} onChange={e => setForm(f => ({ ...f, no_permintaan_ref: e.target.value }))}
                  placeholder="PRQ-2025-001"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gudang Asal</label>
                <select value={form.gudang_asal} onChange={e => setForm(f => ({ ...f, gudang_asal: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                  {Array.from({ length: 20 }, (_, i) => `GDG-${String(i + 1).padStart(2, "0")}`).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nama Penerima</label>
                <input value={form.penerima} onChange={e => setForm(f => ({ ...f, penerima: e.target.value }))} placeholder="Nama penerima"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Departemen Penerima</label>
                <select value={form.dept_penerima} onChange={e => setForm(f => ({ ...f, dept_penerima: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                  <option value="">Pilih departemen</option>
                  {["Byproduct", "Maintenance", "QC", "Gudang", "PPIC", "Security", "IT"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Detail Barang</label>
              <div className="space-y-2 overflow-x-auto">
                {form.items.map((item, i) => (
                  <div key={i} className="grid gap-1" style={{ gridTemplateColumns: "1fr 1.5fr 1fr 0.5fr 0.6fr 0.7fr 0.7fr 0.7fr auto" }}>
                    <input placeholder="Kode" value={item.kode_barang} onChange={e => handleFormItemChange(i, "kode_barang", e.target.value.toUpperCase())}
                      className="px-2 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono" />
                    <input placeholder="Nama barang" value={item.nama_barang} onChange={e => handleFormItemChange(i, "nama_barang", e.target.value)}
                      className="px-2 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input placeholder="No. Batch" value={item.no_batch} onChange={e => handleFormItemChange(i, "no_batch", e.target.value)}
                      className="px-2 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono" />
                    <input placeholder="#Label" type="number" value={item.no_label} onChange={e => handleFormItemChange(i, "no_label", e.target.value)}
                      className="px-2 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input placeholder="Jml" type="number" value={item.jumlah} min={0} step={0.001} onChange={e => handleFormItemChange(i, "jumlah", Number(e.target.value))}
                      className="px-2 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <select value={item.satuan} onChange={e => handleFormItemChange(i, "satuan", e.target.value)}
                      className="px-1 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                      {["gram","ml","liter","lembar","pcs","set","roll","kg","meter","box","drum","unit"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={item.metode} onChange={e => handleFormItemChange(i, "metode", e.target.value)}
                      className="px-1 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                      <option value="FEFO">FEFO</option>
                      <option value="FIFO">FIFO</option>
                    </select>
                    <select value={item.kondisi} onChange={e => handleFormItemChange(i, "kondisi", e.target.value)}
                      className="px-1 py-1.5 text-xs rounded bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                      <option value="BAIK">BAIK</option>
                      <option value="RUSAK">RUSAK</option>
                      <option value="PERLU_CEK">CEK</option>
                    </select>
                    {form.items.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Kolom: Kode · Nama Barang · No Batch · No Label · Jumlah · Satuan · Metode · Kondisi</p>
              <Button variant="outline" size="sm" className="mt-2 border-dashed"
                onClick={() => setForm(f => ({ ...f, items: [...f.items, { kode_barang: "", nama_barang: "", no_batch: "", no_label: "", jumlah: 1, satuan: "pcs", metode: "FIFO", kondisi: "BAIK" }] }))}>
                <Plus className="w-3 h-3 mr-1" /> Tambah Baris
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Catatan</label>
              <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2} placeholder="Catatan kondisi barang, dll..."
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.penerima || !form.dept_penerima}
              className="bg-primary hover:bg-primary/90">
              {createMut.isPending ? "Menyimpan..." : "Buat Dokumen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
