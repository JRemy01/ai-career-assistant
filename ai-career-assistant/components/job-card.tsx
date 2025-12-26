import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  title: string
  company: string
  location: string
  type: "job" | "event"
}

export function JobCard({ title, company, location, type }: JobCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{company}</p>
        </div>
        <Badge variant="secondary">{type === "job" ? "Job" : "Event"}</Badge>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>{location}</span>
      </div>

      <Button size="sm" className="w-full">
        {type === "job" ? "Apply Now" : "Register"}
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
