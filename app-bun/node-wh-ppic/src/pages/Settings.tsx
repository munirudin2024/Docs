import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { User as UserIcon, Shield, Laptop } from "lucide-react";

export default function Settings() {
  const user = auth.getUser();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium flex items-center">
            <UserIcon className="w-4 h-4 mr-3" /> Profil Saya
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground font-medium flex items-center transition-colors">
            <Laptop className="w-4 h-4 mr-3" /> Tampilan UI
          </button>
          {user?.role === "ADMIN" && (
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground font-medium flex items-center transition-colors">
              <Shield className="w-4 h-4 mr-3" /> Keamanan & API
            </button>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                <input type="text" disabled value={user?.name || ""} className="w-full px-3 py-2 rounded-md bg-secondary/30 border border-border/50 text-sm disabled:opacity-70" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <input type="text" disabled value={user?.username || ""} className="w-full px-3 py-2 rounded-md bg-secondary/30 border border-border/50 text-sm disabled:opacity-70" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <input type="text" disabled value={user?.role || ""} className="w-full px-3 py-2 rounded-md bg-secondary/30 border border-border/50 text-sm disabled:opacity-70 font-bold text-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Departemen</label>
                  <input type="text" disabled value={user?.department || ""} className="w-full px-3 py-2 rounded-md bg-secondary/30 border border-border/50 text-sm disabled:opacity-70" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50 mt-4 flex gap-3">
                <Button variant="outline" className="glass">Ubah Password</Button>
                <Button>Simpan Perubahan</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">WH-PPIC PRO</h3>
              <p className="text-sm text-muted-foreground mb-4">Version 2.1.0-build.85. Connected to Production DB.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
