
"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// --- 1. Define TypeScript interfaces for our API data ---
interface PerformanceDetail {
  summary: string;
  details: Record<string, string>;
}

interface PerformanceAnalysis {
  message: string;
  performance_by_topic: Record<string, PerformanceDetail>;
  weakest_areas: string[];
}

// Helper function to parse accuracy from summary string like "85.0% overall (17/20)"
const getAccuracy = (summary: string): number => {
  const match = summary.match(/(\d+\.\d+)%/);
  return match ? parseFloat(match[1]) : 0;
};


export function ProgressTab() {
  // --- 2. Set up state for loading and performance data ---
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 3. Fetch data from the API when the component loads ---
  useEffect(() => {
    const fetchPerformance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/performance/default_user");
        if (!response.ok) {
          // If user has no data yet, API returns 404, which is expected
          if (response.status === 404) {
            setAnalysis(null); // Explicitly set to null to show message
            return;
          }
          throw new Error("Failed to fetch performance data");
        }
        const data: PerformanceAnalysis = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // --- 4. Render UI based on loading and data states ---
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis || Object.keys(analysis.performance_by_topic).length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No performance data yet. Take a quiz to get started!</p>
      </div>
    );
  }

  // --- 5. Derive strongest and weakest skills from the data ---
  const topics = Object.keys(analysis.performance_by_topic);
  
  const strongestTopic = topics.reduce((max, topic) => 
    getAccuracy(analysis.performance_by_topic[topic].summary) > getAccuracy(analysis.performance_by_topic[max].summary) ? topic : max
  , topics[0]);

  const weakestTopic = analysis.weakest_areas[0] || topics.reduce((min, topic) => 
    getAccuracy(analysis.performance_by_topic[topic].summary) < getAccuracy(analysis.performance_by_topic[min].summary) ? topic : min
  , topics[0]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="border-b border-border bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
        <p className="text-sm text-muted-foreground">Track your skill development</p>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strongest Skill Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strongest Skill</p>
                <p className="font-semibold text-foreground capitalize">{strongestTopic}</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={getAccuracy(analysis.performance_by_topic[strongestTopic].summary)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{analysis.performance_by_topic[strongestTopic].summary}</p>
            </div>
          </div>

          {/* Weakest Skill Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Focus Area</p>
                <p className="font-semibold text-foreground capitalize">{weakestTopic}</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={getAccuracy(analysis.performance_by_topic[weakestTopic].summary)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{analysis.performance_by_topic[weakestTopic].summary}</p>
            </div>
          </div>
        </div>

        {/* Skills Overview Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Skills Overview</h3>
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground capitalize">{topic}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{getAccuracy(analysis.performance_by_topic[topic].summary)}%</span>
                </div>
                <Progress value={getAccuracy(analysis.performance_by_topic[topic].summary)} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}