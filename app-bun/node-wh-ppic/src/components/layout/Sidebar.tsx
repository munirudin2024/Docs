import { Link, useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { 
  LayoutDashboard, Package, Truck, Boxes, 
  Settings, Users, LogOut, Search, 
  Warehouse, Factory, ShieldAlert, BarChart3,
  QrCode, ClipboardCheck, Thermometer, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMockAlerts } from "@/hooks/use-mock-api";

export function Sidebar() {
  const [location] = useLocation();
  const user = auth.getUser();
  const { data: alerts } = useMockAlerts();
  
  const unreadAlerts = alerts?.filter(a => a.status === "UNREAD").length || 0;

  if (!user) return null;

  const menuGroups = [
    {
      label: "DASHBOARD",
      roles: ["ADMIN", "WH_SUPERVISOR", "WH_STAFF", "PPIC", "QC", "SECURITY", "BYPRODUCT", "MAINTENANCE", "MIXING", "PACKING1", "PACKING25", "MILLING", "INTAKE", "PGA", "FPS", "PESTCONTROL", "OB", "RND", "SUPPLIER", "CIVIL", "K3", "SAFETY", "PREMIX", "BDS"],
      items: [
        { title: "Overview", icon: LayoutDashboard, path: "/dashboard" }
      ]
    },
    {
      label: "MASTER DATA",
      roles: ["ADMIN", "WH_SUPERVISOR", "PPIC"],
      items: [
        { title: "Data Barang", icon: Package, path: "/barang" },
        { title: "Data Supplier", icon: Truck, path: "/supplier" },
      ]
    },
    {
      label: "STOK & INVENTORY",
      roles: ["ADMIN", "WH_SUPERVISOR", "WH_STAFF", "PPIC", "BYPRODUCT", "MAINTENANCE", "MIXING", "PACKING1", "PACKING25", "MILLING", "INTAKE", "PGA", "FPS", "PESTCONTROL", "OB", "RND", "SUPPLIER", "CIVIL", "K3", "SAFETY", "PREMIX", "BDS"],
      items: [
        { title: "Stok Harian", icon: Boxes, path: "/stok" },
        { title: "Stock Opname", icon: Warehouse, path: "/stock-opname", disabled: true },
      ]
    },
    {
      label: "SERAH TERIMA",
      roles: ["ADMIN", "WH_SUPERVISOR", "WH_STAFF", "PPIC", "QC", "SECURITY", "BYPRODUCT", "MAINTENANCE", "MIXING", "PACKING1", "PACKING25", "MILLING", "INTAKE", "PGA", "FPS", "PESTCONTROL", "OB", "RND", "SUPPLIER", "CIVIL", "K3", "SAFETY", "PREMIX", "BDS"],
      items: [
        { title: "Serah Terima Barang", icon: ClipboardCheck, path: "/serah-terima" },
      ]
    },
    {
      label: "GUDANG",
      roles: ["ADMIN", "WH_SUPERVISOR", "WH_STAFF", "QC", "PPIC", "SECURITY", "BYPRODUCT", "MAINTENANCE", "MIXING", "PACKING1", "PACKING25", "MILLING", "INTAKE", "PGA", "FPS", "PESTCONTROL", "OB", "RND", "SUPPLIER", "CIVIL", "K3", "SAFETY", "PREMIX", "BDS"],
      items: [
        { title: "20 Gudang & QR Code", icon: Warehouse, path: "/gudang" },
        { title: "Pengecekan Suhu & Kebersihan", icon: Thermometer, path: "/pengecekan" },
        { title: "Penerimaan Barang", icon: QrCode, path: "/penerimaan", disabled: true },
        { title: "Transaksi Masuk", icon: Search, path: "/transaksi-masuk", disabled: true },
      ]
    },
    {
      label: "PRODUKSI & MAINTENANCE",
      roles: ["ADMIN", "PPIC", "BYPRODUCT", "MAINTENANCE", "MIXING", "PACKING1", "PACKING25", "MILLING", "INTAKE", "PGA", "FPS", "PESTCONTROL", "OB", "RND", "CIVIL", "K3", "SAFETY", "PREMIX", "BDS"],
      items: [
        { title: "Jadwal Produksi", icon: Factory, path: "/jadwal-produksi", disabled: true },
        { title: "Permintaan Barang", icon: ClipboardList, path: "/permintaan" },
      ]
    },
    {
      label: "LAPORAN & ANALITIK",
      roles: ["ADMIN", "WH_SUPERVISOR", "PPIC"],
      items: [
        { title: "Analitik", icon: BarChart3, path: "/analitik", disabled: true },
        { title: "Alerts & Notifikasi", icon: ShieldAlert, path: "/alert", badge: unreadAlerts } as any,
      ]
    },
    {
      label: "SISTEM",
      roles: ["ADMIN"],
      items: [
        { title: "Users & Roles", icon: Users, path: "/users" },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen border-r border-border bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-20 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0 bg-sidebar-accent/30 backdrop-blur">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Boxes className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-lg tracking-tight text-glow">WH-PPIC <span className="text-primary font-black">PRO</span></h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {menuGroups.filter(g => auth.hasAccess(user.role, g.roles as any)).map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item, i) => {
                const isActive = location === item.path;
                return item.disabled ? (
                  <div key={i} className="flex items-center px-3 py-2 text-sm text-sidebar-foreground/30 rounded-md cursor-not-allowed">
                    <item.icon className="w-4 h-4 mr-3 opacity-50" />
                    {item.title}
                  </div>
                ) : (
                  <Link key={i} href={item.path} className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <item.icon className={cn("w-4 h-4 mr-3 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                    {item.title}
                    {!!item.badge && item.badge > 0 && (
                      <span className={cn(
                        "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isActive ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Always show settings for all logged in users */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            PREFERENCES
          </h3>
          <Link href="/settings" className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
            location === "/settings" 
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}>
            <Settings className="w-4 h-4 mr-3 group-hover:rotate-45 transition-transform" />
            Pengaturan
          </Link>
        </div>
      </div>

      <div className="p-4 border-t border-border/50 bg-sidebar-accent/10 backdrop-blur shrink-0">
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-border/50"
          onClick={() => auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
