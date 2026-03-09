import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Plus,
  TrendingUp,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import StartupProfileForm from '../../components/forms/StartupProfileForm';
import MentorshipRequestForm from '../../components/forms/MentorshipRequestForm';
import FundingProposalForm from '../../components/forms/FundingProposalForm';
import PatentSupportForm from '../../components/forms/PatentSupportForm';
import AuditRequestForm from '../../components/forms/AuditRequestForm';
import RoadmapViewer from '../../components/RoadmapViewer';
import Forum from '../../components/forum/Forum';
import Messaging from '../../components/Messaging';
import { useAuth } from '../../contexts/AuthContext';

const REFRESH_INTERVAL = 15000; // 15 seconds

const EntrepreneurDashboard = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const { token } = useAuth();
  const [dashStats, setDashStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setIsRefreshing(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/activities', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();

      if (statsData.success) setDashStats(statsData.data);
      if (activitiesData.success) setRecentActivities(activitiesData.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  // Initial fetch + 15s polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Helper to format currency
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const seedFunded = dashStats?.seedFunded || 0;
  const seriesAFunded = dashStats?.seriesAFunded || 0;
  const seedGoal = dashStats?.seedGoal || 250000;
  const seriesAGoal = dashStats?.seriesAGoal || 1000000;
  const seedPercent = seedGoal > 0 ? Math.min(Math.round((seedFunded / seedGoal) * 100), 100) : 0;
  const seriesAPercent = seriesAGoal > 0 ? Math.min(Math.round((seriesAFunded / seriesAGoal) * 100), 100) : 0;

  const startupHealth = dashStats?.startupHealth;

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const stats = [
    {
      title: "Active Mentors",
      value: dashStats?.activeMentors?.toString() || "0",
      icon: <Users className="h-4 w-4" />,
      change: "Connected mentors"
    },
    {
      title: "Funding Proposals",
      value: dashStats?.fundingProposals?.toString() || "0",
      icon: <DollarSign className="h-4 w-4" />,
      change: `${dashStats?.acceptedFunding || 0} accepted`
    },
    {
      title: "Patents Filed",
      value: dashStats?.patentsFiled?.toString() || "0",
      icon: <FileText className="h-4 w-4" />,
      change: "Applications submitted"
    },
    {
      title: "Audit Score",
      value: dashStats?.auditScore ? `${dashStats.auditScore}%` : "N/A",
      icon: <Shield className="h-4 w-4" />,
      change: "Average score"
    }
  ];

  const quickActions = [
    {
      title: "Request Mentorship",
      description: "Connect with experienced mentors",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      action: () => setActiveForm('mentorship')
    },
    {
      title: "Submit Funding Proposal",
      description: "Present your startup to investors",
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      action: () => setActiveForm('funding')
    },
    {
      title: "Patent Support",
      description: "Protect your intellectual property",
      icon: <Lightbulb className="h-6 w-6 text-orange-600" />,
      action: () => setActiveForm('patent')
    },
    {
      title: "Request Audit",
      description: "Get professional business audit",
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      action: () => setActiveForm('audit')
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      case 'pending':
      case 'submitted':
      case 'requested':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderForm = () => {
    const onClose = () => {
      setActiveForm(null);
      fetchData(); // Re-fetch data after form submission
    };
    switch (activeForm) {
      case 'profile':
        return <StartupProfileForm onClose={onClose} />;
      case 'mentorship':
        return <MentorshipRequestForm onClose={onClose} />;
      case 'funding':
        return <FundingProposalForm onClose={onClose} />;
      case 'patent':
        return <PatentSupportForm onClose={onClose} />;
      case 'audit':
        return <AuditRequestForm onClose={onClose} />;
      default:
        return null;
    }
  };

  if (activeForm) {
    return (
      <DashboardLayout title="Entrepreneur Dashboard">
        {renderForm()}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Entrepreneur Dashboard" 
      subtitle="Manage your startup journey"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
            {stats.map((stat, index) => (
              <Card key={index} className="hover-lift card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Take the next step in your startup journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Card key={index} className="hover-lift cursor-pointer transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-6 text-center" onClick={action.action}>
                        <div className="mb-4 flex justify-center">
                          {action.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funding Progress + Startup Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Progress</CardTitle>
                  <CardDescription>Track your funding milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Seed Round</span>
                      <span className="text-sm">{formatCurrency(seedFunded)} / {formatCurrency(seedGoal)}</span>
                    </div>
                    <Progress value={seedPercent} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Series A Target</span>
                      <span className="text-sm">{formatCurrency(seriesAFunded)} / {formatCurrency(seriesAGoal)}</span>
                    </div>
                    <Progress value={seriesAPercent} className="h-2" />
                  </div>
                  {dashStats?.acceptedFunding > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {dashStats.acceptedFunding} proposal(s) accepted by investors
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Startup Health</CardTitle>
                  <CardDescription>Overall business metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business Plan</span>
                    {getHealthBadge(startupHealth?.businessPlan || 'pending')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Structure</span>
                    {getHealthBadge(startupHealth?.legalStructure || 'pending')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Protection</span>
                    {getHealthBadge(startupHealth?.ipProtection || 'pending')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Validation</span>
                    {getHealthBadge(startupHealth?.marketValidation || 'pending')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Requests Tab — shows all request statuses */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentorship Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Mentorship Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!dashStats?.mentorshipRequests || dashStats.mentorshipRequests.length === 0) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No mentorship requests yet</p>
                  ) : (
                    <div className="space-y-3">
                      {dashStats.mentorshipRequests.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{r.mentor?.fullName || 'Mentor'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Funding Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Funding Proposals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!dashStats?.fundingRequests || dashStats.fundingRequests.length === 0) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No funding proposals yet</p>
                  ) : (
                    <div className="space-y-3">
                      {dashStats.fundingRequests.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{r.fundingStage} — {r.fundingAmount}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patent Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    Patent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!dashStats?.patentRequests || dashStats.patentRequests.length === 0) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No patent applications yet</p>
                  ) : (
                    <div className="space-y-3">
                      {dashStats.patentRequests.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{r.inventionTitle}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audit Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Audit Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!dashStats?.auditRequests || dashStats.auditRequests.length === 0) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No audit requests yet</p>
                  ) : (
                    <div className="space-y-3">
                      {dashStats.auditRequests.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{r.auditType || 'Audit'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Messaging />
          </TabsContent>

          <TabsContent value="forum">
            <Forum />
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>
                      Stay updated on your startup progress
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => fetchData()} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activities yet. Start by submitting a request!</p>
                  ) : recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-full ${
                        activity.read ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {activity.read ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Startup Profile</CardTitle>
                <CardDescription>
                  Update your startup information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveForm('profile')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EntrepreneurDashboard;
