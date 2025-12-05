import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { RotateCcw, Gamepad2, Trophy } from "lucide-react";

type Player = 'X' | 'O' | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [isOpen, setIsOpen] = useState(false);

  const checkWinner = (squares: Player[]): Player => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = checkWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          Tic-Tac-Toe
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⭕</span> Tic-Tac-Toe
          </DialogTitle>
          <DialogDescription className="sr-only">Play Tic-Tac-Toe</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              winner ? 'bg-yellow-500/20 text-yellow-400' : 
              isDraw ? 'bg-muted text-muted-foreground' :
              'bg-primary/20 text-primary'
            }`}>
              {winner ? (
                <span className="flex items-center gap-1"><Trophy className="h-4 w-4" /> {winner} wins!</span>
              ) : isDraw ? (
                "It's a draw!"
              ) : (
                `${currentPlayer}'s turn`
              )}
            </div>
            <Button variant="outline" size="sm" onClick={resetGame} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 mx-auto" style={{ width: 'fit-content' }}>
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`w-20 h-20 text-4xl font-bold rounded-lg border-2 transition-all duration-150 hover:scale-105
                  ${cell === 'X' ? 'text-blue-400 border-blue-400/50 bg-blue-400/10' : 
                    cell === 'O' ? 'text-red-400 border-red-400/50 bg-red-400/10' : 
                    'border-border bg-muted/30 hover:bg-muted/50'}`}
                disabled={!!cell || !!winner}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
