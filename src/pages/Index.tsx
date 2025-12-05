import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Gamepad2 } from "lucide-react";
import { DayScheduler, ScheduleEvent } from "@/components/DayScheduler";
import { AIChatDialog } from "@/components/AIChatDialog";
import { Timer } from "@/components/Timer";
import { Stopwatch } from "@/components/Stopwatch";
import { Notepad } from "@/components/Notepad";
import { StarField } from "@/components/StarField";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChessGame } from "@/components/ChessGame";
import { TicTacToe } from "@/components/TicTacToe";
import { SnakeGame } from "@/components/SnakeGame";
import { Game2048 } from "@/components/Game2048";
import { MemoryGame } from "@/components/MemoryGame";
import { Minesweeper } from "@/components/Minesweeper";
const INITIAL_HABITS = [
  { id: 1, name: "Wake Up at Same Time", goal: 31 },
  { id: 2, name: "Make Your Bed", goal: 31 },
  { id: 3, name: "Morning Walk", goal: 31 },
  { id: 4, name: "Breakfast As Per Diet Plan", goal: 28 },
  { id: 5, name: "Read 5 Pages", goal: 160 },
  { id: 6, name: "Review To-Do List", goal: 50 },
  { id: 7, name: "Drink 6-8 Glasses Water", goal: 186 },
  { id: 8, name: "Write Top 3 Tasks", goal: 31 },
  { id: 9, name: "No Junk Food", goal: 31 },
  { id: 10, name: "Get Sunlight for 15 Minutes", goal: 155 },
  { id: 11, name: "Write Journal", goal: 31 },
  { id: 12, name: "Limit Screen Time", goal: 62 },
  { id: 13, name: "Daily Prayers", goal: 155 },
  { id: 14, name: "Clean Your Room", goal: 30 },
  { id: 15, name: "Prepare Tomorrow's Plan", goal: 10 },
  { id: 16, name: "Review Your Day", goal: 10 },
  { id: 17, name: "No Screen 1 Hour Before Bed", goal: 31 },
  { id: 18, name: "Sleep At Same Time", goal: 31 },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const YEARS = [2024, 2025, 2026, 2027];

interface MonthlyData {
  [key: string]: Array<{
    id: number;
    name: string;
    goal: number;
    days: boolean[];
  }>;
}

interface ScheduleData {
  [key: string]: { [day: number]: ScheduleEvent[] };
}

const getMonthKey = (year: number, month: number) => `${year}-${month}`;

const getDefaultHabits = () => INITIAL_HABITS.map(habit => ({
  ...habit,
  days: Array(31).fill(false)
}));

const Index = () => {
  const [year, setYear] = useState(() => {
    const saved = localStorage.getItem('habitTrackerYear');
    return saved ? parseInt(saved) : 2025;
  });
  
  const [monthIndex, setMonthIndex] = useState(() => {
    const saved = localStorage.getItem('habitTrackerMonth');
    return saved ? parseInt(saved) : 4; // May = index 4
  });

  const monthKey = getMonthKey(year, monthIndex);
  
  // Load all monthly data from localStorage
  const [allMonthlyData, setAllMonthlyData] = useState<MonthlyData>(() => {
    const saved = localStorage.getItem('habitTrackerMonthlyData');
    if (saved) {
      return JSON.parse(saved);
    }
    // Migrate old data if exists
    const oldData = localStorage.getItem('habitTrackerData');
    if (oldData) {
      const oldYear = localStorage.getItem('habitTrackerYear') || '2025';
      const oldMonth = localStorage.getItem('habitTrackerMonth') || '4';
      return { [getMonthKey(parseInt(oldYear), parseInt(oldMonth))]: JSON.parse(oldData) };
    }
    return {};
  });

  // Get habits for current month
  const habits = allMonthlyData[monthKey] || getDefaultHabits();

  const setHabits = (updater: (prev: typeof habits) => typeof habits) => {
    setAllMonthlyData(prev => ({
      ...prev,
      [monthKey]: typeof updater === 'function' ? updater(prev[monthKey] || getDefaultHabits()) : updater
    }));
  };

  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  
  // Schedule events state
  const [allScheduleData, setAllScheduleData] = useState<ScheduleData>(() => {
    const saved = localStorage.getItem('habitTrackerSchedule');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<number | null>(null);
  
  const scheduleEvents = allScheduleData[monthKey] || {};
  
  const setScheduleEventsForDay = (day: number, events: ScheduleEvent[]) => {
    setAllScheduleData(prev => ({
      ...prev,
      [monthKey]: {
        ...(prev[monthKey] || {}),
        [day]: events
      }
    }));
  };

  // Save all monthly data to localStorage
  useEffect(() => {
    localStorage.setItem('habitTrackerMonthlyData', JSON.stringify(allMonthlyData));
  }, [allMonthlyData]);
  
  // Save schedule data to localStorage
  useEffect(() => {
    localStorage.setItem('habitTrackerSchedule', JSON.stringify(allScheduleData));
  }, [allScheduleData]);

  // Save year and month to localStorage
  useEffect(() => {
    localStorage.setItem('habitTrackerYear', year.toString());
  }, [year]);

  useEffect(() => {
    localStorage.setItem('habitTrackerMonth', monthIndex.toString());
  }, [monthIndex]);

  const daysInMonth = useMemo(() => {
    const days = DAYS_IN_MONTH[monthIndex];
    return monthIndex === 1 && year % 4 === 0 ? 29 : days;
  }, [year, monthIndex]);

  const toggleDay = (habitId: number, dayIndex: number) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, days: habit.days.map((checked, i) => i === dayIndex ? !checked : checked) }
        : habit
    ));
  };

  const startEditingHabit = (habitId: number, currentName: string) => {
    setEditingHabitId(habitId);
    setEditingName(currentName);
  };

  const saveHabitName = () => {
    if (editingHabitId !== null && editingName.trim()) {
      setHabits(prev => prev.map(habit =>
        habit.id === editingHabitId
          ? { ...habit, name: editingName.trim() }
          : habit
      ));
    }
    setEditingHabitId(null);
    setEditingName("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveHabitName();
    } else if (e.key === 'Escape') {
      setEditingHabitId(null);
      setEditingName("");
    }
  };

  const addNewHabit = () => {
    if (newHabitName.trim()) {
      const newId = Math.max(...habits.map(h => h.id)) + 1;
      setHabits(prev => [...prev, {
        id: newId,
        name: newHabitName.trim(),
        goal: daysInMonth,
        days: Array(31).fill(false)
      }]);
      setNewHabitName("");
      setIsDialogOpen(false);
    }
  };

  const deleteHabit = (habitId: number) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  // Calculate daily completion percentage
  const dailyData = useMemo(() => {
    const data = [];
    for (let day = 0; day < daysInMonth; day++) {
      const totalHabits = habits.length;
      const completedHabits = habits.filter(h => h.days[day]).length;
      const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
      data.push({ day: day + 1, percentage });
    }
    return data;
  }, [habits, daysInMonth]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weeks = [
      { start: 0, end: 7, color: "week-1", name: "WEEK 1" },
      { start: 7, end: 14, color: "week-2", name: "WEEK 2" },
      { start: 14, end: 21, color: "week-3", name: "WEEK 3" },
      { start: 21, end: 28, color: "week-4", name: "WEEK 4" },
      { start: 28, end: daysInMonth, color: "week-5", name: "WEEK 5" },
    ];

    return weeks.map(week => {
      let completed = 0;
      let total = 0;
      const daysInWeek = Math.min(week.end, daysInMonth) - week.start;
      
      for (let day = week.start; day < Math.min(week.end, daysInMonth); day++) {
        habits.forEach(habit => {
          if (habit.days[day]) completed++;
          total++;
        });
      }

      const goal = habits.length * daysInWeek;
      const left = goal - completed;
      const percentage = goal > 0 ? (completed / goal) * 100 : 0;

      return { ...week, completed, goal, left, percentage };
    });
  }, [habits, daysInMonth]);

  // Calculate habit progress
  const habitProgress = useMemo(() => {
    return habits.map(habit => {
      const completed = habit.days.slice(0, daysInMonth).filter(Boolean).length;
      const left = daysInMonth - completed;
      const percentage = daysInMonth > 0 ? (completed / daysInMonth) * 100 : 0;
      return { ...habit, completed, left, percentage };
    });
  }, [habits, daysInMonth]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalPossible = habits.length * daysInMonth;
    const totalCompleted = habits.reduce((sum, habit) => 
      sum + habit.days.slice(0, daysInMonth).filter(Boolean).length, 0
    );
    const completedPercentage = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
    const leftPercentage = 100 - completedPercentage;
    
    return [
      { name: "COMPLETED", value: completedPercentage, color: "hsl(var(--progress-fill))" },
      { name: "LEFT", value: leftPercentage, color: "hsl(var(--progress-bg))" },
    ];
  }, [habits, daysInMonth]);

  // Top 10 habits
  const top10Habits = useMemo(() => {
    return [...habitProgress]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);
  }, [habitProgress]);

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      <StarField />
      <div className="max-w-[1600px] mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-primary rounded-lg p-4 relative overflow-hidden hover-lift hover-glow animate-card-enter" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <h1 className="text-2xl font-bold text-primary-foreground text-center relative z-10">HABIT TRACKER</h1>
            <p className="text-center text-primary-foreground text-sm mt-2 relative z-10">- {MONTHS[monthIndex]} -</p>
          </div>
          
          <div className="glass-primary rounded-lg p-4 space-y-2 hover-lift animate-card-enter" style={{ animationDelay: '100ms' }}>
            <div className="text-primary-foreground font-semibold text-sm text-center mb-2">CALENDAR SETTINGS</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-primary-foreground block mb-1">YEARS</label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm border-border/50 transition-all duration-200 hover:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-primary-foreground block mb-1">MONTHS</label>
                <Select value={monthIndex.toString()} onValueChange={(v) => setMonthIndex(parseInt(v))}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm border-border/50 transition-all duration-200 hover:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {MONTHS.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="glass-secondary rounded-lg p-4 flex items-center justify-between hover-lift animate-card-enter" style={{ animationDelay: '200ms' }}>
            <div className="text-secondary-foreground font-bold text-lg">OVERVIEW</div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AIChatDialog
              existingEvents={scheduleEvents}
              onAddSchedule={(events) => {
                const EVENT_COLORS = [
                  "hsl(var(--week-1))",
                  "hsl(var(--week-2))",
                  "hsl(var(--week-3))",
                  "hsl(var(--week-4))",
                  "hsl(var(--week-5))",
                ];
                events.forEach((event, idx) => {
                  const existing = scheduleEvents[event.day] || [];
                  const newEvent = {
                    id: Date.now() + idx,
                    title: event.title,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    color: EVENT_COLORS[idx % EVENT_COLORS.length],
                  };
                  setScheduleEventsForDay(event.day, [...existing, newEvent]);
                });
              }}
              onRescheduleEvents={(changes) => {
                changes.forEach((change) => {
                  // Remove from original day
                  const originalDayEvents = scheduleEvents[change.originalDay] || [];
                  const eventToMove = originalDayEvents.find(e => e.id === change.eventId);
                  if (eventToMove) {
                    setScheduleEventsForDay(
                      change.originalDay,
                      originalDayEvents.filter(e => e.id !== change.eventId)
                    );
                    // Add to new day with updated times
                    const newDayEvents = scheduleEvents[change.newDay] || [];
                    setScheduleEventsForDay(change.newDay, [
                      ...newDayEvents,
                      {
                        ...eventToMove,
                        startTime: change.newStartTime,
                        endTime: change.newEndTime,
                      },
                    ]);
                  }
                });
              }}
              onDeleteEvents={(deletions) => {
                deletions.forEach((deletion) => {
                  const dayEvents = scheduleEvents[deletion.day] || [];
                  setScheduleEventsForDay(
                    deletion.day,
                    dayEvents.filter(e => e.id !== deletion.eventId)
                  );
                });
              }}
            />
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="glass-card rounded-lg p-4 hover-lift animate-card-enter" style={{ animationDelay: '300ms' }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', backdropFilter: 'blur(8px)' }} />
              <Line type="monotone" dataKey="percentage" stroke="hsl(var(--chart-line))" fill="hsl(var(--chart-area))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress Headers */}
        <div className="grid grid-cols-5 gap-2">
          {weeklyStats.map((week, idx) => (
            <div 
              key={idx} 
              className="backdrop-blur-sm rounded-lg border border-border/30 p-2 hover-lift hover-scale transition-all duration-300 animate-card-enter"
              style={{ backgroundColor: `hsl(var(--${week.color}) / 0.7)`, animationDelay: `${400 + idx * 50}ms` }}
            >
              <div className="font-bold text-xs text-center text-foreground">{week.name}</div>
              <div className="grid grid-cols-7 gap-1 mt-2 text-xs text-center">
                {Array.from({ length: 7 }).map((_, i) => {
                  const dayNum = week.start + i + 1;
                  if (dayNum > daysInMonth) return <div key={i} />;
                  const date = new Date(year, monthIndex, dayNum);
                  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                  const hasEvents = (scheduleEvents[dayNum] || []).length > 0;
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedScheduleDay(dayNum)}
                      className="cursor-pointer hover:bg-background/50 rounded-md p-0.5 transition-all duration-200 hover:scale-110"
                      title="Click to schedule"
                    >
                      <div className="font-semibold">{dayName.slice(0, 3)}</div>
                      <div className="relative">
                        {dayNum}
                        {hasEvents && (
                          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full pulse-glow" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Progress Stats */}
        <div className="glass-secondary rounded-lg p-4 hover-lift animate-card-enter" style={{ animationDelay: '650ms' }}>
          <div className="font-bold text-center mb-4">WEEKLY PROGRESS BY GRAPH</div>
          <div className="grid grid-cols-5 gap-4">
            {weeklyStats.map((week, idx) => (
              <div key={idx} className="space-y-1 hover-scale transition-transform duration-200">
                <div 
                  style={{ backgroundColor: `hsl(var(--${week.color}))`, height: `${Math.max(week.percentage, 10)}px` }} 
                  className="w-full rounded-t-md border border-border/50 transition-all duration-500" 
                />
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="font-semibold">COMPLETED</span><span>{week.completed}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">GOAL</span><span>{week.goal}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">LEFT</span><span>{week.left}</span></div>
                  <div className="text-center font-bold">{week.completed}/{week.goal}</div>
                  <div className="text-center font-bold">{week.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid and Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Main Habit Grid */}
          <div className="xl:col-span-3 glass-card rounded-lg overflow-x-auto animate-card-enter" style={{ animationDelay: '700ms' }}>
            <div className="p-4 border-b border-border/30">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 hover-lift hover-glow transition-all duration-300">
                    <Plus size={16} />
                    Add New Habit
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel">
                  <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="habit-name">Habit Name</Label>
                      <Input
                        id="habit-name"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addNewHabit()}
                        placeholder="Enter habit name..."
                        autoFocus
                        className="bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                    <Button onClick={addNewHabit} className="w-full hover-glow">
                      Add Habit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-secondary/50 backdrop-blur-sm">
                  <th className="border border-border/30 p-1 sticky left-0 bg-secondary/80 backdrop-blur-sm z-10 w-12">#</th>
                  <th className="border border-border/30 p-2 text-left sticky left-12 bg-secondary/80 backdrop-blur-sm z-10 min-w-[200px]">DAILY HABITS</th>
                  <th className="border border-border/30 p-1 sticky left-[248px] bg-secondary/80 backdrop-blur-sm z-10 w-12"></th>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const weekIdx = Math.floor(i / 7);
                    const weekColor = weeklyStats[weekIdx]?.color || "week-1";
                    return (
                      <th key={i} style={{ backgroundColor: `hsl(var(--${weekColor}) / 0.6)` }} className="border border-border/30 p-1 w-8 backdrop-blur-sm">{i + 1}</th>
                    );
                  })}
                  <th className="border border-border/30 p-1 bg-secondary/80 backdrop-blur-sm">COMPLETED</th>
                  <th className="border border-border/30 p-1 bg-secondary/80 backdrop-blur-sm">LEFT</th>
                  <th className="border border-border/30 p-1 bg-secondary/80 backdrop-blur-sm min-w-[150px]">PROGRESS</th>
                </tr>
              </thead>
              <tbody>
                {habitProgress.map((habit, hIdx) => (
                  <tr key={habit.id} className="hover:bg-muted/30 transition-colors duration-200">
                    <td className="border border-border/30 p-1 text-center sticky left-0 bg-card/80 backdrop-blur-sm w-12">{hIdx + 1}</td>
                    <td className="border border-border/30 p-2 sticky left-12 bg-card/80 backdrop-blur-sm">
                      {editingHabitId === habit.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={saveHabitName}
                          onKeyDown={handleNameKeyDown}
                          className="w-full bg-background/80 backdrop-blur-sm border border-border/50 px-1 text-xs rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => startEditingHabit(habit.id, habit.name)}
                          className="cursor-pointer hover:text-primary transition-colors duration-200"
                          title="Double-click to edit"
                        >
                          {habit.name}
                        </span>
                      )}
                    </td>
                    <td className="border border-border/30 p-1 text-center sticky left-[248px] bg-card/80 backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-110"
                        title="Delete habit"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                    {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                      const weekIdx = Math.floor(dayIdx / 7);
                      const weekColor = weeklyStats[weekIdx]?.color || "week-1";
                      return (
                        <td key={dayIdx} style={{ backgroundColor: `hsl(var(--${weekColor}) / 0.4)` }} className="border border-border/30 p-1 text-center">
                          <Checkbox 
                            checked={habit.days[dayIdx]} 
                            onCheckedChange={() => toggleDay(habit.id, dayIdx)}
                            className="mx-auto transition-transform duration-200 hover:scale-110"
                          />
                        </td>
                      );
                    })}
                    <td className="border border-border/30 p-1 text-center bg-card/80 backdrop-blur-sm">{habit.completed}</td>
                    <td className="border border-border/30 p-1 text-center bg-card/80 backdrop-blur-sm">{habit.left}</td>
                    <td className="border border-border/30 p-1 bg-card/80 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 bg-progress-bg/50 rounded-sm overflow-hidden backdrop-blur-sm">
                          <div 
                            className="h-full bg-progress-fill transition-all duration-500 ease-out" 
                            style={{ width: `${habit.percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold">{habit.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Timer & Stopwatch */}
            <Timer />
            <Stopwatch />
            
            {/* Notepad */}
            <Notepad />
            
            {/* Games Section */}
            <div className="glass-card rounded-lg p-4 hover-lift animate-card-enter" style={{ animationDelay: '750ms' }}>
              <h3 className="font-bold text-center mb-3 flex items-center justify-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                GAMES
              </h3>
              <div className="space-y-2">
                <ChessGame />
                <TicTacToe />
                <SnakeGame />
                <Game2048 />
                <MemoryGame />
                <Minesweeper />
              </div>
            </div>
            
            {/* Overview Daily Progress */}
            <div className="glass-primary rounded-lg p-4 hover-lift animate-card-enter" style={{ animationDelay: '800ms' }}>
              <h3 className="font-bold text-center text-primary-foreground mb-4">OVERVIEW DAILY PROGRESS</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={overallProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {overallProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card) / 0.9)', border: '1px solid hsl(var(--border) / 0.3)', borderRadius: '8px', backdropFilter: 'blur(8px)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-xs">
                {overallProgress.map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-primary-foreground">
                    <span className="font-semibold">{entry.name}</span>
                    <span>{entry.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Habits */}
            <div className="glass-primary rounded-lg p-4 hover-lift animate-card-enter" style={{ animationDelay: '900ms' }}>
              <h3 className="font-bold text-center text-primary-foreground mb-4">TOP 10 DAILY HABITS</h3>
              <div className="space-y-2">
                {top10Habits.map((habit, idx) => (
                  <div key={habit.id} className="flex items-center gap-2 text-xs text-primary-foreground hover:bg-primary-foreground/10 rounded px-1 py-0.5 transition-colors duration-200">
                    <span className="font-bold w-6">{idx + 1}</span>
                    <span className="flex-1">{habit.name}</span>
                    <span className="font-semibold">{habit.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Day Scheduler Dialog */}
      <DayScheduler
        isOpen={selectedScheduleDay !== null}
        onClose={() => setSelectedScheduleDay(null)}
        date={new Date(year, monthIndex, selectedScheduleDay || 1)}
        events={scheduleEvents[selectedScheduleDay || 1] || []}
        onEventsChange={(events) => {
          if (selectedScheduleDay) {
            setScheduleEventsForDay(selectedScheduleDay, events);
          }
        }}
      />
    </div>
  );
};

export default Index;
