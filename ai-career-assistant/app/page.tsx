"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { QuizzesTab } from "@/components/quizzes-tab"
import { ProgressTab } from "@/components/progress-tab"
import { CoursesTab } from "@/components/courses-tab"
import { JobsEventsTab } from "@/components/jobs-events-tab"
import { Sidebar } from "@/components/sidebar"

export interface ChatSession {
  id: string;
  title: string;
}

const USER_ID = "default_user"; // Using a constant for the user ID

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "quizzes" | "progress" | "courses" | "jobs">("chat")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [refreshChatList, setRefreshChatList] = useState(false);

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/chats/${USER_ID}`);
        if (!response.ok) throw new Error("Failed to fetch chats");
        const sessions: ChatSession[] = await response.json();
        setChatSessions(sessions);

        if (sessions.length > 0 && !activeChatId) {
          setActiveChatId(sessions[0].id);
        } else if (sessions.length === 0) {
          // If there are no chats, create one
          handleNewChat();
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchChatSessions();
  }, [refreshChatList]); // Refetch when refreshChatList changes

  const handleNewChat = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chats/${USER_ID}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to create new chat");
      const newSession: ChatSession = await response.json();
      
      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatId(newSession.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chats/${USER_ID}/${chatId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete chat");

      setChatSessions(prev => prev.filter(s => s.id !== chatId));
      // If the active chat was deleted, select another one or create a new one
      if (activeChatId === chatId) {
        const remainingSessions = chatSessions.filter(s => s.id !== chatId);
        if (remainingSessions.length > 0) {
          setActiveChatId(remainingSessions[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <ChatInterface 
            key={activeChatId} // Use key to force re-mount when chat changes
            chatId={activeChatId} 
            userId={USER_ID}
            onTitleUpdate={() => setRefreshChatList(prev => !prev)} // Trigger a refresh
          />
        )}
        {activeTab === "quizzes" && <QuizzesTab />}
        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "jobs" && <JobsEventsTab />}
      </main>
    </div>
  )
}