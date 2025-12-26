interface ChatMessageProps {
  message: {
    type: "user" | "bot"
    content: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === "user") {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-2xl">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-medium">
          U
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
        AI
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3 max-w-2xl">
        <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
      </div>
    </div>
  )
}
