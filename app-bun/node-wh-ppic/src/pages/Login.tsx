import { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Boxes, Lock, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 800));
    
    const user = auth.login(username, password);
    setIsLoading(false);
    
    if (user) {
      toast({ title: "Login Berhasil", description: `Selamat datang, ${user.name}` });
      setLocation("/dashboard");
    } else {
      toast({ variant: "destructive", title: "Login Gagal", description: "Username atau password salah" });
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-background overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Warehouse Tech Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md p-8 rounded-3xl glass shadow-2xl border border-white/10 relative overflow-hidden"
      >
        {/* Glow effect behind card */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <Boxes className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow mb-2">WH-PPIC PRO</h1>
          <p className="text-muted-foreground text-sm">Smart Warehouse & Production Control</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 pl-1">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                placeholder="admin / wh_staff / ppic"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 mt-4"
          >
            {isLoading ? "Authenticating..." : "Masuk ke Sistem"}
          </Button>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Login: admin/admin123 · wh_staff · ppic · qc · security · prod · mtc (password: 123)
          </div>
        </form>
      </motion.div>
    </div>
  );
}
