"use client"

import { MessageSquare, FileQuestion, TrendingUp, GraduationCap, Briefcase, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChatSession } from "@/app/page" // Import the shared interface

interface SidebarProps {
  activeTab: "chat" | "quizzes" | "progress" | "courses" | "jobs"
  onTabChange: (tab: "chat" | "quizzes" | "progress" | "courses" | "jobs") => void
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

const mainTabs = [
  { id: "chat" as const, label: "Chat", icon: MessageSquare },
  { id: "quizzes" as const, label: "Quizzes", icon: FileQuestion },
  { id: "progress" as const, label: "Progress", icon: TrendingUp },
  { id: "courses" as const, label: "Courses", icon: GraduationCap },
  { id: "jobs" as const, label: "Jobs & Events", icon: Briefcase },
]

export function Sidebar({ 
  activeTab, 
  onTabChange,
  chatSessions,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">AI Career Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Learn Data & AI Skills</p>
      </div>

      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Main Tabs */}
        <ul className="space-y-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Chat History Section */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Chat History</h2>
            <Button variant="ghost" size="icon" onClick={onNewChat}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ul className="space-y-1">
            {chatSessions.map((session) => (
              <li key={session.id}>
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 pl-4 pr-2 py-2 rounded-lg text-sm text-left transition-colors group",
                    activeChatId === session.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <span className="truncate flex-1">{session.title}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent chat selection when deleting
                      onDeleteChat(session.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}