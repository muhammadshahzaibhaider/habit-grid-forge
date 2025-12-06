import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, Send, Bot, User, Loader2, Calendar, Trash2, RefreshCw,
  BookOpen, Brain, Target, Lightbulb, Clock, FileText, Sparkles, 
  GraduationCap, Zap, HelpCircle, ListChecks, PenTool, Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MindMap } from "./MindMap";

interface Message {
  role: "user" | "assistant";
  content: string;
  schedule?: SchedulePlan;
  reschedule?: ReschedulePlan;
  deletions?: DeletionPlan;
  mindmap?: MindMapData;
  flashcards?: FlashcardData;
  summary?: SummaryData;
  quiz?: QuizData;
}

interface ScheduleEvent {
  day: number;
  title: string;
  startTime: string;
  endTime: string;
}

interface SchedulePlan {
  title: string;
  description: string;
  events: ScheduleEvent[];
}

interface RescheduleChange {
  eventId: number;
  originalDay: number;
  newDay: number;
  newStartTime: string;
  newEndTime: string;
}

interface ReschedulePlan {
  changes: RescheduleChange[];
  message: string;
}

interface DeletionItem {
  eventId: number;
  day: number;
}

interface DeletionPlan {
  deletions: DeletionItem[];
  message: string;
}

interface MindMapNode {
  id: string;
  label: string;
  parentId?: string | null;
  color?: string;
}

interface MindMapData {
  title: string;
  nodes: MindMapNode[];
}

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardData {
  title: string;
  cards: Flashcard[];
}

