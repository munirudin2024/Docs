import { useState } from "react";
import { useListStok, useListStokExpired } from "@/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stok() {
  const [activeTab, setActiveTab] = useState<"harian" | "expired">("harian");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const { data: stokRes, isLoading: isLoadingStok, refetch: refetchStok } = useListStok();
  const { data: expRes, isLoading: isLoadingExp, refetch: refetchExp } = useListStokExpired();

  const handleRefresh = () => {
    refetchStok();
    refetchExp();
  };

  const filteredStok = filterStatus === "ALL" ? (stokRes || []) : (stokRes || []).filter((s: any) => s.status_stok === filterStatus);

  const getRowClass = (status: string | null | undefined) => {
    switch(status) {
      case "HABIS": return "bg-destructive/10 hover:bg-destructive/20";
      case "HAMPIR HABIS": return "bg-yellow-500/10 hover:bg-yellow-500/20";
      case "PERHATIAN": return "bg-orange-500/10 hover:bg-orange-500/20";
      default: return "hover:bg-secondary/20";
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch(status) {
      case "HABIS": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive-foreground">HABIS</span>;
      case "HAMPIR HABIS": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-white">HAMPIR HABIS</span>;
      case "PERHATIAN": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">PERHATIAN</span>;
      case "AMAN": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">AMAN</span>;
      default: return null;
    }
  };

  const getExpiredColor = (days: number | null | undefined) => {
    if (days === null || days === undefined) return "bg-secondary text-secondary-foreground";
    if (days < 0) return "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/50 animate-pulse";
    if (days <= 15) return "bg-orange-500 text-white";
    if (days <= 30) return "bg-yellow-500 text-white";
    return "bg-secondary text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Monitoring Stok & Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="glass border-border/50 hover:bg-secondary">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("harian")}
          className={cn("px-6 py-3 font-medium text-sm transition-all border-b-2", activeTab === "harian" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          Stok Harian
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={cn("px-6 py-3 font-medium text-sm transition-all border-b-2 flex items-center gap-2", activeTab === "expired" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          Barang Hampir Expired
          {(expRes && expRes.length > 0) && <span className="bg-destructive text-[10px] text-white px-2 py-0.5 rounded-full">{expRes.length}</span>}
        </button>
      </div>

      <Card className="glass-panel p-4">
        {activeTab === "harian" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="relative w-48 shrink-0">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AMAN">AMAN</option>
                  <option value="PERHATIAN">PERHATIAN</option>
                  <option value="HAMPIR HABIS">HAMPIR HABIS</option>
                  <option value="HABIS">HABIS</option>
                </select>
              </div>
              <div className="text-xs text-muted-foreground flex gap-4">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-destructive rounded-sm" /> Habis</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded-sm" /> Hampir Habis</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Gudang / Zona</th>
                    <th className="px-4 py-3 font-semibold">Barang</th>
                    <th className="px-4 py-3 font-semibold text-right">Tersedia</th>
                    <th className="px-4 py-3 font-semibold text-right">Reserved</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {isLoadingStok ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Memuat data stok...</td></tr>
                  ) : filteredStok.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data stok</td></tr>
                  ) : (
                    filteredStok.map((item: any, idx: number) => (
                      <tr key={idx} className={cn("transition-colors", getRowClass(item.status_stok))}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.nama_gudang}</div>
                          <div className="text-xs text-muted-foreground">{item.nama_zona}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.nama_barang}</div>
                          <div className="font-mono text-xs text-muted-foreground">{item.kode_barang}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{item.stok_tersedia} <span className="text-xs text-muted-foreground font-normal">{item.satuan}</span></td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{item.stok_reserved}</td>
                        <td className="px-4 py-3 text-right font-bold">{item.stok_total}</td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(item.status_stok)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "expired" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-lg flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Perhatian Expired Date</h4>
                <p className="text-sm opacity-90 mt-1">Barang-barang di bawah ini akan atau sudah expired. Harap lakukan isolasi atau pemusnahan sesuai prosedur.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Barang</th>
                    <th className="px-4 py-3 font-semibold">Gudang / Lokasi</th>
                    <th className="px-4 py-3 font-semibold text-center">Batch / Label</th>
                    <th className="px-4 py-3 font-semibold text-right">Jumlah</th>
                    <th className="px-4 py-3 font-semibold text-center">Tgl Expired</th>
                    <th className="px-4 py-3 font-semibold text-center">Sisa Hari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {isLoadingExp ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Memuat data expired...</td></tr>
                  ) : (expRes || []).length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada barang yang akan expired</td></tr>
                  ) : (
                    expRes?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.nama_barang}</div>
                          <div className="font-mono text-xs text-muted-foreground">{item.kode_barang}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{item.nama_gudang}</div>
                          <div className="text-xs text-muted-foreground">{item.kode_lokasi}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-mono">{item.no_batch}</div>
                          <div className="text-[10px] text-muted-foreground">Lbl: {item.no_label}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{item.jumlah}</td>
                        <td className="px-4 py-3 text-center">{item.tanggal_expired}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold", getExpiredColor(item.sisa_hari))}>
                            {(item.sisa_hari||0) < 0 ? "EXPIRED" : `${item.sisa_hari} hari`}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
