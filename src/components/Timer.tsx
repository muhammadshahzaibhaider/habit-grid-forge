import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Bell, BellOff } from "lucide-react";

export const Timer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio context for alarm
  useEffect(() => {
    // Create an oscillator-based alarm
    audioRef.current = null;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (time: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      
      oscillator.start(time);
      oscillator.stop(time + 0.3);
    };

    // Play beeps
    for (let i = 0; i < 5; i++) {
      playBeep(audioContext.currentTime + i * 0.5);
    }

    setTimeout(() => setIsAlarmPlaying(false), 2500);
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  const startTimer = () => {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total > 0) {
      setTotalSeconds(total);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTotalSeconds(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    stopAlarm();
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-2 border-border bg-card p-4 space-y-4">
      <h3 className="font-bold text-center text-sm">TIMER</h3>
      
      {totalSeconds === 0 && !isRunning ? (
        <div className="flex gap-2 justify-center">
          <div className="text-center">
            <label className="text-xs block mb-1">Hours</label>
            <Input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center text-sm"
            />
          </div>
          <div className="text-center">
            <label className="text-xs block mb-1">Min</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-16 text-center text-sm"
            />
          </div>
          <div className="text-center">
            <label className="text-xs block mb-1">Sec</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-16 text-center text-sm"
            />
          </div>
        </div>
      ) : (
        <div className={`text-3xl font-mono text-center font-bold ${isAlarmPlaying ? "text-destructive animate-pulse" : ""}`}>
          {formatTime(totalSeconds)}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {!isRunning && totalSeconds === 0 ? (
          <Button size="sm" onClick={startTimer} className="gap-1">
            <Play size={14} />
            Start
          </Button>
        ) : isRunning ? (
          <Button size="sm" onClick={pauseTimer} variant="secondary" className="gap-1">
            <Pause size={14} />
            Pause
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIsRunning(true)} className="gap-1">
            <Play size={14} />
            Resume
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={resetTimer} className="gap-1">
          <RotateCcw size={14} />
          Reset
        </Button>
        {isAlarmPlaying && (
          <Button size="sm" variant="destructive" onClick={stopAlarm} className="gap-1">
            <BellOff size={14} />
            Stop Alarm
          </Button>
        )}
      </div>
    </div>
  );
};
