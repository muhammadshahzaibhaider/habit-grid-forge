import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { RotateCcw, Gamepad2, Play, Pause } from "lucide-react";

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 15;
const INITIAL_SPEED = 150;

export const SnakeGame = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 7, y: 7 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
  };

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(prev => {
      const head = { ...prev[0] };
      const dir = directionRef.current;

      switch (dir) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prev;
      }

      // Check self collision
      if (prev.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prev;
      }

      const newSnake = [head, ...prev];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPlaying, gameOver, food, generateFood]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [isPlaying, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT'
      };
      
      const newDir = keyMap[e.key];
      if (!newDir) return;

      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT'
      };

      if (opposites[newDir] !== directionRef.current) {
        directionRef.current = newDir;
        setDirection(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          Snake
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🐍</span> Snake
          </DialogTitle>
          <DialogDescription className="sr-only">Play Snake game</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary">
              Score: {score}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} disabled={gameOver} className="gap-1.5">
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="outline" size="sm" onClick={resetGame} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          {gameOver && (
            <div className="text-center py-2 text-red-400 font-semibold">Game Over!</div>
          )}

          <div className="rounded-lg border-2 border-border overflow-hidden mx-auto bg-zinc-900" style={{ width: 'fit-content' }}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}>
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div
                    key={i}
                    className={`w-5 h-5 border border-zinc-800/50 transition-colors
                      ${isHead ? 'bg-green-400 rounded-sm' : isSnake ? 'bg-green-500' : ''}
                      ${isFood ? 'bg-red-500 rounded-full' : ''}`}
                  />
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">Use arrow keys or WASD to move</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
