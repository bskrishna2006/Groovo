import { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Messaging from '../../components/Messaging';

const REFRESH_INTERVAL = 15000;

const CollaboratorDashboard = () => {
  const { user, profile, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashStats, setDashStats] = useState<any>(null);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setIsRefreshing(true);
    try {
      const [statsRes, roleRes] = await Promise.all([
        fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/role-data', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const roleResData = await roleRes.json();

      if (statsData.success) setDashStats(statsData.data);
      if (roleResData.success) setRoleData(roleResData.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
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
        fetchData(); // Re-fetch all data
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'mentor': return 'Mentor';
      case 'auditor': return 'Auditor';
      case 'patent_officer': return 'Patent Officer';
      default: return 'Collaborator';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
      case 'completed':
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      case 'pending':
      case 'submitted':
      case 'requested':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'under_review':
      case 'in_progress':
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">{status.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const renderMentorContent = () => (
    <>
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mentorship Requests</CardTitle>
                <CardDescription>Entrepreneurs requesting your mentorship</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => fetchData()} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {roleData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Requests Yet</h3>
                <p className="text-muted-foreground">Mentorship requests from entrepreneurs will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roleData.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.image} alt={item.name} />
                        <AvatarFallback>{(item.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.company}</p>
                        {item.areasOfHelp && item.areasOfHelp.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.areasOfHelp.slice(0, 3).map((area: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                            ))}
                          </div>
                        )}
                        {item.message && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">"{item.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleStatusUpdate(item._id, 'accepted')}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(item._id, 'rejected')}>
                            <XCircle className="mr-1 h-3 w-3" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Requests</CardTitle>
                <CardDescription>Startups requesting audits</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => fetchData()} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {roleData.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Audit Requests</h3>
                <p className="text-muted-foreground">Audit requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roleData.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{item.company}</h4>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      {item.auditAreas && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.auditAreas.slice(0, 3).map((area: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{area}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.urgency && `Urgency: ${item.urgency} • `}
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(item.status)}
                      {(item.status === 'requested' || item.status === 'assigned') && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleStatusUpdate(item._id, 'in_progress')}>
                            Start Audit
                          </Button>
                        </div>
                      )}
                      {item.status === 'in_progress' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(item._id, 'completed')}>
                          <CheckCircle className="mr-1 h-3 w-3" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Completed Audits</CardTitle>
            <CardDescription>Audits you have completed</CardDescription>
          </CardHeader>
          <CardContent>
            {roleData.filter(a => a.status === 'completed').length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Completed Audits</h3>
                <p className="text-muted-foreground">Complete audits to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {roleData.filter(a => a.status === 'completed').map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{item.company}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                ))}
              </div>
            )}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patent Applications</CardTitle>
                <CardDescription>Applications submitted for review</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => fetchData()} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {roleData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Patent Applications</h3>
                <p className="text-muted-foreground">Patent applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roleData.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{item.title || 'Untitled Patent'}</h4>
                        {item.patentType && <Badge variant="outline">{item.patentType}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.applicant}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">{item.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'submitted' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(item._id, 'under_review')}>
                          Start Review
                        </Button>
                      )}
                      {item.status === 'under_review' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleStatusUpdate(item._id, 'approved')}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(item._id, 'rejected')}>
                            <XCircle className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="decisions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Your recent patent decisions</CardDescription>
          </CardHeader>
          <CardContent>
            {roleData.filter(a => ['approved', 'rejected'].includes(a.status)).length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Recent Decisions</h3>
                <p className="text-muted-foreground">Your patent decisions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {roleData.filter(a => ['approved', 'rejected'].includes(a.status)).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.applicant}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  const getTabsList = () => {
    switch (profile?.role) {
      case 'mentor':
        return (
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Mentees</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
        );
      case 'auditor':
        return (
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Active Audits</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        );
      case 'patent_officer':
        return (
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Applications</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
          </TabsList>
        );
      default:
        return null;
    }
  };

  const getContent = () => {
    const messagingTab = (
      <TabsContent value="messages">
        <Messaging />
      </TabsContent>
    );
    switch (profile?.role) {
      case 'mentor':
        return <>{renderMentorContent()}{messagingTab}</>;
      case 'auditor':
        return <>{renderAuditorContent()}{messagingTab}</>;
      case 'patent_officer':
        return <>{renderPatentOfficerContent()}{messagingTab}</>;
      default:
        return messagingTab;
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
