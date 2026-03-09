
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Upload, Shield } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface AuditRequestFormProps {
  onClose: () => void;
}

const AuditRequestForm = ({ onClose }: AuditRequestFormProps) => {
  const [formData, setFormData] = useState({
    auditType: '',
    companySize: '',
    industry: '',
    urgency: '',
    budget: '',
    specificConcerns: '',
    expectedOutcome: '',
    timeline: '',
    additionalInfo: ''
  });
  
  const [auditAreas, setAuditAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const availableAuditAreas = [
    'Financial Audit',
    'Compliance Audit',
    'Operational Audit',
    'IT Security Audit',
    'Risk Assessment',
    'Internal Controls Review',
    'Due Diligence',
    'SOX Compliance',
    'Data Privacy (GDPR/CCPA)',
    'Quality Management Systems'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuditAreaToggle = (area: string) => {
    if (auditAreas.includes(area)) {
      setAuditAreas(auditAreas.filter(a => a !== area));
    } else {
      setAuditAreas([...auditAreas, area]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.auditType || auditAreas.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select audit type and areas to audit",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, auditAreas }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Audit Request Submitted!",
          description: "Your audit request has been submitted to certified auditors."
        });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit audit request",
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
          <CardTitle>Request Business Audit</CardTitle>
          <CardDescription>
            Get your business audited by certified professionals to ensure compliance and identify growth opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="auditType">Audit Type *</Label>
                <Select value={formData.auditType} onValueChange={(value) => handleInputChange('auditType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audit type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="financial">Financial Audit</SelectItem>
                    <SelectItem value="compliance">Compliance Audit</SelectItem>
                    <SelectItem value="operational">Operational Audit</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Audit</SelectItem>
                    <SelectItem value="due-diligence">Due Diligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                    <SelectItem value="small">Small (11-50 employees)</SelectItem>
                    <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                    <SelectItem value="large">Large (200+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How urgent is this audit?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="low">Low - General assessment</SelectItem>
                    <SelectItem value="medium">Medium - Within 2-3 months</SelectItem>
                    <SelectItem value="high">High - Within 1 month</SelectItem>
                    <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="under-10k">Under $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="over-100k">Over $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">Expected Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Expected completion time" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                    <SelectItem value="3-4weeks">3-4 weeks</SelectItem>
                    <SelectItem value="1-2months">1-2 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Audit Areas */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Areas to Audit *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableAuditAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox 
                      id={area}
                      checked={auditAreas.includes(area)}
                      onCheckedChange={() => handleAuditAreaToggle(area)}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specificConcerns">Specific Concerns or Focus Areas</Label>
              <Textarea
                id="specificConcerns"
                value={formData.specificConcerns}
                onChange={(e) => handleInputChange('specificConcerns', e.target.value)}
                placeholder="Are there any specific areas of concern or particular aspects you'd like the auditor to focus on?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">Expected Outcome</Label>
              <Textarea
                id="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                placeholder="What do you hope to achieve from this audit? (e.g., compliance certification, risk mitigation, process improvement)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Any additional information or special requirements for the audit..."
                rows={3}
              />
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload any relevant documents, financial statements, or compliance records
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

export default AuditRequestForm;
