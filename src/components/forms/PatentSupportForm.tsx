
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Upload, FileText } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface PatentSupportFormProps {
  onClose: () => void;
}

const PatentSupportForm = ({ onClose }: PatentSupportFormProps) => {
  const [formData, setFormData] = useState({
    inventionTitle: '',
    patentType: '',
    description: '',
    technicalField: '',
    problemSolved: '',
    advantages: '',
    priorArt: '',
    inventors: '',
    urgency: '',
    budget: ''
  });
  
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const availableServices = [
    'Patent Search & Analysis',
    'Patent Application Drafting',
    'Prior Art Search',
    'Freedom to Operate Analysis',
    'Patent Portfolio Strategy',
    'International Filing (PCT)',
    'Patent Prosecution Support',
    'IP Licensing Support'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inventionTitle || !formData.description || !formData.patentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('/api/patents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, services }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Request Submitted!",
          description: "Your patent support request has been submitted to patent officers."
        });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit request",
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
          <CardTitle>Patent Support Request</CardTitle>
          <CardDescription>
            Get professional help protecting your intellectual property from experienced patent officers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="inventionTitle">Invention Title *</Label>
                <Input
                  id="inventionTitle"
                  value={formData.inventionTitle}
                  onChange={(e) => handleInputChange('inventionTitle', e.target.value)}
                  placeholder="Brief title of your invention"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patentType">Patent Type *</Label>
                <Select value={formData.patentType} onValueChange={(value) => handleInputChange('patentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patent type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="utility">Utility Patent</SelectItem>
                    <SelectItem value="design">Design Patent</SelectItem>
                    <SelectItem value="plant">Plant Patent</SelectItem>
                    <SelectItem value="provisional">Provisional Patent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technicalField">Technical Field</Label>
                <Input
                  id="technicalField"
                  value={formData.technicalField}
                  onChange={(e) => handleInputChange('technicalField', e.target.value)}
                  placeholder="e.g., Software, Biotechnology, Mechanical Engineering"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How urgent is this?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="low">Low - General guidance</SelectItem>
                    <SelectItem value="medium">Medium - Within 3 months</SelectItem>
                    <SelectItem value="high">High - Within 1 month</SelectItem>
                    <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Estimated Budget</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="under-5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="over-50k">Over $50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inventors">Inventor(s)</Label>
                <Input
                  id="inventors"
                  value={formData.inventors}
                  onChange={(e) => handleInputChange('inventors', e.target.value)}
                  placeholder="Names of all inventors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Invention Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of your invention, how it works, and its key features..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="problemSolved">Problem Solved</Label>
              <Textarea
                id="problemSolved"
                value={formData.problemSolved}
                onChange={(e) => handleInputChange('problemSolved', e.target.value)}
                placeholder="What problem does your invention solve? What need does it address?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advantages">Key Advantages</Label>
              <Textarea
                id="advantages"
                value={formData.advantages}
                onChange={(e) => handleInputChange('advantages', e.target.value)}
                placeholder="What advantages does your invention have over existing solutions?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priorArt">Known Prior Art</Label>
              <Textarea
                id="priorArt"
                value={formData.priorArt}
                onChange={(e) => handleInputChange('priorArt', e.target.value)}
                placeholder="Are you aware of any similar existing inventions or prior art?"
                rows={3}
              />
            </div>
            
            {/* Services Needed */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Services Needed</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox 
                      id={service}
                      checked={services.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Supporting Documents & Drawings</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload any drawings, diagrams, prototypes, or technical documents
                </p>
                <Button type="button" variant="outline" className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentSupportForm;
