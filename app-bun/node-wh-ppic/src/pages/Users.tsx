import { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { useMockUsers, useCreateMockUser, useUpdateMockUser, useDeleteMockUser, MockUser } from "@/hooks/use-mock-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Shield, UserX, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Users() {
  const [, setLocation] = useLocation();
  const user = auth.getUser();
  
  if (user?.role !== "ADMIN") {
    // Basic redirect guard
    setLocation("/dashboard");
    return null;
  }

  const { data: users, isLoading } = useMockUsers();
  const createMut = useCreateMockUser();
  const updateMut = useUpdateMockUser();
  const deleteMut = useDeleteMockUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MockUser>>({});

  const handleOpen = (user?: MockUser) => {
    if(user) {
      setFormData(user);
    } else {
      setFormData({ username: "", name: "", email: "", role: "WH_STAFF", department: "Gudang", is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (formData.id) {
      updateMut.mutate({ id: formData.id, ...formData });
    } else {
      createMut.mutate(formData as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Manajemen Pengguna
        </h1>
        <Button onClick={() => handleOpen()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Tambah User
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role & Dept</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last Login</th>
              <th className="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Memuat users...</td></tr>
            ) : (
              users?.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email} • @{u.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 mr-2">{u.role}</span>
                    <span className="text-xs text-muted-foreground">{u.department}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? 
                      <span className="flex items-center text-xs text-emerald-500 font-medium"><CheckCircle2 className="w-3 h-3 mr-1"/> Aktif</span> : 
                      <span className="flex items-center text-xs text-destructive font-medium"><UserX className="w-3 h-3 mr-1"/> Nonaktif</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.last_login}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => handleOpen(u)} className="p-1.5 text-blue-500 hover:bg-blue-500/20 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                      {u.username !== "admin" && (
                        <button onClick={() => deleteMut.mutate(u.id)} className="p-1.5 text-destructive hover:bg-destructive/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass border border-border">
          <DialogHeader><DialogTitle>{formData.id ? "Edit User" : "Tambah User"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Username</label>
                <input value={formData.username || ''} disabled={!!formData.id} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:ring-1 focus:ring-primary outline-none disabled:opacity-50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <select value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:ring-1 focus:ring-primary outline-none">
                  <option value="ADMIN">ADMIN</option>
                  <option value="WH_SUPERVISOR">WH_SUPERVISOR</option>
                  <option value="WH_STAFF">WH_STAFF</option>
                  <option value="PPIC">PPIC</option>
                  <option value="QC">QC</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="BYPRODUCT">BYPRODUCT</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="MIXING">MIXING</option>
                  <option value="PACKING1">PACKING1</option>
                  <option value="PACKING25">PACKING25</option>
                  <option value="MILLING">MILLING</option>
                  <option value="INTAKE">INTAKE</option>
                  <option value="PGA">PGA</option>
                  <option value="FPS">FPS</option>
                  <option value="PESTCONTROL">PESTCONTROL</option>
                  <option value="OB">OB</option>
                  <option value="RND">RND</option>
                  <option value="SUPPLIER">SUPPLIER</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="K3">K3</option>
                  <option value="SAFETY">SAFETY</option>
                  <option value="PREMIX">PREMIX</option>
                  <option value="BDS">BDS</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center h-10">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="mr-2" />
                  <span className="text-sm">Aktif</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
