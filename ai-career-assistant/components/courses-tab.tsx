"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Clock, BarChart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// 1. Define the type for a course, matching our API model
interface Course {
  title: string;
  description: string;
  duration?: string; // Make optional as it's not in our JSON data
  difficulty_level: string;
  platform?: string; // Make optional
  isPaid?: boolean; // Make optional
  url: string;
}

export function CoursesTab() {
  // 2. Set up state for loading and courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch recommendations from the API
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/recommendations/default_user");
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // 4. Render UI based on state
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="border-b border-border bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Recommended Courses</h2>
        <p className="text-sm text-muted-foreground">Personalized learning paths based on your progress</p>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">No specific recommendations right now. Take a quiz to identify areas for improvement!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg">{course.title}</h3>
                  {course.isPaid !== undefined && (
                    <Badge variant={course.isPaid ? "default" : "secondary"}>
                      {course.isPaid ? "Paid" : "Free"}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  {course.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <BarChart className="w-4 h-4" />
                    <span className="capitalize">{course.difficulty_level}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{course.platform || "Online"}</span>
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                  >
                    Start Learning
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}