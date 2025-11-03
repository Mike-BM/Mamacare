import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Users, AlertCircle, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const appointments = [
    { id: 1, patient: "Sarah Johnson", time: "10:00 AM", status: "pending", type: "Checkup" },
    { id: 2, patient: "Maria Garcia", time: "11:30 AM", status: "confirmed", type: "Ultrasound" },
    { id: 3, patient: "Emily Chen", time: "2:00 PM", status: "pending", type: "Consultation" },
  ];

  const sosAlerts = [
    { id: 1, patient: "Jane Smith", severity: "high", time: "5 mins ago" },
    { id: 2, patient: "Lisa Brown", severity: "medium", time: "12 mins ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-secondary" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                City Medical Center
              </h1>
              <p className="text-xs text-muted-foreground">Healthcare Provider Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Appointments</p>
                <p className="text-3xl font-bold text-secondary">12</p>
              </div>
              <Calendar className="w-12 h-12 text-secondary/30" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Patients</p>
                <p className="text-3xl font-bold text-primary">248</p>
              </div>
              <Users className="w-12 h-12 text-primary/30" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">SOS Alerts</p>
                <p className="text-3xl font-bold text-destructive">{sosAlerts.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-destructive/30" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Today's Appointments
              </h3>
              <div className="space-y-4">
                {appointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{apt.time}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        {apt.status === "pending" && (
                          <Button size="sm" variant="default">Confirm</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* SOS Alerts Panel */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-destructive/10 to-card/50 border-destructive/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Emergency Alerts
              </h3>
              <div className="space-y-3">
                {sosAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-background/50 border border-destructive/20 animate-glow-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{alert.patient}</p>
                      <Badge variant="destructive">{alert.severity}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.time}</p>
                    <Button size="sm" variant="destructive" className="w-full">
                      Respond Now
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Patient Records
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
