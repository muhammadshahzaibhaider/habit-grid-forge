import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

export const Stopwatch = () => {
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setMilliseconds((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startStop = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setMilliseconds(0);
    setLaps([]);
  };

  const addLap = () => {
    if (isRunning) {
      setLaps((prev) => [...prev, milliseconds]);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-card rounded-lg p-4 space-y-4 hover-lift transition-all duration-300">
      <h3 className="font-bold text-center text-sm">STOPWATCH</h3>
      
      <div className="text-3xl font-mono text-center font-bold">
        {formatTime(milliseconds)}
      </div>

      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={startStop} className="gap-1 hover-glow transition-all duration-300" variant={isRunning ? "secondary" : "default"}>
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="outline" onClick={addLap} disabled={!isRunning} className="gap-1 bg-background/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:bg-background/80">
          <Flag size={14} />
          Lap
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className="gap-1 bg-background/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:bg-background/80">
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="border-t border-border/30 pt-2 mt-2">
          <div className="text-xs font-semibold mb-2">LAPS</div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {laps.map((lap, idx) => (
              <div key={idx} className="flex justify-between text-xs hover:bg-muted/30 rounded px-1 transition-colors duration-200">
                <span className="text-muted-foreground">Lap {idx + 1}</span>
                <span className="font-mono">{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
