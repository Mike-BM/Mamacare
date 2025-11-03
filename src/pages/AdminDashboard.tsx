import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Building2, AlertCircle, BookOpen, TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Mothers", value: "2,847", change: "+12%", icon: Users, color: "text-primary" },
    { label: "Hospitals Verified", value: "156", change: "+8%", icon: Building2, color: "text-secondary" },
    { label: "Emergency Calls", value: "48", change: "-5%", icon: AlertCircle, color: "text-destructive" },
    { label: "Educational Posts", value: "324", change: "+18%", icon: BookOpen, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary animate-float" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MamaCare Admin
              </h1>
              <p className="text-xs text-muted-foreground">System Management Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage the MamaCare platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-70`} />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith("+") ? "text-green-500" : "text-destructive"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Platform Growth
            </h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p className="text-center">
                Chart visualization<br />
                <span className="text-sm">(Analytics Dashboard)</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New hospital registered", time: "5 mins ago", type: "success" },
                { action: "Emergency alert resolved", time: "15 mins ago", type: "info" },
                { action: "New educational post published", time: "1 hour ago", type: "success" },
                { action: "System maintenance scheduled", time: "2 hours ago", type: "warning" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Management Actions */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <h3 className="text-xl font-semibold mb-6">Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-primary">
              <Users className="w-8 h-8 text-primary" />
              <span className="font-semibold">User Management</span>
              <span className="text-xs text-muted-foreground">Manage mothers & hospitals</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-secondary">
              <Building2 className="w-8 h-8 text-secondary" />
              <span className="font-semibold">Hospital Verification</span>
              <span className="text-xs text-muted-foreground">Review & approve hospitals</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-accent">
              <BookOpen className="w-8 h-8 text-accent" />
              <span className="font-semibold">Content Management</span>
              <span className="text-xs text-muted-foreground">Manage educational posts</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
