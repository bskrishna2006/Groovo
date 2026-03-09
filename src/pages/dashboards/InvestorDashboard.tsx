import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Heart, 
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const InvestorDashboard = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fundingProposals, setFundingProposals] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proposalsRes, statsRes] = await Promise.all([
          fetch('/api/funding', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const proposalsData = await proposalsRes.json();
        const statsData = await statsRes.json();

        if (proposalsData.success) {
          setFundingProposals(proposalsData.data.map((p: any) => ({
            id: p._id,
            companyName: p.startup?.name || 'Startup',
            industry: p.startup?.industry || 'Technology',
            stage: p.fundingStage || 'Seed',
            fundingAmount: p.fundingAmount,
            equityOffered: p.equityOffered ? `${p.equityOffered}%` : 'N/A',
            description: p.useOfFunds,
            location: p.startup?.location || 'N/A',
            employees: p.startup?.employees || 'N/A',
            founder: {
              name: p.entrepreneur?.fullName || 'Unknown',
              image: p.entrepreneur?.avatarUrl || '',
            },
            submittedDate: new Date(p.createdAt).toLocaleDateString(),
            status: p.status,
          })));
        }
        if (statsData.success) setDashStats(statsData.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    if (token) fetchData();
  }, [token]);

  const stats = [
    {
      title: "Active Proposals",
      value: dashStats?.activeProposals?.toString() || fundingProposals.length.toString(),
      icon: <Clock className="h-4 w-4" />,
      change: "Awaiting review"
    },
    {
      title: "Investments Made",
      value: dashStats?.investmentsMade?.toString() || "0",
      icon: <DollarSign className="h-4 w-4" />,
      change: "Accepted proposals"
    },
    {
      title: "Reviewed",
      value: dashStats?.reviewedProposals?.toString() || "0",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "Total reviewed"
    },
    {
      title: "Watchlist",
      value: "0",
      icon: <Heart className="h-4 w-4" />,
      change: "Saved proposals"
    }
  ];

  const watchlistCompanies: any[] = [];

  const handleProposalAction = async (proposalId: string, action: 'accept' | 'reject' | 'watchlist') => {
    if (action === 'watchlist') return;

    const statusMap: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
    };

    try {
      const res = await fetch(`/api/funding/${proposalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusMap[action] }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: `Proposal ${statusMap[action]}` });
        setFundingProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: statusMap[action] } : p));
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update proposal", variant: "destructive" });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Pre-Seed':
        return 'bg-gray-100 text-gray-800';
      case 'Seed':
        return 'bg-green-100 text-green-800';
      case 'Series A':
        return 'bg-blue-100 text-blue-800';
      case 'Series B':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout 
      title="Investor Dashboard" 
      subtitle="Discover and invest in promising startups"
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposals">Funding Proposals</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg">
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="sustainability">Sustainability</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg">
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proposals List */}
            <div className="space-y-4">
              {fundingProposals.map((proposal) => (
                <Card key={proposal.id} className="hover-lift card-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={proposal.founder.image} alt={proposal.founder.name} />
                            <AvatarFallback>
                              {proposal.founder.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold">{proposal.companyName}</h3>
                              <Badge className={getStageColor(proposal.stage)}>
                                {proposal.stage}
                              </Badge>
                              <Badge variant="outline">{proposal.industry}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {proposal.fundingAmount} ({proposal.equityOffered} equity)
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {proposal.location}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {proposal.employees} employees
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {proposal.submittedDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleProposalAction(proposal.id, 'watchlist')}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Watchlist
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleProposalAction(proposal.id, 'reject')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Pass
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleProposalAction(proposal.id, 'accept')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Interested
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Companies You're Watching</CardTitle>
                <CardDescription>
                  Keep track of interesting startups and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchlistCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={company.founder.image} alt={company.founder.name} />
                          <AvatarFallback>
                            {company.founder.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{company.companyName}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge className={getStageColor(company.stage)}>{company.stage}</Badge>
                            <span>•</span>
                            <span>{company.industry}</span>
                            <span>•</span>
                            <span>Valued at {company.valuation}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{company.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{company.lastUpdate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
                <CardDescription>
                  Companies you've invested in and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Portfolio Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Your portfolio companies and their performance metrics will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard;
