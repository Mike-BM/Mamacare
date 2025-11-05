import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Hospital, AlertCircle, TrendingUp } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', mothers: 145, appointments: 230, emergencies: 12 },
  { month: 'Feb', mothers: 198, appointments: 310, emergencies: 8 },
  { month: 'Mar', mothers: 234, appointments: 385, emergencies: 15 },
  { month: 'Apr', mothers: 289, appointments: 445, emergencies: 10 },
  { month: 'May', mothers: 342, appointments: 520, emergencies: 18 },
  { month: 'Jun', mothers: 401, appointments: 615, emergencies: 14 },
];

const hospitalData = [
  { name: 'Nairobi General', value: 145 },
  { name: 'Kampala Medical', value: 98 },
  { name: 'Lagos Maternity', value: 87 },
  { name: 'Accra Clinic', value: 71 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Mothers</p>
              <h3 className="text-3xl font-bold mt-2">1,245</h3>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15.3% from last month
              </p>
            </div>
            <Users className="w-12 h-12 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hospitals</p>
              <h3 className="text-3xl font-bold mt-2">87</h3>
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.2% from last month
              </p>
            </div>
            <Hospital className="w-12 h-12 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Appointments</p>
              <h3 className="text-3xl font-bold mt-2">2,834</h3>
              <p className="text-xs text-accent-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +22.1% from last month
              </p>
            </div>
            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SOS Alerts</p>
              <h3 className="text-3xl font-bold mt-2">77</h3>
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                -12.5% from last month
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Monthly Growth Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="mothers" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="appointments" stroke="hsl(var(--secondary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Hospital Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hospitalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {hospitalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Emergency Response Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="emergencies" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};