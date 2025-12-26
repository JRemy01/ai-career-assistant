"use client"

import { useState, useEffect } from "react"
import { MapPin, ExternalLink, Calendar, Briefcase, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 1. Define types for our API data
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  url: string;
}

export function JobsEventsTab() {
  // 2. Set up state for jobs, events, and loading
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "remote" | "onsite">("all");

  // 3. Fetch data from both endpoints
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobsResponse, eventsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/jobs"),
          fetch("http://127.0.0.1:8000/api/events"),
        ]);

        if (!jobsResponse.ok || !eventsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const jobsData: Job[] = await jobsResponse.json();
        const eventsData: Event[] = await eventsResponse.json();

        setJobs(jobsData);
        setEvents(eventsData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    if (filter === "remote") return job.location === "Remote";
    return job.location !== "Remote";
  });

  // 4. Render UI based on state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="border-b border-border bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Jobs & Events</h2>
        <p className="text-sm text-muted-foreground">Discover opportunities and networking events</p>
      </header>

      <div className="p-6">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="jobs">Job Openings</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button
                variant={filter === "remote" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("remote")}
              >
                Remote
              </Button>
              <Button
                variant={filter === "onsite" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("onsite")}
              >
                On-site
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                    </div>
                    <Badge variant="secondary">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {job.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>

                  <Button size="sm" className="w-full" asChild>
                     <a href={job.url} target="_blank" rel="noopener noreferrer">
                        Apply Now
                       <ExternalLink className="w-4 h-4 ml-2" />
                     </a>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground text-lg">{event.title}</h3>
                      <Badge variant="secondary">Event</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{event.description}</p>
                  </div>
                  <Button size="sm" className="w-full mt-auto" asChild>
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      View Event
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}