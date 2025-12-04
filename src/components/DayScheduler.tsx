import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock } from "lucide-react";

export interface ScheduleEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DaySchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: ScheduleEvent[];
  onEventsChange: (events: ScheduleEvent[]) => void;
}

const EVENT_COLORS = [
  { value: "hsl(var(--week-1))", label: "Red" },
  { value: "hsl(var(--week-2))", label: "Purple" },
  { value: "hsl(var(--week-3))", label: "Green" },
  { value: "hsl(var(--week-4))", label: "Blue" },
  { value: "hsl(var(--week-5))", label: "Orange" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export const DayScheduler = ({ isOpen, onClose, date, events, onEventsChange }: DaySchedulerProps) => {
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: EVENT_COLORS[0].value,
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const addEvent = () => {
    if (newEvent.title && newEvent.startTime && newEvent.endTime) {
      const event: ScheduleEvent = {
        id: Date.now(),
        title: newEvent.title,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        color: newEvent.color || EVENT_COLORS[0].value,
      };
      onEventsChange([...events, event].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setNewEvent({ title: "", startTime: "09:00", endTime: "10:00", color: EVENT_COLORS[0].value });
      setIsAddingEvent(false);
    }
  };

  const deleteEvent = (id: number) => {
    onEventsChange(events.filter((e) => e.id !== id));
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const getEventPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const top = (startHour + startMin / 60) * 48; // 48px per hour
    const height = ((endHour - startHour) + (endMin - startMin) / 60) * 48;
    return { top, height: Math.max(height, 24) };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={20} />
            {formatDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Timeline View */}
          <div className="flex-1 border border-border rounded-md overflow-y-auto relative">
            <div className="relative" style={{ height: "1152px" }}> {/* 24 hours * 48px */}
              {/* Hour lines */}
              {HOURS.map((hour, i) => (
                <div key={hour} className="absolute w-full border-t border-border/50 flex" style={{ top: `${i * 48}px` }}>
                  <span className="text-[10px] text-muted-foreground w-12 px-1 bg-background">{hour}</span>
                </div>
              ))}
              
              {/* Events */}
              {events.map((event) => {
                const { top, height } = getEventPosition(event.startTime, event.endTime);
                return (
                  <div
                    key={event.id}
                    className="absolute left-12 right-2 rounded px-2 py-1 text-xs overflow-hidden group"
                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: event.color }}
                  >
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-[10px] opacity-80">{event.startTime} - {event.endTime}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Event Panel */}
          <div className="w-64 space-y-4">
            <Button onClick={() => setIsAddingEvent(true)} className="w-full gap-2" disabled={isAddingEvent}>
              <Plus size={16} />
              Add Event
            </Button>

            {isAddingEvent && (
              <div className="space-y-3 p-3 border border-border rounded-md bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-xs">Event Title</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Meeting, Task..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-1">
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color.label}
                        className={`w-6 h-6 rounded-full border-2 ${newEvent.color === color.value ? "border-foreground" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addEvent} className="flex-1">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Event List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Events ({events.length})</h4>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events scheduled</p>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded text-xs flex items-center gap-2"
                      style={{ backgroundColor: event.color }}
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{event.title}</div>
                        <div className="opacity-80">{event.startTime} - {event.endTime}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
