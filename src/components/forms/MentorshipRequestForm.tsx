
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Star } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface MentorshipRequestFormProps {
  onClose: () => void;
}

const MentorshipRequestForm = ({ onClose }: MentorshipRequestFormProps) => {
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [message, setMessage] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('');
  const [areasOfHelp, setAreasOfHelp] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableMentors, setAvailableMentors] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { token } = useAuth();

  // Fetch real mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch('/api/mentorship/mentors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setAvailableMentors(data.data.map((m: any) => ({
            id: m._id,
            name: m.fullName,
            title: m.company || 'Mentor',
            expertise: m.expertise || [],
            rating: m.rating || 4.5,
            sessions: m.sessionsCompleted || 0,
            image: m.avatarUrl || '',
            bio: m.bio || '',
          })));
        } else {
          // Fallback mentors if none exist yet
          setAvailableMentors([
            { id: 'placeholder1', name: 'Sarah Johnson', title: 'Former CEO at TechCorp', expertise: ['Technology', 'Scaling', 'Leadership'], rating: 4.9, sessions: 150, image: '', bio: 'Experienced tech executive' },
            { id: 'placeholder2', name: 'Michael Chen', title: 'Investment Partner at GrowthVC', expertise: ['Fundraising', 'Strategy', 'Product'], rating: 4.8, sessions: 200, image: '', bio: 'Former founder turned investor' },
          ]);
        }
      } catch {
        setAvailableMentors([
          { id: 'placeholder1', name: 'Sarah Johnson', title: 'Former CEO at TechCorp', expertise: ['Technology', 'Scaling', 'Leadership'], rating: 4.9, sessions: 150, image: '', bio: 'Experienced tech executive' },
        ]);
      }
    };
    fetchMentors();
  }, [token]);

  const helpAreas = [
    'Business Strategy',
    'Product Development',
    'Fundraising',
    'Marketing & Sales',
    'Team Building',
    'Operations',
    'Technology',
    'Legal & Compliance'
  ];

  const handleAreaToggle = (area: string) => {
    if (areasOfHelp.includes(area)) {
      setAreasOfHelp(areasOfHelp.filter(a => a !== area));
    } else {
      setAreasOfHelp([...areasOfHelp, area]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMentor || !message) {
      toast({
        title: "Missing Information",
        description: "Please select a mentor and write a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('/api/mentorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor: selectedMentor,
          areasOfHelp,
          message,
          expectedDuration,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Request Sent!",
          description: "Your mentorship request has been sent successfully."
        });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Request Mentorship</CardTitle>
          <CardDescription>
            Connect with experienced mentors who can guide your startup journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Available Mentors */}
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Available Mentors</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {availableMentors.map((mentor) => (
                  <Card 
                    key={mentor.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedMentor === mentor.id 
                        ? 'ring-2 ring-primary shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMentor(mentor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.image} alt={mentor.name} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{mentor.name}</h3>
                          <p className="text-xs text-muted-foreground">{mentor.title}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs ml-1">{mentor.rating} ({mentor.sessions} sessions)</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentor.expertise.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Areas of Help */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Areas where you need help</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {helpAreas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox 
                        id={area}
                        checked={areasOfHelp.includes(area)}
                        onCheckedChange={() => handleAreaToggle(area)}
                      />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Expected Duration</Label>
                <Select value={expectedDuration} onValueChange={setExpectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="How long do you expect to work with a mentor?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="1-3months">1-3 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                    <SelectItem value="6-12months">6-12 months</SelectItem>
                    <SelectItem value="ongoing">Ongoing relationship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, your startup, and explain why you'd like to work with this mentor..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !selectedMentor}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorshipRequestForm;
