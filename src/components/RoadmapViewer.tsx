
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';

const RoadmapViewer = () => {
  const roadmapPhases = [
    {
      id: 1,
      title: "Foundation",
      description: "Establish your startup basics",
      status: "completed",
      progress: 100,
      milestones: [
        { title: "Business Plan", completed: true },
        { title: "Legal Structure", completed: true },
        { title: "Initial Funding", completed: true },
        { title: "Team Assembly", completed: true }
      ]
    },
    {
      id: 2,
      title: "Development",
      description: "Build and validate your product",
      status: "in-progress",
      progress: 75,
      milestones: [
        { title: "MVP Development", completed: true },
        { title: "User Testing", completed: true },
        { title: "Market Validation", completed: true },
        { title: "Product Refinement", completed: false }
      ]
    },
    {
      id: 3,
      title: "Growth",
      description: "Scale your business operations",
      status: "upcoming",
      progress: 25,
      milestones: [
        { title: "Series A Funding", completed: false },
        { title: "Market Expansion", completed: false },
        { title: "Team Scaling", completed: false },
        { title: "Partnership Development", completed: false }
      ]
    },
    {
      id: 4,
      title: "Maturation",
      description: "Establish market leadership",
      status: "upcoming",
      progress: 0,
      milestones: [
        { title: "Series B Funding", completed: false },
        { title: "International Expansion", completed: false },
        { title: "Strategic Acquisitions", completed: false },
        { title: "IPO Preparation", completed: false }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'upcoming':
        return <Circle className="h-6 w-6 text-gray-400" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Custom Roadmap
          <Badge className="ml-2">Personalized</Badge>
        </CardTitle>
        <CardDescription>
          Your personalized startup journey roadmap based on your industry and goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roadmapPhases.map((phase, index) => (
            <div key={phase.id} className="relative">
              {/* Connection Line */}
              {index < roadmapPhases.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-border"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-2">
                  {getStatusIcon(phase.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card className={`border-l-4 ${
                    phase.status === 'completed' 
                      ? 'border-l-green-500' 
                      : phase.status === 'in-progress' 
                      ? 'border-l-blue-500' 
                      : 'border-l-gray-300'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{phase.title}</h3>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                      </div>
                      
                      {/* Milestones */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Milestones</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {phase.milestones.map((milestone, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              {milestone.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${
                                milestone.completed ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Next Steps */}
        <div className="mt-8 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            Next Recommended Actions
            <ArrowRight className="ml-2 h-4 w-4" />
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Complete product refinement based on user feedback
            </p>
            <p className="text-sm text-muted-foreground">
              • Prepare Series A funding materials
            </p>
            <p className="text-sm text-muted-foreground">
              • Schedule quarterly business review with mentors
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadmapViewer;
