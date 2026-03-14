import { useState } from "react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Thermometer, CheckSquare, Plus, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const GUDANG_LIST = Array.from({ length: 20 }, (_, i) => `GDG-${String(i + 1).padStart(2, "0")}`);

const CHECKLIST_ITEMS = ["lantai", "curtain", "jendela", "palet", "atap", "dinding"] as const;
type ChecklistItem = typeof CHECKLIST_ITEMS[number];

const CHECKLIST_LABELS: Record<ChecklistItem, string> = {
  lantai: "Lantai",
  curtain: "Curtain/Tirai",
  jendela: "Jendela",
  palet: "Palet",
  atap: "Atap",
  dinding: "Dinding",
};

const CHECKLIST_ICONS: Record<ChecklistItem, string> = {
  lantai: "🏗️", curtain: "🪟", jendela: "🔲", palet: "📦", atap: "🏠", dinding: "🧱",
};

interface SuhuRecord {
  id: number;
  gudang: string;
  tanggal: string;
  waktu: "13:00" | "15:00";
  suhu: number;
  petugas: string;
  status_suhu: "NORMAL" | "TERLALU_PANAS" | "TERLALU_DINGIN";
  catatan?: string;
}

interface KebersihanRecord {
  id: number;
  gudang: string;
  tanggal: string;
  petugas: string;
  checklist: Record<ChecklistItem, boolean>;
  catatan?: string;
  skor: number;
}

let mockSuhuDB: SuhuRecord[] = [
  { id: 1, gudang: "GDG-01", tanggal: "2025-03-14", waktu: "13:00", suhu: 22, petugas: "Andi Saputra", status_suhu: "NORMAL" },
  { id: 2, gudang: "GDG-01", tanggal: "2025-03-14", waktu: "15:00", suhu: 24, petugas: "Andi Saputra", status_suhu: "NORMAL" },
  { id: 3, gudang: "GDG-02", tanggal: "2025-03-14", waktu: "13:00", suhu: 19, petugas: "Budi Santoso", status_suhu: "NORMAL" },
  { id: 4, gudang: "GDG-03", tanggal: "2025-03-14", waktu: "13:00", suhu: 28, petugas: "Budi Santoso", status_suhu: "TERLALU_PANAS", catatan: "AC unit 3 mati" },
  { id: 5, gudang: "GDG-02", tanggal: "2025-03-14", waktu: "15:00", suhu: 20, petugas: "Andi Saputra", status_suhu: "NORMAL" },
  { id: 6, gudang: "GDG-05", tanggal: "2025-03-13", waktu: "13:00", suhu: 21, petugas: "Andi Saputra", status_suhu: "NORMAL" },
];

let mockKebersihanDB: KebersihanRecord[] = [
  {
    id: 1, gudang: "GDG-01", tanggal: "2025-03-14", petugas: "Andi Saputra",
    checklist: { lantai: true, curtain: true, jendela: true, palet: true, atap: true, dinding: false },
    skor: 83, catatan: "Dinding zona C perlu dicat ulang",
  },
  {
    id: 2, gudang: "GDG-02", tanggal: "2025-03-14", petugas: "Budi Santoso",
    checklist: { lantai: true, curtain: false, jendela: true, palet: true, atap: true, dinding: true },
    skor: 83,
  },
  {
    id: 3, gudang: "GDG-01", tanggal: "2025-03-13", petugas: "Andi Saputra",
    checklist: { lantai: true, curtain: true, jendela: true, palet: true, atap: true, dinding: true },
    skor: 100,
  },
];

const getSuhuStatus = (suhu: number): SuhuRecord["status_suhu"] => {
  if (suhu > 26) return "TERLALU_PANAS";
  if (suhu < 16) return "TERLALU_DINGIN";
  return "NORMAL";
};

