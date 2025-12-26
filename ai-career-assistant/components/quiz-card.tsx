"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizCardProps {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function QuizCard({ question, options, correctAnswer, explanation }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index)
    setShowExplanation(true)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-semibold text-foreground mb-4">{question}</h3>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrect = index === correctAnswer
          const showFeedback = showExplanation

          return (
            <button
              key={index}
              onClick={() => !showExplanation && handleAnswer(index)}
              disabled={showExplanation}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                !showFeedback && "border-border hover:border-primary hover:bg-secondary",
                showFeedback && isCorrect && "border-success bg-success/10",
                showFeedback && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                showFeedback && !isSelected && !isCorrect && "border-border opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{option}</span>
                {showFeedback && isCorrect && <Check className="w-5 h-5 text-success" />}
                {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
              </div>
            </button>
          )
        })}
      </div>

      {showExplanation && (
        <div className="mt-4 p-4 bg-secondary rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-foreground">
            <span className="font-medium">Explanation: </span>
            {explanation}
          </p>
        </div>
      )}
    </div>
  )
}
