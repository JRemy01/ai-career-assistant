"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage as ChatMessageComponent } from "@/components/chat-message" // Renamed to avoid conflict

// Renamed to avoid conflict with component
interface Message {
  id: string
  type: "user" | "bot"
  content: string
}

interface ChatMessage {
    user: string;
    bot: string;
}

interface ChatInterfaceProps {
    chatId: string | null;
    userId: string;
    onTitleUpdate: () => void;
}

export function ChatInterface({ chatId, userId, onTitleUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setMessages([]); // Clear previous chat messages
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/chats/${userId}/${chatId}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        
        const history: ChatMessage[] = await response.json();
        
        const formattedMessages: Message[] = history.flatMap((item, index) => [
          { id: `hist-${index}-user`, type: 'user', content: item.user },
          { id: `hist-${index}-bot`, type: 'bot', content: item.bot }
        ]);

        setMessages(formattedMessages);
      } catch (error) {
        console.error(error);
        // Optionally show an error message in the chat window
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [chatId, userId]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;

    const wasFirstMessage = messages.length === 0;
     
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };
     
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chats/${userId}/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
    
      if (!response.ok) throw new Error("Network response was not ok");
    
      const data: ChatMessage = await response.json();
    
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.bot,
      };
    
      setMessages((prev) => [...prev, botResponse]);

      // If this was the first message, trigger a title update
      if (wasFirstMessage) {
        onTitleUpdate();
      }

    } catch (error) {
      console.error("Failed to fetch bot response:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Chat Assistant</h2>
        <p className="text-sm text-muted-foreground">Select a conversation or start a new one</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
            messages.map((message) => (
              <div key={message.id}>
                <ChatMessageComponent message={message} />
              </div>
            ))
        )}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              AI
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={chatId ? "Ask a follow-up..." : "Select or create a new chat"}
            className="flex-1"
            disabled={!chatId || isLoadingHistory}
          />
          <Button onClick={handleSend} disabled={!input.trim() || !chatId}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}