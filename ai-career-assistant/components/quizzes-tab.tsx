import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, ChevronRight, Loader2, Play } from "lucide-react"
import { cn } from "@/lib/utils"

// Define types to match our API models
interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string | number;
  explanation: string
  topic: string // Expect topic in the question response
}

interface QuizResult {
  topic: string
  difficulty: string
  correct: boolean
}

const quizTopics = [
  "data science",
  "machine learning",
  "deep learning",
  "statistics",
  "data engineering",
  "AI ethics",
  "random"
];

export function QuizzesTab() {
  const [quizState, setQuizState] = useState<"setup" | "playing" | "finished">("setup");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState("random");
  
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])

  const fetchQuestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quiz?topic=${selectedTopic}&difficulty=easy`);
      if (!response.ok) throw new Error("Failed to fetch question");
      const data: QuizQuestion = await response.json();
      setCurrentQuestion(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuestionCount(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setResults([]);
    setQuizState("playing");
    fetchQuestion();
  }

  const handleAnswer = (index: number) => {
    if (!currentQuestion) return;

    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = (index + 1).toString() == currentQuestion.correct_answer.toString();
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setResults(prev => [...prev, {
      topic: currentQuestion.topic, // Use the topic from the fetched question
      difficulty: "easy",
      correct: isCorrect
    }]);
  }

  const submitResults = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/quiz/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "default_user",
          timestamp: new Date().toISOString(),
          type: "web_quiz",
          score: score,
          results: results,
        }),
      });
    } catch (error) {
      console.error("Failed to submit quiz results:", error);
    }
  }

  const handleNext = () => {
    if (questionCount < totalQuestions - 1) {
      setQuestionCount(questionCount + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      fetchQuestion()
    } else {
      setQuizState("finished")
      submitResults()
    }
  }

  // --- Render Logic ---

  if (quizState === "setup") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Start a New Quiz</h2>
          <p className="text-muted-foreground mb-6">Choose a topic and the number of questions.</p>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center"
                min="1"
                max="50"
              />
              <label className="text-muted-foreground flex items-center justify-start">Questions</label>
            </div>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic..." />
              </SelectTrigger>
              <SelectContent>
                {quizTopics.map(topic => (
                  <SelectItem key={topic} value={topic} className="capitalize">
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleStartQuiz} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Quiz
          </Button>
        </div>
      </div>
    )
  }

  if (quizState === "finished") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You scored {score} out of {totalQuestions}
          </p>
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {Math.round((score / totalQuestions) * 100)}%
            </div>
          </div>
          <Button onClick={() => setQuizState("setup")} className="w-full">
            Take Another Quiz
          </Button>
        </div>
      </div>
    )
  }
  
  if (isLoading || !currentQuestion) {
     return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading question...</p>
      </div>
    )
  }

  const progress = ((questionCount + 1) / totalQuestions) * 100;
  const question = currentQuestion;

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground capitalize">{question.topic} Quiz</h2>
          <span className="text-sm text-muted-foreground">
            Question {questionCount + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h3 className="text-xl font-semibold text-foreground mb-6">{question.question}</h3>

          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = (index + 1).toString() == question.correct_answer.toString()
              const showFeedback = showExplanation

              return (
                <button
                  key={index}
                  onClick={() => !showExplanation && handleAnswer(index)}
                  disabled={showExplanation}
                  className={cn(
                    "w-full text-left px-6 py-4 rounded-xl border-2 transition-all",
                    !showFeedback && "border-border hover:border-primary hover:bg-secondary",
                    showFeedback && isCorrect && "border-success bg-success/10",
                    showFeedback && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                    showFeedback && !isSelected && !isCorrect && "border-border opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    {showFeedback && isCorrect && <Check className="w-5 h-5 text-success" />}
                    {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
                  </div>
                </button>
              )
            })}
          </div>

          {showExplanation && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full">
                {questionCount < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}