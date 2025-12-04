import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, Pencil } from "lucide-react";

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
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: EVENT_COLORS[0].value,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({ title: "", startTime: "09:00", endTime: "10:00", color: EVENT_COLORS[0].value });
    setIsFormOpen(false);
    setEditingEventId(null);
  };

  const startAddingEvent = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const startEditingEvent = (event: ScheduleEvent) => {
    setFormData({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
    });
    setEditingEventId(event.id);
    setIsFormOpen(true);
  };

  const saveEvent = () => {
    if (formData.title && formData.startTime && formData.endTime) {
      if (editingEventId !== null) {
        // Update existing event
        const updatedEvents = events.map((e) =>
          e.id === editingEventId
            ? { ...e, title: formData.title!, startTime: formData.startTime!, endTime: formData.endTime!, color: formData.color || EVENT_COLORS[0].value }
            : e
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
        onEventsChange(updatedEvents);
      } else {
        // Add new event
        const event: ScheduleEvent = {
          id: Date.now(),
          title: formData.title,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: formData.color || EVENT_COLORS[0].value,
        };
        onEventsChange([...events, event].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      }
      resetForm();
    }
  };

  const deleteEvent = (id: number) => {
    onEventsChange(events.filter((e) => e.id !== id));
    if (editingEventId === id) {
      resetForm();
    }
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
                    className={`absolute left-12 right-2 rounded px-2 py-1 text-xs overflow-hidden group cursor-pointer transition-opacity ${editingEventId === event.id ? "ring-2 ring-foreground" : ""}`}
                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: event.color }}
                    onClick={() => startEditingEvent(event)}
                  >
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-[10px] opacity-80">{event.startTime} - {event.endTime}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add/Edit Event Panel */}
          <div className="w-64 space-y-4">
            <Button onClick={startAddingEvent} className="w-full gap-2" disabled={isFormOpen && editingEventId === null}>
              <Plus size={16} />
              Add Event
            </Button>

            {isFormOpen && (
              <div className="space-y-3 p-3 border border-border rounded-md bg-muted/50">
                <div className="text-xs font-semibold text-muted-foreground">
                  {editingEventId !== null ? "Edit Event" : "New Event"}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Event Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                        className={`w-6 h-6 rounded-full border-2 ${formData.color === color.value ? "border-foreground" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEvent} className="flex-1">
                    {editingEventId !== null ? "Update" : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
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
                      className={`p-2 rounded text-xs flex items-center gap-2 cursor-pointer transition-opacity ${editingEventId === event.id ? "ring-2 ring-foreground" : ""}`}
                      style={{ backgroundColor: event.color }}
                      onClick={() => startEditingEvent(event)}
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{event.title}</div>
                        <div className="opacity-80">{event.startTime} - {event.endTime}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-primary/20"
                        onClick={(e) => { e.stopPropagation(); startEditingEvent(event); }}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
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