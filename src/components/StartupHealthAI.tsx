import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  ArrowRight, RefreshCw, Zap, Shield, Users, Lightbulb, DollarSign
} from 'lucide-react';

interface AnalysisResult {
  overallScore: number;
  overallGrade: string;
  summary: string;
  categories: {
    name: string;
    score: number;
    status: string;
    insight: string;
  }[];
  recommendations: string[];
  nextSteps: string;
}

const StartupHealthAI = () => {
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGradeBg = (grade: string) => {
    if (grade.startsWith('A')) return 'from-green-500 to-emerald-600';
    if (grade.startsWith('B')) return 'from-blue-500 to-indigo-600';
    if (grade.startsWith('C')) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'strong': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'weak': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Zap className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Business')) return <Lightbulb className="h-5 w-5" />;
    if (name.includes('Fund')) return <DollarSign className="h-5 w-5" />;
    if (name.includes('Mentor')) return <Users className="h-5 w-5" />;
    if (name.includes('IP') || name.includes('Innovation')) return <Sparkles className="h-5 w-5" />;
    if (name.includes('Compliance') || name.includes('Audit')) return <Shield className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    setAnimateIn(false);
    try {
      const res = await fetch('/api/ai/analyze-startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.data);
        setTimeout(() => setAnimateIn(true), 100);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  // Not yet analyzed — show CTA
  if (!analysis && !loading) {
    return (
      <Card className="card-shadow overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
          <CardContent className="relative p-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Startup Health Analysis</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get an AI-powered analysis of your startup's health across business, funding, mentorship, IP, and compliance dimensions.
            </p>
            <Button
              onClick={runAnalysis}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-base shadow-lg shadow-indigo-500/25"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze My Startup
            </Button>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </CardContent>
        </div>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Brain className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analyzing your startup...</h3>
          <p className="text-muted-foreground text-sm mb-4">
            AI is reviewing your profile, funding, mentorships, patents, and audits
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results view
  return (
    <div className={`space-y-6 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Overall Score Card */}
      <Card className="card-shadow overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-indigo-500" />
                <div>
                  <h3 className="text-lg font-bold">AI Startup Analysis</h3>
                  <p className="text-xs text-muted-foreground">Powered by Groq AI</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading}>
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Re-analyze
              </Button>
            </div>

            <div className="flex items-center gap-6">
              {/* Grade Circle */}
              <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${getGradeBg(analysis!.overallGrade)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{analysis!.overallGrade}</p>
                  <p className="text-[10px] text-white/80 font-medium">{analysis!.overallScore}/100</p>
                </div>
              </div>

              {/* Summary */}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{analysis!.summary}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall Health</span>
                    <span className={`font-bold ${getScoreColor(analysis!.overallScore)}`}>{analysis!.overallScore}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBarColor(analysis!.overallScore)}`}
                      style={{ width: animateIn ? `${analysis!.overallScore}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis!.categories.map((cat, i) => (
          <Card
            key={i}
            className="card-shadow transition-all duration-500"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  {getCategoryIcon(cat.name)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{cat.name}</h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(cat.status)}
                    <span className="text-xs capitalize text-muted-foreground">{cat.status}</span>
                  </div>
                </div>
                <span className={`text-xl font-black ${getScoreColor(cat.score)}`}>{cat.score}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBarColor(cat.score)}`}
                  style={{ width: animateIn ? `${cat.score}%` : '0%', transitionDelay: `${i * 150}ms` }}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Actionable steps to improve your startup health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis!.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRight className="h-4 w-4 text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Next Steps</p>
            </div>
            <p className="text-sm text-muted-foreground">{analysis!.nextSteps}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupHealthAI;