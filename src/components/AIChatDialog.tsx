import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2, Calendar, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  schedule?: SchedulePlan;
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

interface AIChatDialogProps {
  onAddSchedule?: (events: ScheduleEvent[]) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const AIChatDialog = ({ onAddSchedule }: AIChatDialogProps) => {
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
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
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
      let toolCallArgs = "";
      let isToolCall = false;

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
            
            // Handle tool calls
            if (delta?.tool_calls) {
              isToolCall = true;
              const toolCall = delta.tool_calls[0];
              if (toolCall?.function?.arguments) {
                toolCallArgs += toolCall.function.arguments;
              }
            }
            
            // Handle regular content
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
      if (isToolCall && toolCallArgs) {
        try {
          const schedule = JSON.parse(toolCallArgs) as SchedulePlan;
          const responseText = `I've created a "${schedule.title}" schedule for you with ${schedule.events.length} events. ${schedule.description}\n\nClick the button below to add these events to your calendar.`;
          
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: "assistant", 
              content: responseText,
              schedule 
            };
            return updated;
          });
        } catch (e) {
          console.error("Failed to parse schedule:", e);
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
      toast({
        title: "Schedule Added",
        description: `Added ${schedule.events.length} events to your calendar.`,
      });
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
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
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
                <p className="text-xs mt-2">I can help with motivation, habit strategies, and creating schedules.</p>
                <p className="text-xs mt-1 text-primary">Try: "Create a 30-day React learning schedule"</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-primary-foreground" />
                  </div>
                )}
                <div className="max-w-[80%] space-y-2">
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
                    <Button 
                      size="sm" 
                      className="gap-2 w-full"
                      onClick={() => handleAddSchedule(msg.schedule!)}
                    >
                      <Calendar size={14} />
                      Add {msg.schedule.events.length} Events to Calendar
                    </Button>
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
              placeholder="Ask about habits or request a schedule..."
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
