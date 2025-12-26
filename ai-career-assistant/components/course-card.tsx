import { ExternalLink, Clock, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CourseCardProps {
  title: string
  description: string
  duration: string
  difficulty: string
  platform: string
  isPaid: boolean
}

export function CourseCard({ title, description, duration, difficulty, platform, isPaid }: CourseCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        <Badge variant={isPaid ? "default" : "secondary"}>{isPaid ? "Paid" : "Free"}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart className="w-4 h-4" />
          <span>{difficulty}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Platform: {platform}</span>
        <Button size="sm">
          Start Learning
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
