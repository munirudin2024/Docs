import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Barang from "./pages/Barang";
import Supplier from "./pages/Supplier";
import Stok from "./pages/Stok";
import Users from "./pages/Users";
import Alert from "./pages/Alert";
import Settings from "./pages/Settings";
import Permintaan from "./pages/Permintaan";
import SerahTerima from "./pages/SerahTerima";
import Gudang from "./pages/Gudang";
import Pengecekan from "./pages/Pengecekan";
import { AppLayout } from "./components/layout/AppLayout";
import { auth } from "./lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();
  const user = auth.getUser();

  useEffect(() => {
    if (!user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, location, setLocation]);

  if (!user) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const user = auth.getUser();

  useEffect(() => {
    if (location === "/") {
      setLocation(user ? "/dashboard" : "/login");
    }
  }, [location, user, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/barang"><ProtectedRoute component={Barang} /></Route>
      <Route path="/supplier"><ProtectedRoute component={Supplier} /></Route>
      <Route path="/stok"><ProtectedRoute component={Stok} /></Route>
      <Route path="/users"><ProtectedRoute component={Users} /></Route>
      <Route path="/alert"><ProtectedRoute component={Alert} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      <Route path="/permintaan"><ProtectedRoute component={Permintaan} /></Route>
      <Route path="/serah-terima"><ProtectedRoute component={SerahTerima} /></Route>
      <Route path="/gudang"><ProtectedRoute component={Gudang} /></Route>
      <Route path="/pengecekan"><ProtectedRoute component={Pengecekan} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
