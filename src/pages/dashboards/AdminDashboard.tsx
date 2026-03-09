import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, FileText, DollarSign, Shield, MessageSquare, 
  TrendingUp, Layers, BookOpen, Activity
} from 'lucide-react';
import { PlatformUsersChart, PlatformStatsChart, ActivityChart } from '@/components/DashboardCharts';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Platform administration">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const overviewStats = [
    { title: 'Total Users', value: stats.totalUsers, icon: <Users className="h-4 w-4" />, change: `+${stats.newUsersThisWeek} this week` },
    { title: 'Startups', value: stats.totalStartups, icon: <Layers className="h-4 w-4" />, change: 'Registered' },
    { title: 'Total Messages', value: stats.totalMessages, icon: <MessageSquare className="h-4 w-4" />, change: 'Platform-wide' },
    { title: 'Forum Posts', value: stats.totalForumPosts, icon: <BookOpen className="h-4 w-4" />, change: 'Discussions' },
  ];

  const requestStats = [
    { title: 'Mentorships', total: stats.requests.mentorships, active: stats.active.mentorships, icon: <Users className="h-4 w-4 text-purple-500" /> },
    { title: 'Funding', total: stats.requests.funding, active: stats.active.funding, icon: <DollarSign className="h-4 w-4 text-green-500" /> },
    { title: 'Patents', total: stats.requests.patents, active: stats.active.patents, icon: <FileText className="h-4 w-4 text-amber-500" /> },
    { title: 'Audits', total: stats.requests.audits, active: stats.active.audits, icon: <Shield className="h-4 w-4 text-cyan-500" /> },
  ];

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Entrepreneur: 'bg-blue-100 text-blue-800',
      Investor: 'bg-green-100 text-green-800',
      Mentor: 'bg-purple-100 text-purple-800',
      Auditor: 'bg-orange-100 text-orange-800',
      'Patent Officer': 'bg-cyan-100 text-cyan-800',
      Admin: 'bg-red-100 text-red-800',
    };
    return <Badge className={`text-xs ${colors[role] || 'bg-gray-100'}`}>{role}</Badge>;
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
      <div className="space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, i) => (
            <Card key={i} className="hover-lift card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {requestStats.map((stat, i) => (
            <Card key={i} className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {stat.icon}
                  <h3 className="font-semibold">{stat.title}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{stat.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{stat.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlatformUsersChart data={stats.usersByRole} />
          <PlatformStatsChart data={[
            { label: 'Mentorships', value: stats.requests.mentorships },
            { label: 'Funding', value: stats.requests.funding },
            { label: 'Patents', value: stats.requests.patents },
            { label: 'Audits', value: stats.requests.audits },
            { label: 'Forum', value: stats.totalForumPosts },
          ]} />
        </div>

        {/* Activity Timeline */}
        <ActivityChart data={stats.activityByDay.map((d: any) => ({ date: d.day, count: d.total }))} />

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{(u.fullName || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(u.role === 'patent_officer' ? 'Patent Officer' : u.role.charAt(0).toUpperCase() + u.role.slice(1))}
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
