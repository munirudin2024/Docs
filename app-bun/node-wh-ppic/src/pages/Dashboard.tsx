import { useListStok, useListBarang, useListSupplier, useListStokExpired } from "@/hooks/use-api";
import { Package, Truck, AlertTriangle, ShieldCheck, Clock, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { data: barangRes } = useListBarang();
  const { data: stokRes } = useListStok();
  const { data: supplierRes } = useListSupplier();
  const { data: expiredRes } = useListStokExpired();

  // Computations
  const totalBarang = barangRes?.length || 0;
  const stokData = stokRes || [];
  
  const stokAman = stokData.filter((s: any) => s.status_stok === "AMAN").length;
  const stokHampirHabis = stokData.filter((s: any) => s.status_stok === "HAMPIR HABIS").length;
  const stokHabis = stokData.filter((s: any) => s.status_stok === "HABIS").length;
  
  const totalExpiredSoon = expiredRes?.filter((e: any) => (e.sisa_hari || 0) <= 30).length || 0;
  const totalSupplier = supplierRes?.length || 0;

  // Chart Data prep
  const pieData = [
    { name: "Aman", value: stokAman || 1, color: "hsl(var(--chart-2))" },
    { name: "Hampir Habis", value: stokHampirHabis || 0, color: "hsl(var(--chart-3))" },
    { name: "Habis", value: stokHabis || 0, color: "hsl(var(--chart-5))" },
  ];

  const mockBarData = [
    { name: "Jan", In: 4000, Out: 2400 },
    { name: "Feb", In: 3000, Out: 1398 },
    { name: "Mar", In: 2000, Out: 9800 },
    { name: "Apr", In: 2780, Out: 3908 },
    { name: "Mei", In: 1890, Out: 4800 },
    { name: "Jun", In: 2390, Out: 3800 },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <Card className="glass-panel overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon className="w-16 h-16" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('/10', '').replace('/20', '')}`} />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
        <p className="font-medium text-sm text-foreground/80">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Barang" value={totalBarang} subtitle="Item terdaftar" icon={Package} colorClass="text-primary bg-primary" />
        <StatCard title="Stok Aman" value={stokAman} subtitle="Level optimal" icon={ShieldCheck} colorClass="text-emerald-500 bg-emerald-500" />
        <StatCard title="Hampir Habis" value={stokHampirHabis} subtitle="Perlu reorder" icon={AlertTriangle} colorClass="text-yellow-500 bg-yellow-500" />
        <StatCard title="Stok Habis" value={stokHabis} subtitle="Segera beli!" icon={Layers} colorClass="text-destructive bg-destructive" />
        <StatCard title="Mau Expired" value={totalExpiredSoon} subtitle="< 30 hari" icon={Clock} colorClass="text-orange-500 bg-orange-500" />
        <StatCard title="Supplier Aktif" value={totalSupplier} subtitle="Partner" icon={Truck} colorClass="text-blue-400 bg-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribusi Status Stok</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Transaksi Keluar / Masuk (6 Bulan)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Bar dataKey="In" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Out" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Daftar Stok Kritis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Kode</th>
                    <th className="pb-3 font-medium">Barang</th>
                    <th className="pb-3 font-medium">Sisa</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stokData.filter(s => s.status_stok === "HABIS" || s.status_stok === "HAMPIR HABIS").slice(0, 5).map((s, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="py-3">{s.kode_barang}</td>
                      <td className="py-3 font-medium">{s.nama_barang}</td>
                      <td className="py-3">{s.stok_tersedia} {s.satuan}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          s.status_stok === "HABIS" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {s.status_stok}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stokData.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Tidak ada stok kritis</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Hampir Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Barang</th>
                    <th className="pb-3 font-medium">Batch</th>
                    <th className="pb-3 font-medium text-right">Sisa Hari</th>
                  </tr>
                </thead>
                <tbody>
                  {(expiredRes || []).slice(0, 5).map((e: any, i: number) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="py-3 font-medium">{e.nama_barang}</td>
                      <td className="py-3 text-muted-foreground">{e.no_batch}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          (e.sisa_hari||0) < 0 ? "bg-destructive/20 text-destructive" :
                          (e.sisa_hari||0) <= 30 ? "bg-orange-500/20 text-orange-500" :
                          "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {e.sisa_hari} hari
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!expiredRes || expiredRes.length === 0) && (
                    <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Semua barang aman</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
