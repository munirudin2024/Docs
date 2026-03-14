import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Warehouse, QrCode, Thermometer, Package, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

interface GudangData {
  id: number;
  kode: string;
  nama: string;
  jenis: string;
  kapasitas: number;
  is_active: boolean;
  suhu_target: string;
  zona: string;
}

const GUDANG_LIST: GudangData[] = Array.from({ length: 20 }, (_, i) => {
  const idx = i + 1;
  const types = [
    { jenis: "Bahan Baku", zona: "Raw Material", suhu_target: "18–25°C" },
    { jenis: "Produk Jadi", zona: "Finished Good", suhu_target: "15–22°C" },
    { jenis: "Bahan Kimia", zona: "Chemical", suhu_target: "10–20°C" },
    { jenis: "Spare Part", zona: "Maintenance", suhu_target: "Ambient" },
    { jenis: "Karantina", zona: "Quarantine", suhu_target: "18–25°C" },
  ];
  const t = types[(i) % types.length];
  return {
    id: idx,
    kode: `GDG-${String(idx).padStart(2, "0")}`,
    nama: `Gudang ${t.jenis} ${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
    jenis: t.jenis,
    kapasitas: [500, 750, 1000, 1200, 2000][i % 5],
    is_active: i !== 13 && i !== 17,
    suhu_target: t.suhu_target,
    zona: t.zona,
  };
});

const JENIS_COLORS: Record<string, string> = {
  "Bahan Baku": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Produk Jadi": "bg-green-500/20 text-green-400 border-green-500/30",
  "Bahan Kimia": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Spare Part": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Karantina": "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function Gudang() {
  const [qrTarget, setQrTarget] = useState<GudangData | null>(null);
  const [filter, setFilter] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const baseUrl = window.location.origin;

  const filtered = GUDANG_LIST.filter(g => {
    if (filterJenis && g.jenis !== filterJenis) return false;
    if (filter) {
      const q = filter.toLowerCase();
      return g.kode.toLowerCase().includes(q) || g.nama.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePrintQR = () => {
    if (!qrTarget) return;
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>QR Code - ${qrTarget.kode}</title>
      <style>
        body { font-family: Arial, sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#fff; }
        .container { text-align:center; padding:30px; border:3px solid #1E3A5F; border-radius:16px; max-width:300px; }
        h2 { color:#1E3A5F; margin:0 0 4px; font-size:22px; }
        p { color:#555; margin:4px 0; font-size:13px; }
        .code { font-size:28px; font-weight:bold; color:#1E3A5F; margin:8px 0; letter-spacing:2px; }
        svg { margin:16px 0; }
        .footer { font-size:11px; color:#888; margin-top:8px; }
        @media print { body { print-color-adjust:exact; } }
      </style>
      </head><body>
      <div class="container">
        <h2>WH-PPIC PRO</h2>
        <div class="code">${qrTarget.kode}</div>
        <p>${qrTarget.nama}</p>
        <p>${qrTarget.jenis} · ${qrTarget.zona}</p>
        ${svgData}
        <p>Kapasitas: ${qrTarget.kapasitas.toLocaleString("id-ID")} unit</p>
        <p>Suhu Target: ${qrTarget.suhu_target}</p>
        <div class="footer">Scan untuk cek stok online</div>
      </div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Warehouse className="w-6 h-6 text-primary" /> Manajemen Gudang
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {GUDANG_LIST.filter(g => g.is_active).length} gudang aktif · Klik kartu untuk detail · Cetak QR untuk kontrol stok online
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {["Bahan Baku", "Produk Jadi", "Bahan Kimia", "Spare Part", "Karantina"].map(jenis => (
          <Card key={jenis} className="p-3 glass-panel border border-border/50 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setFilterJenis(filterJenis === jenis ? "" : jenis)}>
            <p className="text-xs text-muted-foreground">{jenis}</p>
            <p className="text-xl font-bold mt-1">{GUDANG_LIST.filter(g => g.jenis === jenis).length}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Cari kode / nama gudang..."
          className="flex-1 min-w-48 max-w-64 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option value="">Semua Jenis</option>
          {["Bahan Baku", "Produk Jadi", "Bahan Kimia", "Spare Part", "Karantina"].map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      {/* Gudang Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(g => (
          <motion.div key={g.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: g.id * 0.02 }}>
            <Card className={`glass-panel border transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${g.is_active ? "border-border/50" : "border-border/20 opacity-50"}`}>
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono font-bold text-primary text-lg">{g.kode}</p>
                    <p className="text-sm font-medium mt-0.5 leading-tight">{g.nama}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${JENIS_COLORS[g.jenis] || "bg-secondary text-secondary-foreground border-border"}`}>
                    {g.is_active ? "AKTIF" : "NONAKTIF"}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Jenis</span>
                    <span className={`font-medium px-1.5 py-0.5 rounded text-[10px] border ${JENIS_COLORS[g.jenis] || ""}`}>{g.jenis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zona</span><span className="font-medium text-foreground">{g.zona}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />Suhu</span>
                    <span className="font-medium text-foreground">{g.suhu_target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />Kapasitas</span>
                    <span className="font-medium text-foreground">{g.kapasitas.toLocaleString("id-ID")} unit</span>
                  </div>
                </div>

                {/* QR Button */}
                <Button size="sm" variant="outline" className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/10 text-xs"
                  onClick={() => setQrTarget(g)}>
                  <QrCode className="w-3 h-3 mr-1.5" /> Lihat & Cetak QR
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* QR Modal */}
      <Dialog open={!!qrTarget} onOpenChange={() => setQrTarget(null)}>
        <DialogContent className="max-w-sm glass-panel border border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> QR Code Gudang
            </DialogTitle>
          </DialogHeader>
          {qrTarget && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="font-mono font-bold text-2xl text-primary">{qrTarget.kode}</p>
                <p className="text-sm font-medium">{qrTarget.nama}</p>
                <p className="text-xs text-muted-foreground">{qrTarget.jenis} · {qrTarget.zona}</p>
              </div>

              <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={`${baseUrl}/stok?gudang=${encodeURIComponent(qrTarget.nama)}&kode=${qrTarget.kode}`}
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: "", height: 24, width: 24, excavate: true
                  }}
                />
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-0.5 bg-secondary/30 rounded-lg p-3">
                <p>Scan QR → Cek stok <strong>{qrTarget.kode}</strong> online</p>
                <p>Tempel di pintu gudang untuk akses cepat</p>
                <p className="font-mono text-[10px] truncate opacity-60">{`${baseUrl}/stok?kode=${qrTarget.kode}`}</p>
              </div>

              <Button onClick={handlePrintQR} className="w-full bg-primary hover:bg-primary/90">
                <Printer className="w-4 h-4 mr-2" /> Cetak QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
