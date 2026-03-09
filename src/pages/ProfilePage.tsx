import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  User, Mail, MapPin, Phone, Building2, Briefcase, Save, ArrowLeft, Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, profile, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    company: '',
    location: '',
    phone: '',
    avatarUrl: '',
    expertise: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        bio: (profile as any).bio || '',
        company: (profile as any).company || '',
        location: (profile as any).location || '',
        phone: (profile as any).phone || '',
        avatarUrl: profile.avatarUrl || '',
        expertise: (profile as any).expertise?.join(', ') || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const body = {
        ...formData,
        expertise: formData.expertise.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
        setIsEditing(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      entrepreneur: 'bg-blue-100 text-blue-800',
      investor: 'bg-green-100 text-green-800',
      mentor: 'bg-purple-100 text-purple-800',
      auditor: 'bg-orange-100 text-orange-800',
      patent_officer: 'bg-cyan-100 text-cyan-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100';
  };

  const goBack = () => {
    const role = profile?.role;
    if (role === 'entrepreneur') navigate('/entrepreneur');
    else if (role === 'investor') navigate('/investor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/collaborator');
  };

  return (
    <DashboardLayout title="My Profile" subtitle="View and edit your profile information">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={goBack} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Profile Header Card */}
        <Card className="card-shadow">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="gradient-bg text-white text-2xl">
                  {(profile?.fullName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
                  <Badge className={getRoleColor(profile?.role || '')}>
                    {profile?.role === 'patent_officer' ? 'Patent Officer' : profile?.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                {(profile as any)?.company && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Building2 className="inline h-3 w-3 mr-1" />
                    {(profile as any).company}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details / Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Profile' : 'Profile Details'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update your information and save' : 'Your account information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expertise (comma-separated)</Label>
                  <Input
                    value={formData.expertise}
                    onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="e.g. Business Strategy, Marketing, Finance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={formData.avatarUrl}
                    onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={profile?.fullName} />
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email} />
                  <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company" value={(profile as any)?.company} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={(profile as any)?.location} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={(profile as any)?.phone} />
                  <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Role" value={profile?.role === 'patent_officer' ? 'Patent Officer' : profile?.role} />
                </div>
                {(profile as any)?.bio && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{(profile as any).bio}</p>
                  </div>
                )}
                {(profile as any)?.expertise?.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).expertise.map((e: string, i: number) => (
                        <Badge key={i} variant="secondary">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  </div>
);

export default ProfilePage;
