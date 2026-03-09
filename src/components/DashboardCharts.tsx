import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, description, children }: ChartCardProps) => (
  <Card className="card-shadow">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Pie chart for request statuses
export const RequestStatusChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const filtered = data.filter(d => d.value > 0);
  if (filtered.length === 0) {
    return (
      <ChartCard title="Request Status Overview" description="Status of all your requests">
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No data yet — submit requests to see analytics
        </div>
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Request Status Overview" description="Status of all your requests">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {filtered.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

// Bar chart for requests by type
export const RequestsByTypeChart = ({ data }: { data: { type: string; count: number }[] }) => {
  if (data.every(d => d.count === 0)) {
    return (
      <ChartCard title="Requests by Type" description="Breakdown of your submissions">
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No requests yet
        </div>
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Requests by Type" description="Breakdown of your submissions">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="type" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

// Area chart for activity over time
export const ActivityChart = ({ data }: { data: { date: string; count: number }[] }) => {
  if (data.length === 0) {
    return (
      <ChartCard title="Activity Timeline" description="Your platform activity over time">
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Activity data will appear as you use the platform
        </div>
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Activity Timeline" description="Your platform activity over time">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

// Platform overview pie chart (for admin)
export const PlatformUsersChart = ({ data }: { data: { role: string; count: number }[] }) => (
  <ChartCard title="Users by Role" description="Platform user distribution">
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="count" label={({ role, count }) => `${role}: ${count}`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

// Bar chart for platform stats (admin)
export const PlatformStatsChart = ({ data }: { data: { label: string; value: number }[] }) => (
  <ChartCard title="Platform Activity" description="Overall platform metrics">
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);
