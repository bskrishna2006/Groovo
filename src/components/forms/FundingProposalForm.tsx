
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FundingProposalFormProps {
  onClose: () => void;
}

const FundingProposalForm = ({ onClose }: FundingProposalFormProps) => {
  const [formData, setFormData] = useState({
    fundingAmount: '',
    fundingStage: '',
    useOfFunds: '',
    equityOffered: '',
    revenueModel: '',
    marketSize: '',
    competitiveAdvantage: '',
    timeline: '',
    additionalInfo: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fundingAmount || !formData.fundingStage || !formData.useOfFunds) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/funding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Proposal Submitted!",
          description: "Your funding proposal has been submitted to investors."
        });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit proposal",
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
          <CardTitle>Submit Funding Proposal</CardTitle>
          <CardDescription>
            Present your startup to verified investors and secure the funding you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fundingAmount">Funding Amount Sought *</Label>
                <Input
                  id="fundingAmount"
                  value={formData.fundingAmount}
                  onChange={(e) => handleInputChange('fundingAmount', e.target.value)}
                  placeholder="e.g., $500,000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fundingStage">Funding Stage *</Label>
                <Select value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                    <SelectItem value="series-c">Series C</SelectItem>
                    <SelectItem value="bridge">Bridge Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equityOffered">Equity Offered (%)</Label>
                <Input
                  id="equityOffered"
                  type="number"
                  value={formData.equityOffered}
                  onChange={(e) => handleInputChange('equityOffered', e.target.value)}
                  placeholder="e.g., 10"
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">Expected Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need funding?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="immediate">Immediately</SelectItem>
                    <SelectItem value="1-3months">1-3 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                    <SelectItem value="6-12months">6-12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="useOfFunds">Use of Funds *</Label>
              <Textarea
                id="useOfFunds"
                value={formData.useOfFunds}
                onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                placeholder="Explain how you plan to use the funding (e.g., product development, marketing, team expansion)..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenueModel">Revenue Model</Label>
              <Textarea
                id="revenueModel"
                value={formData.revenueModel}
                onChange={(e) => handleInputChange('revenueModel', e.target.value)}
                placeholder="Describe your revenue model and current/projected revenue..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marketSize">Market Size & Opportunity</Label>
              <Textarea
                id="marketSize"
                value={formData.marketSize}
                onChange={(e) => handleInputChange('marketSize', e.target.value)}
                placeholder="Describe your target market size and opportunity..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
              <Textarea
                id="competitiveAdvantage"
                value={formData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                placeholder="What makes your startup unique and defensible?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Any additional information you'd like investors to know..."
                rows={3}
              />
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your pitch deck, financial projections, or other supporting documents
                </p>
                <Button type="button" variant="outline" className="mt-4">
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
                    Submit Proposal
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

export default FundingProposalForm;
