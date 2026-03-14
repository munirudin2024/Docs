import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useMockAlerts } from "@/hooks/use-mock-api";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { data: alerts } = useMockAlerts();
  
  useEffect(() => {
    if (!auth.getUser()) {
      setLocation("/login");
    }
  }, [location, setLocation]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("wh_ppic_theme", newTheme);
  };

  if (!auth.getUser()) return null;
  const unreadAlerts = alerts?.filter(a => a.status === "UNREAD").length || 0;

  const pageTitle = location.split("/")[1]?.toUpperCase() || "DASHBOARD";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background/95 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative">
        
        {/* Topbar */}
        <header className="h-16 border-b border-border/40 glass px-6 flex items-center justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold tracking-tight opacity-80">{pageTitle}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Cari sesuatu..." 
                className="w-64 pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              />
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors border border-border/50"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            
            <button 
              onClick={() => setLocation("/alert")}
              className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors border border-border/50 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