const STATUS_SUHU_CFG = {
  NORMAL: { label: "Normal", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  TERLALU_PANAS: { label: "Terlalu Panas", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  TERLALU_DINGIN: { label: "Terlalu Dingin", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

export default function Pengecekan() {
  const user = auth.getUser();
  const qclient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"suhu" | "kebersihan">("suhu");
  const [filterGudang, setFilterGudang] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [isSuhuModalOpen, setIsSuhuModalOpen] = useState(false);
  const [isKebersModalOpen, setIsKebersModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [suhuForm, setSuhuForm] = useState({
    gudang: "GDG-01",
    waktu: "13:00" as "13:00" | "15:00",
    suhu: 22,
    catatan: "",
  });

  const [kebersForm, setKebersForm] = useState({
    gudang: "GDG-01",
    checklist: Object.fromEntries(CHECKLIST_ITEMS.map(k => [k, false])) as Record<ChecklistItem, boolean>,
    catatan: "",
  });

  const { data: suhuRecords = [] } = useQuery({
    queryKey: ["mock-suhu", filterGudang, filterTanggal],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      return mockSuhuDB.filter(r => {
        if (filterGudang && r.gudang !== filterGudang) return false;
        if (filterTanggal && r.tanggal !== filterTanggal) return false;
        return true;
      }).sort((a, b) => b.id - a.id);
    },
  });

  const { data: kebersihanRecords = [] } = useQuery({
    queryKey: ["mock-kebersihan", filterGudang, filterTanggal],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      return mockKebersihanDB.filter(r => {
        if (filterGudang && r.gudang !== filterGudang) return false;
        if (filterTanggal && r.tanggal !== filterTanggal) return false;
        return true;
      }).sort((a, b) => b.id - a.id);
    },
  });

  const createSuhuMut = useMutation({
    mutationFn: async (data: typeof suhuForm) => {
      await new Promise(r => setTimeout(r, 400));
      const status_suhu = getSuhuStatus(data.suhu);
      const rec: SuhuRecord = {
        id: Date.now(), gudang: data.gudang, tanggal: new Date().toISOString().split("T")[0],
        waktu: data.waktu, suhu: data.suhu, petugas: user?.name || "",
        status_suhu, catatan: data.catatan || undefined,
      };
      mockSuhuDB.unshift(rec);
      return rec;
    },
    onSuccess: () => { qclient.invalidateQueries({ queryKey: ["mock-suhu"] }); setIsSuhuModalOpen(false); },
  });

  const createKebersMut = useMutation({
    mutationFn: async (data: typeof kebersForm) => {
      await new Promise(r => setTimeout(r, 400));
      const passed = Object.values(data.checklist).filter(Boolean).length;
      const skor = Math.round((passed / CHECKLIST_ITEMS.length) * 100);
      const rec: KebersihanRecord = {
        id: Date.now(), gudang: data.gudang, tanggal: new Date().toISOString().split("T")[0],
        petugas: user?.name || "", checklist: data.checklist, skor,
        catatan: data.catatan || undefined,
      };
      mockKebersihanDB.unshift(rec);
      return rec;
    },
    onSuccess: () => { qclient.invalidateQueries({ queryKey: ["mock-kebersihan"] }); setIsKebersModalOpen(false); },
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySuhu13 = suhuRecords.find(r => r.tanggal === todayStr && r.waktu === "13:00");
  const todaySuhu15 = suhuRecords.find(r => r.tanggal === todayStr && r.waktu === "15:00");

  const avgSuhu = suhuRecords.length ? (suhuRecords.reduce((sum, r) => sum + r.suhu, 0) / suhuRecords.length).toFixed(1) : "-";
  const alertCount = suhuRecords.filter(r => r.status_suhu !== "NORMAL").length;
  const avgSkor = kebersihanRecords.length ? Math.round(kebersihanRecords.reduce((sum, r) => sum + r.skor, 0) / kebersihanRecords.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Thermometer className="w-6 h-6 text-primary" /> Pengecekan Gudang
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Monitoring suhu (13:00 & 15:00) · Checklist kebersihan harian</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-panel border border-border/50">
          <p className="text-xs text-muted-foreground">Rata-rata Suhu</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">{avgSuhu}°C</p>
        </Card>
        <Card className="p-4 glass-panel border border-border/50">
          <p className="text-xs text-muted-foreground">Pelanggaran Suhu</p>
          <p className={`text-2xl font-bold mt-1 ${alertCount > 0 ? "text-red-400" : "text-green-400"}`}>{alertCount}</p>
        </Card>
        <Card className="p-4 glass-panel border border-border/50">
          <p className="text-xs text-muted-foreground">Skor Kebersihan</p>
          <p className={`text-2xl font-bold mt-1 ${avgSkor >= 80 ? "text-green-400" : avgSkor >= 60 ? "text-yellow-400" : "text-red-400"}`}>
            {avgSkor > 0 ? `${avgSkor}%` : "-"}
          </p>
        </Card>
        <Card className="p-4 glass-panel border border-border/50">
          <p className="text-xs text-muted-foreground">Status Pengecekan Hari Ini</p>
          <div className="mt-1 space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              {todaySuhu13 ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-yellow-400" />}
              <span className={todaySuhu13 ? "text-green-400" : "text-yellow-400"}>Suhu 13:00 {todaySuhu13 ? "✓" : "Belum"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {todaySuhu15 ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-yellow-400" />}
              <span className={todaySuhu15 ? "text-green-400" : "text-yellow-400"}>Suhu 15:00 {todaySuhu15 ? "✓" : "Belum"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterGudang} onChange={e => setFilterGudang(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option value="">Semua Gudang</option>
          {GUDANG_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
        <Button variant="outline" size="sm" onClick={() => setFilterTanggal("")}>Semua Tanggal</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {([["suhu", "🌡️ Suhu"], ["kebersihan", "🧹 Kebersihan"]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Suhu Tab */}
      {activeTab === "suhu" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{suhuRecords.length} catatan suhu ditemukan</p>
            <Button onClick={() => setIsSuhuModalOpen(true)} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> Input Suhu
            </Button>
          </div>

          <div className="space-y-2">
            {suhuRecords.length === 0 ? (
              <Card className="glass-panel p-10 text-center">
                <Thermometer className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada data suhu untuk filter ini</p>
              </Card>
            ) : suhuRecords.map(r => {
              const cfg = STATUS_SUHU_CFG[r.status_suhu];
              return (
                <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="glass-panel border border-border/50">
                    <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold ${cfg.color}`}>
                          <span className="text-lg leading-tight">{r.suhu}°</span>
                          <span className="text-[9px] uppercase">{r.waktu}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm font-mono">{r.gudang}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.tanggal} · {r.waktu} · {r.petugas}</p>
                          {r.catatan && <p className="text-xs text-yellow-400 mt-0.5">⚠ {r.catatan}</p>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kebersihan Tab */}
      {activeTab === "kebersihan" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{kebersihanRecords.length} catatan kebersihan</p>
            <Button onClick={() => setIsKebersModalOpen(true)} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> Input Checklist
            </Button>
          </div>

          <div className="space-y-3">
            {kebersihanRecords.length === 0 ? (
              <Card className="glass-panel p-10 text-center">
                <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada data kebersihan</p>
              </Card>
            ) : kebersihanRecords.map(r => {
              const isExpanded = expandedId === r.id;
              const skorColor = r.skor >= 80 ? "text-green-400" : r.skor >= 60 ? "text-yellow-400" : "text-red-400";
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="glass-panel border border-border/50 overflow-hidden">
                    <div className="p-4 flex items-center justify-between gap-4 cursor-pointer flex-wrap"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/50 flex flex-col items-center justify-center">
                          <span className={`text-base font-bold leading-tight ${skorColor}`}>{r.skor}%</span>
                          <span className="text-[9px] text-muted-foreground">Skor</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm font-mono">{r.gudang}</p>
                          <p className="text-xs text-muted-foreground">{r.tanggal} · {r.petugas}</p>
                          <div className="flex gap-1 mt-1">
                            {CHECKLIST_ITEMS.map(k => (
                              <span key={k} title={CHECKLIST_LABELS[k]}
                                className={`w-5 h-5 text-sm flex items-center justify-center rounded ${r.checklist[k] ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                {CHECKLIST_ICONS[k]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 pb-4 pt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CHECKLIST_ITEMS.map(k => (
                            <div key={k} className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${r.checklist[k] ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                              <span className="text-base">{CHECKLIST_ICONS[k]}</span>
                              <div>
                                <p className="font-medium text-xs">{CHECKLIST_LABELS[k]}</p>
                                <p className="text-[10px]">{r.checklist[k] ? "✓ Bersih" : "✗ Perlu Perhatian"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {r.catatan && <p className="text-xs text-muted-foreground mt-3"><span className="font-medium">Catatan:</span> {r.catatan}</p>}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Input Suhu */}
      <Dialog open={isSuhuModalOpen} onOpenChange={setIsSuhuModalOpen}>
        <DialogContent className="max-w-sm glass-panel border border-border/50">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-primary" /> Input Suhu Gudang</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gudang</label>
              <select value={suhuForm.gudang} onChange={e => setSuhuForm(f => ({ ...f, gudang: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                {GUDANG_LIST.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Waktu Pengecekan</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["13:00", "15:00"] as const).map(w => (
                  <button key={w} onClick={() => setSuhuForm(f => ({ ...f, waktu: w }))}
                    className={`py-2 text-sm rounded-md border font-medium transition-colors ${suhuForm.waktu === w ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 border-border/50 hover:border-primary/50"}`}>
                    🕐 {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Suhu (°C)</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="number" value={suhuForm.suhu} min={0} max={60} step={0.1}
                  onChange={e => setSuhuForm(f => ({ ...f, suhu: Number(e.target.value) }))}
                  className="flex-1 px-3 py-2 text-2xl font-bold rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-center" />
                <span className="text-2xl font-bold text-muted-foreground">°C</span>
              </div>
              {suhuForm.suhu > 26 && <p className="text-xs text-red-400 mt-1">⚠ Suhu terlalu panas! (target &lt; 26°C)</p>}
              {suhuForm.suhu < 16 && <p className="text-xs text-blue-400 mt-1">⚠ Suhu terlalu dingin! (target &gt; 16°C)</p>}
              {suhuForm.suhu >= 16 && suhuForm.suhu <= 26 && <p className="text-xs text-green-400 mt-1">✓ Suhu dalam batas normal</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Catatan (jika ada masalah)</label>
              <input value={suhuForm.catatan} onChange={e => setSuhuForm(f => ({ ...f, catatan: e.target.value }))}
                placeholder="Opsional..."
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <p className="text-xs text-muted-foreground bg-secondary/30 rounded p-2">
              Petugas: <strong>{user?.name}</strong> · Tanggal: <strong>{new Date().toLocaleDateString("id-ID")}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuhuModalOpen(false)}>Batal</Button>
            <Button onClick={() => createSuhuMut.mutate(suhuForm)} disabled={createSuhuMut.isPending} className="bg-primary hover:bg-primary/90">
              {createSuhuMut.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Checklist Kebersihan */}
      <Dialog open={isKebersModalOpen} onOpenChange={setIsKebersModalOpen}>
        <DialogContent className="max-w-sm glass-panel border border-border/50">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Checklist Kebersihan</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gudang</label>
              <select value={kebersForm.gudang} onChange={e => setKebersForm(f => ({ ...f, gudang: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
                {GUDANG_LIST.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Checklist Kebersihan</label>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map(k => (
                  <label key={k} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${kebersForm.checklist[k] ? "bg-green-500/10 border-green-500/40 text-green-400" : "bg-secondary/30 border-border/40 hover:border-border/70"}`}>
                    <input type="checkbox" checked={kebersForm.checklist[k]}
                      onChange={e => setKebersForm(f => ({ ...f, checklist: { ...f.checklist, [k]: e.target.checked } }))}
                      className="w-4 h-4 accent-green-500" />
                    <span className="text-base">{CHECKLIST_ICONS[k]}</span>
                    <span className="font-medium text-sm">{CHECKLIST_LABELS[k]}</span>
                    <span className="ml-auto text-xs">{kebersForm.checklist[k] ? "✓ Bersih" : "—"}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Terpenuhi: {Object.values(kebersForm.checklist).filter(Boolean).length}/{CHECKLIST_ITEMS.length} item
                ({Math.round(Object.values(kebersForm.checklist).filter(Boolean).length / CHECKLIST_ITEMS.length * 100)}%)
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Catatan</label>
              <textarea value={kebersForm.catatan} onChange={e => setKebersForm(f => ({ ...f, catatan: e.target.value }))} rows={2}
                placeholder="Area yang perlu tindak lanjut..."
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKebersModalOpen(false)}>Batal</Button>
            <Button onClick={() => createKebersMut.mutate(kebersForm)} disabled={createKebersMut.isPending} className="bg-primary hover:bg-primary/90">
              {createKebersMut.isPending ? "Menyimpan..." : "Simpan Checklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
