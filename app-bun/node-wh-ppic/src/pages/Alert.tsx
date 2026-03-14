import { useMockAlerts, useUpdateMockAlertStatus, useMarkAllAlertsRead } from "@/hooks/use-mock-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default function Alert() {
  const { data: alerts, isLoading } = useMockAlerts();
  const updateStatus = useUpdateMockAlertStatus();
  const markAll = useMarkAllAlertsRead();

  const getIcon = (type: string) => {
    switch(type) {
      case "CRITICAL": return <AlertTriangle className="w-6 h-6 text-destructive" />;
      case "WARNING": return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "INFO": return <Info className="w-6 h-6 text-blue-500" />;
      default: return <Bell className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Notifikasi & Alerts</h1>
        <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending} className="glass">
          <Check className="w-4 h-4 mr-2" /> Tandai Semua Dibaca
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat notifikasi...</div>
        ) : alerts?.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">Tidak ada notifikasi</div>
        ) : (
          alerts?.map((alert) => (
            <Card key={alert.id} className={cn(
              "glass-panel transition-all overflow-hidden",
              alert.status === "UNREAD" ? "border-l-4 border-l-primary bg-primary/5" : "opacity-80"
            )}>
              <CardContent className="p-4 sm:p-6 flex gap-4">
                <div className="shrink-0 mt-1">{getIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("font-semibold text-base", alert.status === "UNREAD" ? "text-foreground" : "text-foreground/80")}>
                      {alert.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">{formatDate(alert.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                  
                  {alert.status !== "RESOLVED" && (
                    <div className="flex gap-2 mt-2">
                      {alert.status === "UNREAD" && (
                        <Button size="sm" variant="secondary" className="h-8 text-xs bg-background/50 hover:bg-background" onClick={() => updateStatus.mutate({ id: alert.id, status: "READ" })}>
                          Tandai Dibaca
                        </Button>
                      )}
                      {(alert.type === "CRITICAL" || alert.type === "WARNING") && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => updateStatus.mutate({ id: alert.id, status: "RESOLVED" })}>
                          Selesaikan Isu
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
