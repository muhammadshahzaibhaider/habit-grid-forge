import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { RotateCcw, Gamepad2, Trophy } from "lucide-react";

type Board = number[][];

const GRID_SIZE = 4;

const TILE_COLORS: Record<number, string> = {
  0: 'bg-zinc-700/50',
  2: 'bg-amber-100 text-zinc-900',
  4: 'bg-amber-200 text-zinc-900',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-yellow-700 text-white',
  2048: 'bg-yellow-800 text-white',
};

const createEmptyBoard = (): Board => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const addRandomTile = (board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  const emptyCells: [number, number][] = [];
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newBoard[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  
  if (emptyCells.length > 0) {
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  
  return newBoard;
};

const initBoard = (): Board => addRandomTile(addRandomTile(createEmptyBoard()));

export const Game2048 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState<Board>(initBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const slide = (row: number[]): { newRow: number[]; points: number } => {
    let points = 0;
    let arr = row.filter(n => n !== 0);
    
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        points += arr[i];
        arr.splice(i + 1, 1);
      }
    }
    
    while (arr.length < GRID_SIZE) arr.push(0);
    return { newRow: arr, points };
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let totalPoints = 0;

    const processRow = (row: number[], reverse: boolean): number[] => {
      if (reverse) row = row.reverse();
      const { newRow, points } = slide(row);
      totalPoints += points;
      return reverse ? newRow.reverse() : newRow;
    };

    if (direction === 'left' || direction === 'right') {
      newBoard = newBoard.map(row => processRow(row, direction === 'right'));
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = newBoard.map(row => row[c]);
        col = processRow(col, direction === 'down');
        for (let r = 0; r < GRID_SIZE; r++) newBoard[r][c] = col[r];
      }
    }

    const boardChanged = JSON.stringify(newBoard) !== JSON.stringify(board);
    
    if (boardChanged) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(s => s + totalPoints);

      // Check for 2048
      if (newBoard.some(row => row.includes(2048)) && !won) {
        setWon(true);
      }

      // Check game over
      const hasEmpty = newBoard.some(row => row.includes(0));
      if (!hasEmpty) {
        let canMove = false;
        for (let r = 0; r < GRID_SIZE && !canMove; r++) {
          for (let c = 0; c < GRID_SIZE && !canMove; c++) {
            if (c < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r][c + 1]) canMove = true;
            if (r < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r + 1][c]) canMove = true;
          }
        }
        if (!canMove) setGameOver(true);
      }
    }
  }, [board, gameOver, won]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, move]);

  const resetGame = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          2048
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🎮</span> 2048
          </DialogTitle>
          <DialogDescription className="sr-only">Play 2048</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary">
              Score: {score}
            </div>
            <Button variant="outline" size="sm" onClick={resetGame} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          {(won || gameOver) && (
            <div className={`text-center py-2 font-semibold flex items-center justify-center gap-2 ${won ? 'text-yellow-400' : 'text-red-400'}`}>
              {won && <Trophy className="h-4 w-4" />}
              {won ? 'You Won!' : 'Game Over!'}
            </div>
          )}

          <div className="rounded-lg bg-zinc-800 p-2 mx-auto" style={{ width: 'fit-content' }}>
            <div className="grid grid-cols-4 gap-2">
              {board.flat().map((value, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg transition-all
                    ${TILE_COLORS[value] || 'bg-purple-600 text-white'}`}
                >
                  {value > 0 && value}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">Use arrow keys or WASD to move tiles</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
