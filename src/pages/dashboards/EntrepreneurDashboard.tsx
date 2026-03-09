import { useState, useEffect } from 'react';
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
  Lightbulb
} from 'lucide-react';
import StartupProfileForm from '../../components/forms/StartupProfileForm';
import MentorshipRequestForm from '../../components/forms/MentorshipRequestForm';
import FundingProposalForm from '../../components/forms/FundingProposalForm';
import PatentSupportForm from '../../components/forms/PatentSupportForm';
import AuditRequestForm from '../../components/forms/AuditRequestForm';
import RoadmapViewer from '../../components/RoadmapViewer';
import Forum from '../../components/forum/Forum';
import { useAuth } from '../../contexts/AuthContext';

const EntrepreneurDashboard = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const { token } = useAuth();
  const [dashStats, setDashStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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
      }
    };
    if (token) fetchData();
  }, [token]);

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

  const renderForm = () => {
    switch (activeForm) {
      case 'profile':
        return <StartupProfileForm onClose={() => setActiveForm(null)} />;
      case 'mentorship':
        return <MentorshipRequestForm onClose={() => setActiveForm(null)} />;
      case 'funding':
        return <FundingProposalForm onClose={() => setActiveForm(null)} />;
      case 'patent':
        return <PatentSupportForm onClose={() => setActiveForm(null)} />;
      case 'audit':
        return <AuditRequestForm onClose={() => setActiveForm(null)} />;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
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

            {/* Progress Overview */}
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
                      <span className="text-sm">$150K / $250K</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Series A Target</span>
                      <span className="text-sm">$0 / $1M</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
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
                    <Badge variant="secondary">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Structure</span>
                    <Badge variant="secondary">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Protection</span>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Validation</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forum">
            <Forum />
          </TabsContent>

          <TabsContent value="roadmap">
            <RoadmapViewer />
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Stay updated on your startup progress
                </CardDescription>
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
