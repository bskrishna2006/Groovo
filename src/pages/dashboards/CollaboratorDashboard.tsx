import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Shield, 
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Upload,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CollaboratorDashboard = () => {
  const { user, profile, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashStats, setDashStats] = useState<any>(null);
  const [roleData, setRoleData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        if (statsData.success) setDashStats(statsData.data);

        // Fetch role-specific data
        let endpoint = '';
        if (profile?.role === 'mentor') endpoint = '/api/mentorship';
        else if (profile?.role === 'auditor') endpoint = '/api/audits';
        else if (profile?.role === 'patent_officer') endpoint = '/api/patents';

        if (endpoint) {
          const roleRes = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const roleResData = await roleRes.json();
          if (roleResData.success) setRoleData(roleResData.data);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    if (token) fetchData();
  }, [token, profile?.role]);

  const handleStatusUpdate = async (itemId: string, status: string) => {
    let endpoint = '';
    if (profile?.role === 'mentor') endpoint = `/api/mentorship/${itemId}/status`;
    else if (profile?.role === 'auditor') endpoint = `/api/audits/${itemId}/status`;
    else if (profile?.role === 'patent_officer') endpoint = `/api/patents/${itemId}/status`;

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Updated', description: `Status updated to ${status}` });
        setRoleData(prev => prev.map(item => item._id === itemId ? { ...item, status } : item));
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'mentor':
        return 'Mentor';
      case 'auditor':
        return 'Auditor';
      case 'patent_officer':
        return 'Patent Officer';
      default:
        return 'Collaborator';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mentor':
        return <Users className="h-4 w-4" />;
      case 'auditor':
        return <Shield className="h-4 w-4" />;
      case 'patent_officer':
        return <FileText className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatsForRole = () => {
    if (profile?.role === 'mentor') {
      return [
        { title: "Active Mentees", value: dashStats?.activeMentees?.toString() || "0", icon: <Users className="h-4 w-4" />, change: "Active now" },
        { title: "Completed Sessions", value: dashStats?.completedSessions?.toString() || "0", icon: <CheckCircle className="h-4 w-4" />, change: "Total completed" },
        { title: "Pending Requests", value: dashStats?.pendingRequests?.toString() || "0", icon: <Clock className="h-4 w-4" />, change: "Awaiting response" },
        { title: "Notifications", value: dashStats?.unreadNotifications?.toString() || "0", icon: <MessageSquare className="h-4 w-4" />, change: "Unread" },
      ];
    } else if (profile?.role === 'auditor') {
      return [
        { title: "Active Audits", value: dashStats?.activeAudits?.toString() || "0", icon: <Shield className="h-4 w-4" />, change: "In progress" },
        { title: "Completed Audits", value: dashStats?.completedAudits?.toString() || "0", icon: <CheckCircle className="h-4 w-4" />, change: "Total completed" },
        { title: "Pending Requests", value: dashStats?.pendingRequests?.toString() || "0", icon: <Clock className="h-4 w-4" />, change: "Awaiting review" },
        { title: "Notifications", value: dashStats?.unreadNotifications?.toString() || "0", icon: <MessageSquare className="h-4 w-4" />, change: "Unread" },
      ];
    } else {
      return [
        { title: "Active Applications", value: dashStats?.activeApplications?.toString() || "0", icon: <FileText className="h-4 w-4" />, change: "Under review" },
        { title: "Completed Reviews", value: dashStats?.completedReviews?.toString() || "0", icon: <CheckCircle className="h-4 w-4" />, change: "Total reviewed" },
        { title: "Pending Applications", value: dashStats?.pendingApplications?.toString() || "0", icon: <Clock className="h-4 w-4" />, change: "New submissions" },
        { title: "Notifications", value: dashStats?.unreadNotifications?.toString() || "0", icon: <MessageSquare className="h-4 w-4" />, change: "Unread" },
      ];
    }
  };

  const stats = getStatsForRole();

  // Mock data - would come from API based on user role
  const mentorData = {
    mentees: [
      {
        id: '1',
        name: 'Sarah Johnson',
        company: 'TechStart Solutions',
        industry: 'Technology',
        progress: 75,
        nextSession: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '2',
        name: 'Michael Chen',
        company: 'GreenTech Innovations',
        industry: 'Sustainability',
        progress: 60,
        nextSession: '2024-01-17',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    ]
  };

  const auditorData = {
    audits: [
      {
        id: '1',
        company: 'HealthAI Corp',
        type: 'Financial Audit',
        status: 'In Progress',
        deadline: '2024-01-20',
        progress: 65,
        riskLevel: 'Low'
      },
      {
        id: '2',
        company: 'DataFlow Analytics',
        type: 'Compliance Audit',
        status: 'Review Required',
        deadline: '2024-01-25',
        progress: 90,
        riskLevel: 'Medium'
      }
    ]
  };

  const patentData = {
    applications: [
      {
        id: '1',
        title: 'AI-Powered Customer Service System',
        applicant: 'TechStart Solutions',
        status: 'Under Review',
        submittedDate: '2024-01-10',
        priority: 'High'
      },
      {
        id: '2',
        title: 'Biodegradable Packaging Material',
        applicant: 'GreenTech Innovations',
        status: 'Approved',
        submittedDate: '2024-01-05',
        priority: 'Medium'
      }
    ]
  };

  const renderMentorContent = () => (
    <>
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Mentees</CardTitle>
            <CardDescription>Entrepreneurs you're currently mentoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentorData.mentees.map((mentee) => (
                <div key={mentee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentee.image} alt={mentee.name} />
                      <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{mentee.name}</h4>
                      <p className="text-sm text-muted-foreground">{mentee.company} • {mentee.industry}</p>
                      <div className="flex items-center mt-2">
                        <Progress value={mentee.progress} className="w-24 h-2 mr-2" />
                        <span className="text-xs text-muted-foreground">{mentee.progress}% complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Next Session</p>
                    <p className="text-sm text-muted-foreground">{mentee.nextSession}</p>
                    <Button size="sm" className="mt-2">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sessions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled mentoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Upcoming Sessions</h3>
              <p className="text-muted-foreground">Schedule sessions with your mentees</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  const renderAuditorContent = () => (
    <>
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Audits</CardTitle>
            <CardDescription>Companies you're currently auditing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditorData.audits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{audit.company}</h4>
                      <Badge className={audit.riskLevel === 'High' ? 'bg-red-100 text-red-800' : audit.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {audit.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{audit.type}</p>
                    <div className="flex items-center">
                      <Progress value={audit.progress} className="w-32 h-2 mr-2" />
                      <span className="text-xs text-muted-foreground">{audit.progress}% complete</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={audit.status === 'In Progress' ? 'default' : 'secondary'}>
                      {audit.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">Due: {audit.deadline}</p>
                    <Button size="sm" className="mt-2">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Reports</CardTitle>
            <CardDescription>Completed and draft audit reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Reports Available</h3>
              <p className="text-muted-foreground">Complete audits to generate reports</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  const renderPatentOfficerContent = () => (
    <>
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patent Applications</CardTitle>
            <CardDescription>Applications submitted for review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patentData.applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{application.title}</h4>
                      <Badge className={application.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {application.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{application.applicant}</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted: {application.submittedDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={application.status === 'Approved' ? 'default' : 'secondary'}>
                      {application.status}
                    </Badge>
                    <div className="mt-2 space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      {application.status === 'Under Review' && (
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="decisions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Your recent patent application decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Recent Decisions</h3>
              <p className="text-muted-foreground">Your patent decisions will appear here</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  const getTabsList = () => {
    switch (profile?.role) {
      case 'mentor':
        return (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Mentees</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
        );
      case 'auditor':
        return (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Active Audits</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        );
      case 'patent_officer':
        return (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Applications</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
          </TabsList>
        );
      default:
        return null;
    }
  };

  const getContent = () => {
    switch (profile?.role) {
      case 'mentor':
        return renderMentorContent();
      case 'auditor':
        return renderAuditorContent();
      case 'patent_officer':
        return renderPatentOfficerContent();
      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      title={`${getRoleTitle(profile?.role || '')} Dashboard`}
      subtitle={`Welcome back, ${profile?.fullName || 'User'}`}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {getTabsList()}
          {getContent()}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CollaboratorDashboard;