interface SummaryData {
  title: string;
  keyPoints: string[];
  summary: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface ExistingEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface AIChatDialogProps {
  onAddSchedule?: (events: ScheduleEvent[]) => void;
  onRescheduleEvents?: (changes: RescheduleChange[]) => void;
  onDeleteEvents?: (deletions: DeletionItem[]) => void;
  existingEvents?: { [day: number]: ExistingEvent[] };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

type AIMode = "coach" | "study" | "quiz" | "explain";

const AI_MODES = [
  { id: "coach" as AIMode, label: "Coach", icon: Target, description: "Habit & motivation coaching" },
  { id: "study" as AIMode, label: "Study", icon: BookOpen, description: "Study helper & notes" },
  { id: "quiz" as AIMode, label: "Quiz", icon: HelpCircle, description: "Test your knowledge" },
  { id: "explain" as AIMode, label: "Explain", icon: Lightbulb, description: "Explain any topic" },
];

const QUICK_ACTIONS = {
  coach: [
    { label: "Create Study Schedule", prompt: "Create a 7-day study schedule for me with 2-hour daily sessions", icon: Calendar },
    { label: "Motivation Tips", prompt: "Give me 5 powerful motivation tips to stay focused while studying", icon: Zap },
    { label: "Break Bad Habits", prompt: "How can I break the habit of procrastination?", icon: Target },
    { label: "Morning Routine", prompt: "Create an ideal morning routine for a student", icon: Clock },
  ],
  study: [
    { label: "Summarize Topic", prompt: "Summarize the key concepts of [topic]", icon: FileText },
    { label: "Create Flashcards", prompt: "Create flashcards for studying [topic]", icon: PenTool },
    { label: "Mind Map", prompt: "Create a mind map for [topic]", icon: Brain },
    { label: "Study Plan", prompt: "Create a study plan for my upcoming exam in [subject]", icon: ListChecks },
  ],
  quiz: [
    { label: "Quick Quiz", prompt: "Quiz me on [topic] with 5 multiple choice questions", icon: HelpCircle },
    { label: "Math Practice", prompt: "Give me 5 practice problems for [math topic]", icon: Calculator },
    { label: "Vocabulary Test", prompt: "Test my vocabulary with 10 words related to [subject]", icon: BookOpen },
    { label: "Concept Check", prompt: "Ask me questions to check my understanding of [topic]", icon: Brain },
  ],
  explain: [
    { label: "Explain Simply", prompt: "Explain [topic] like I'm 10 years old", icon: Lightbulb },
    { label: "Step by Step", prompt: "Explain step by step how to solve [problem]", icon: ListChecks },
    { label: "Real Examples", prompt: "Give me real-world examples of [concept]", icon: Sparkles },
    { label: "Compare & Contrast", prompt: "Compare and contrast [topic A] vs [topic B]", icon: Brain },
  ],
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const AIChatDialog = ({ 
  onAddSchedule, 
  onRescheduleEvents, 
  onDeleteEvents,
  existingEvents = {},
  open: controlledOpen,
  onOpenChange,
  showTrigger = true
}: AIChatDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  
  // Separate message history for each mode
  const [messagesByMode, setMessagesByMode] = useState<Record<AIMode, Message[]>>({
    coach: [],
    study: [],
    quiz: [],
    explain: [],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>("coach");
  const [showFlashcard, setShowFlashcard] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get current mode's messages
  const messages = messagesByMode[mode];
  const setMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setMessagesByMode(prev => ({
      ...prev,
      [mode]: typeof updater === 'function' ? updater(prev[mode]) : updater
    }));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: "user", content: userMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          existingEvents,
          mode
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (resp.status === 402) {
          throw new Error("Credits needed. Please add credits to continue.");
        }
        throw new Error(errorData.error || `Request failed with status ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let toolCallName = "";
      let toolCallArgs = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.tool_calls) {
              const toolCall = delta.tool_calls[0];
              if (toolCall?.function?.name) {
                toolCallName = toolCall.function.name;
              }
              if (toolCall?.function?.arguments) {
                toolCallArgs += toolCall.function.arguments;
              }
            }
            
            const content = delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Process tool call if present
      if (toolCallName && toolCallArgs) {
        try {
          const parsedArgs = JSON.parse(toolCallArgs);
          
          if (toolCallName === "create_schedule") {
            const schedule = parsedArgs as SchedulePlan;
            const responseText = `📅 **${schedule.title}**\n\n${schedule.description}\n\nI've prepared ${schedule.events.length} study sessions for you!`;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: responseText, schedule };
              return updated;
            });
          } else if (toolCallName === "reschedule_events") {
            const reschedule = parsedArgs as ReschedulePlan;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: reschedule.message, reschedule };
              return updated;
            });
          } else if (toolCallName === "delete_events") {
            const deletionPlan = parsedArgs as DeletionPlan;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: deletionPlan.message, deletions: deletionPlan };
              return updated;
            });
          } else if (toolCallName === "create_mindmap") {
            const mindmap = parsedArgs as MindMapData;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: `🧠 **Mind Map: ${mindmap.title}**`, mindmap };
              return updated;
            });
          } else if (toolCallName === "create_flashcards") {
            const flashcards = parsedArgs as FlashcardData;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: `📝 **Flashcards: ${flashcards.title}**\n\nClick cards to flip them!`, flashcards };
              return updated;
            });
            setShowFlashcard(null);
          } else if (toolCallName === "create_summary") {
            const summary = parsedArgs as SummaryData;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: `📚 **Summary: ${summary.title}**`, summary };
              return updated;
            });
          } else if (toolCallName === "create_quiz") {
            const quiz = parsedArgs as QuizData;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: `🎯 **Quiz: ${quiz.title}**\n\nSelect your answers below!`, quiz };
              return updated;
            });
            setQuizAnswers({});
            setShowQuizResults(false);
          }
        } catch (e) {
          console.error("Failed to parse tool call:", e);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const handleQuickAction = (prompt: string) => {
    if (prompt.includes("[")) {
      setInput(prompt);
    } else {
      streamChat(prompt);
    }
  };

  const handleAddSchedule = (schedule: SchedulePlan) => {
    if (onAddSchedule) {
      onAddSchedule(schedule.events);
      toast({ title: "✅ Schedule Added!", description: `Added ${schedule.events.length} events to your calendar.` });
    }
  };

  const handleReschedule = (reschedule: ReschedulePlan) => {
    if (onRescheduleEvents) {
      onRescheduleEvents(reschedule.changes);
      toast({ title: "✅ Events Rescheduled", description: `Rescheduled ${reschedule.changes.length} events.` });
    }
  };

  const handleDelete = (deletions: DeletionPlan) => {
    if (onDeleteEvents) {
      onDeleteEvents(deletions.deletions);
      toast({ title: "✅ Events Deleted", description: `Deleted ${deletions.deletions.length} events.` });
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const calculateQuizScore = (quiz: QuizData) => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });
    return { correct, total: quiz.questions.length };
  };

  const currentMode = AI_MODES.find(m => m.id === mode)!;
  const currentQuickActions = QUICK_ACTIONS[mode];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare size={16} />
            Chat with AI
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] h-[85vh] max-h-[800px] flex flex-col p-0 gap-0">
        {/* Header with Mode Selection */}
        <DialogHeader className="p-4 pb-2 border-b space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <GraduationCap size={20} className="text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold">AI Study Assistant</span>
              <p className="text-xs text-muted-foreground font-normal">Your personal learning companion</p>
            </div>
          </DialogTitle>
          
          <Tabs value={mode} onValueChange={(v) => setMode(v as AIMode)} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-muted/50">
              {AI_MODES.map((m) => (
                <TabsTrigger 
                  key={m.id} 
                  value={m.id}
                  className="flex flex-col items-center gap-1 py-2 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <m.icon size={16} />
                  <span className="text-xs font-medium">{m.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </DialogHeader>
        
        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <currentMode.icon size={32} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{currentMode.label} Mode</h3>
                  <p className="text-sm text-muted-foreground">{currentMode.description}</p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {currentQuickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-auto py-3 px-3 justify-start text-left gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                        onClick={() => handleQuickAction(action.prompt)}
                      >
                        <action.icon size={16} className="shrink-0 text-primary" />
                        <span className="text-xs font-medium">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Sparkles size={12} className="text-primary" />
                    Pro Tips
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Be specific about your subject or topic</li>
                    <li>• Ask for examples to understand better</li>
                    <li>• Request flashcards for memorization</li>
                    <li>• Use quizzes to test your knowledge</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-primary-foreground" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-3">
                  <div className={`rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-muted rounded-bl-sm"
                  }`}>
                    {msg.content || (isLoading && msg.role === "assistant" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    ) : null)}
                  </div>
                  
                  {/* Schedule Button */}
                  {msg.schedule && onAddSchedule && (
                    <Button size="sm" className="gap-2 w-full bg-green-600 hover:bg-green-700" onClick={() => handleAddSchedule(msg.schedule!)}>
                      <Calendar size={14} />
                      Add {msg.schedule.events.length} Events to Calendar
                    </Button>
                  )}

                  {/* Reschedule Button */}
                  {msg.reschedule && onRescheduleEvents && (
                    <Button size="sm" variant="secondary" className="gap-2 w-full" onClick={() => handleReschedule(msg.reschedule!)}>
                      <RefreshCw size={14} />
                      Apply {msg.reschedule.changes.length} Changes
                    </Button>
                  )}

                  {/* Delete Button */}
                  {msg.deletions && onDeleteEvents && (
                    <Button size="sm" variant="destructive" className="gap-2 w-full" onClick={() => handleDelete(msg.deletions!)}>
                      <Trash2 size={14} />
                      Delete {msg.deletions.deletions.length} Events
                    </Button>
                  )}

                  {/* Mind Map */}
                  {msg.mindmap && (
                    <MindMap title={msg.mindmap.title} nodes={msg.mindmap.nodes} />
                  )}

                  {/* Flashcards */}
                  {msg.flashcards && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {msg.flashcards.cards.map((card, cardIdx) => (
                          <div
                            key={cardIdx}
                            onClick={() => setShowFlashcard(showFlashcard === cardIdx ? null : cardIdx)}
                            className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 min-h-[80px] flex items-center justify-center text-center text-sm ${
                              showFlashcard === cardIdx 
                                ? 'bg-primary/10 border-primary' 
                                : 'bg-card border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="font-medium">
                              {showFlashcard === cardIdx ? card.back : card.front}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">Click cards to flip</p>
                    </div>
                  )}

                  {/* Summary */}
                  {msg.summary && (
                    <div className="bg-card border rounded-lg p-4 space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <FileText size={14} className="text-primary" />
                          Key Points
                        </h4>
                        <ul className="space-y-1">
                          {msg.summary.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">{msg.summary.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {msg.quiz && (
                    <div className="bg-card border rounded-lg p-4 space-y-4">
                      {msg.quiz.questions.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-2">
                          <p className="font-medium text-sm">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = quizAnswers[qIdx] === optIdx;
                              const isCorrect = q.correctAnswer === optIdx;
                              const showResult = showQuizResults && isSelected;
                              
                              return (
                                <Button
                                  key={optIdx}
                                  variant="outline"
                                  size="sm"
                                  disabled={showQuizResults}
                                  className={`h-auto py-2 px-3 text-left justify-start text-xs transition-all ${
                                    showResult 
                                      ? isCorrect 
                                        ? 'bg-green-500/20 border-green-500 text-green-700' 
                                        : 'bg-red-500/20 border-red-500 text-red-700'
                                      : isSelected 
                                        ? 'bg-primary/10 border-primary' 
                                        : ''
                                  } ${showQuizResults && isCorrect && !isSelected ? 'border-green-500' : ''}`}
                                  onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                >
                                  {opt}
                                </Button>
                              );
                            })}
                          </div>
                          {showQuizResults && quizAnswers[qIdx] !== undefined && quizAnswers[qIdx] !== q.correctAnswer && (
                            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {!showQuizResults && Object.keys(quizAnswers).length === msg.quiz.questions.length && (
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => setShowQuizResults(true)}
                        >
                          <Sparkles size={14} />
                          Check Answers
                        </Button>
                      )}
                      
                      {showQuizResults && (
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <p className="font-bold text-lg">
                            Score: {calculateQuizScore(msg.quiz).correct}/{calculateQuizScore(msg.quiz).total}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {calculateQuizScore(msg.quiz).correct === calculateQuizScore(msg.quiz).total 
                              ? "🎉 Perfect score!" 
                              : calculateQuizScore(msg.quiz).correct >= calculateQuizScore(msg.quiz).total / 2 
                                ? "👍 Good job! Keep practicing!" 
                                : "📚 Review the material and try again!"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Ask anything in ${currentMode.label} mode...`}
              disabled={isLoading}
              className="bg-background"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="px-4"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
