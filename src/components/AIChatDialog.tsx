import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2, Calendar, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MindMap } from "./MindMap";

interface Message {
  role: "user" | "assistant";
  content: string;
  schedule?: SchedulePlan;
  reschedule?: ReschedulePlan;
  deletions?: DeletionPlan;
  mindmap?: MindMapData;
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
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const AIChatDialog = ({ 
  onAddSchedule, 
  onRescheduleEvents, 
  onDeleteEvents,
  existingEvents = {}
}: AIChatDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
          existingEvents 
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
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
            const responseText = `I've created a "${schedule.title}" schedule with ${schedule.events.length} events. ${schedule.description}\n\nClick the button below to add these events to your calendar.`;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: responseText, schedule };
              return updated;
            });
          } else if (toolCallName === "reschedule_events") {
            const reschedule = parsedArgs as ReschedulePlan;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                role: "assistant", 
                content: reschedule.message,
                reschedule 
              };
              return updated;
            });
          } else if (toolCallName === "delete_events") {
            const deletionPlan = parsedArgs as DeletionPlan;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                role: "assistant", 
                content: deletionPlan.message,
                deletions: deletionPlan 
              };
              return updated;
            });
          } else if (toolCallName === "create_mindmap") {
            const mindmap = parsedArgs as MindMapData;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                role: "assistant", 
                content: `Here's a mind map for "${mindmap.title}":`,
                mindmap 
              };
              return updated;
            });
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

  const handleAddSchedule = (schedule: SchedulePlan) => {
    if (onAddSchedule) {
      onAddSchedule(schedule.events);
      toast({ title: "Schedule Added", description: `Added ${schedule.events.length} events to your calendar.` });
    }
  };

  const handleReschedule = (reschedule: ReschedulePlan) => {
    if (onRescheduleEvents) {
      onRescheduleEvents(reschedule.changes);
      toast({ title: "Events Rescheduled", description: `Rescheduled ${reschedule.changes.length} events.` });
    }
  };

  const handleDelete = (deletions: DeletionPlan) => {
    if (onDeleteEvents) {
      onDeleteEvents(deletions.deletions);
      toast({ title: "Events Deleted", description: `Deleted ${deletions.deletions.length} events.` });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare size={16} />
          Chat with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot size={20} />
            Habit Coach AI
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Ask me anything about building better habits!</p>
                <p className="text-xs mt-2">I can help with motivation, habit strategies, schedules, and mind maps.</p>
                <div className="text-xs mt-3 space-y-1 text-primary">
                  <p>"Create a 30-day React learning schedule"</p>
                  <p>"Reschedule my morning events to afternoon"</p>
                  <p>"Create a mind map about productivity"</p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-primary-foreground" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-2">
                  <div className={`rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {msg.content || (isLoading && msg.role === "assistant" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null)}
                  </div>
                  
                  {msg.schedule && onAddSchedule && (
                    <Button size="sm" className="gap-2 w-full" onClick={() => handleAddSchedule(msg.schedule!)}>
                      <Calendar size={14} />
                      Add {msg.schedule.events.length} Events to Calendar
                    </Button>
                  )}

                  {msg.reschedule && onRescheduleEvents && (
                    <Button size="sm" variant="secondary" className="gap-2 w-full" onClick={() => handleReschedule(msg.reschedule!)}>
                      <RefreshCw size={14} />
                      Apply {msg.reschedule.changes.length} Reschedule Changes
                    </Button>
                  )}

                  {msg.deletions && onDeleteEvents && (
                    <Button size="sm" variant="destructive" className="gap-2 w-full" onClick={() => handleDelete(msg.deletions!)}>
                      <Trash2 size={14} />
                      Delete {msg.deletions.deletions.length} Events
                    </Button>
                  )}

                  {msg.mindmap && (
                    <MindMap title={msg.mindmap.title} nodes={msg.mindmap.nodes} />
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about habits, schedules, or request a mind map..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
