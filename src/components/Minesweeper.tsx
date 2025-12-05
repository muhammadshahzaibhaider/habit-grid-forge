import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { RotateCcw, Gamepad2, Flag, Bomb, Trophy } from "lucide-react";

const GRID_SIZE = 9;
const MINE_COUNT = 10;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

type Board = Cell[][];

const createBoard = (): Board => {
  const board: Board = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines
  const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        for (const [dr, dc] of directions) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc].isMine) {
            count++;
          }
        }
        board[r][c].adjacentMines = count;
      }
    }
  }

  return board;
};

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-orange-400',
  6: 'text-cyan-400',
  7: 'text-pink-400',
  8: 'text-gray-400',
};

export const Minesweeper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState<Board>(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const flagCount = board.flat().filter(c => c.isFlagged).length;
  const revealedCount = board.flat().filter(c => c.isRevealed).length;

  const revealCell = useCallback((row: number, col: number, currentBoard: Board): Board => {
    const newBoard = currentBoard.map(r => r.map(c => ({ ...c })));
    const cell = newBoard[row][col];
    
    if (cell.isRevealed || cell.isFlagged) return newBoard;
    
    cell.isRevealed = true;
    
    if (cell.adjacentMines === 0 && !cell.isMine) {
      const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of directions) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !newBoard[nr][nc].isRevealed) {
          const updated = revealCell(nr, nc, newBoard);
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              newBoard[r][c] = updated[r][c];
            }
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const handleClick = (row: number, col: number) => {
    if (gameOver || won || board[row][col].isFlagged) return;

    const cell = board[row][col];
    
    if (cell.isMine) {
      // Reveal all mines
      setBoard(prev => prev.map(r => r.map(c => ({
        ...c,
        isRevealed: c.isMine ? true : c.isRevealed
      }))));
      setGameOver(true);
      return;
    }

    const newBoard = revealCell(row, col, board);
    setBoard(newBoard);

    // Check win
    const nonMineCount = GRID_SIZE * GRID_SIZE - MINE_COUNT;
    const newRevealedCount = newBoard.flat().filter(c => c.isRevealed).length;
    if (newRevealedCount === nonMineCount) {
      setWon(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || won || board[row][col].isRevealed) return;

    setBoard(prev => prev.map((r, ri) => r.map((c, ci) => 
      ri === row && ci === col ? { ...c, isFlagged: !c.isFlagged } : c
    )));
  };

  const resetGame = () => {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          Minesweeper
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">💣</span> Minesweeper
          </DialogTitle>
          <DialogDescription className="sr-only">Play Minesweeper</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 flex items-center gap-1">
                <Bomb className="h-3.5 w-3.5" /> {MINE_COUNT - flagCount}
              </div>
              <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary flex items-center gap-1">
                <Flag className="h-3.5 w-3.5" /> {flagCount}
              </div>
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

          <div className="rounded-lg border-2 border-border overflow-hidden mx-auto bg-zinc-800" style={{ width: 'fit-content' }}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)` }}>
              {board.flat().map((cell, i) => {
                const row = Math.floor(i / GRID_SIZE);
                const col = i % GRID_SIZE;
                
                return (
                  <button
                    key={i}
                    onClick={() => handleClick(row, col)}
                    onContextMenu={(e) => handleRightClick(e, row, col)}
                    className={`w-8 h-8 text-sm font-bold flex items-center justify-center border border-zinc-700 transition-all
                      ${cell.isRevealed 
                        ? cell.isMine 
                          ? 'bg-red-500/50' 
                          : 'bg-zinc-600' 
                        : 'bg-zinc-700 hover:bg-zinc-600'
                      }`}
                    disabled={cell.isRevealed}
                  >
                    {cell.isRevealed ? (
                      cell.isMine ? '💣' : cell.adjacentMines > 0 ? (
                        <span className={NUMBER_COLORS[cell.adjacentMines]}>{cell.adjacentMines}</span>
                      ) : null
                    ) : cell.isFlagged ? (
                      '🚩'
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">Left click to reveal, right click to flag</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
