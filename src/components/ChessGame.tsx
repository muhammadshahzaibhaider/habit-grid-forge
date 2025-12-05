import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { RotateCcw, Trophy, Gamepad2 } from "lucide-react";

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | null;
type Board = PieceType[][];
type Player = 'white' | 'black';

const INITIAL_BOARD: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_SYMBOLS: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

const isWhitePiece = (piece: PieceType): boolean => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: PieceType): boolean => piece !== null && piece === piece.toLowerCase();

export const ChessGame = () => {
  const [board, setBoard] = useState<Board>(() => INITIAL_BOARD.map(row => [...row]));
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getValidMoves = useCallback((row: number, col: number, boardState: Board): [number, number][] => {
    const piece = boardState[row][col];
    if (!piece) return [];

    const moves: [number, number][] = [];
    const isWhite = isWhitePiece(piece);
    const pieceType = piece.toLowerCase();

    const canMoveTo = (r: number, c: number): boolean => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const target = boardState[r][c];
      if (!target) return true;
      return isWhite ? isBlackPiece(target) : isWhitePiece(target);
    };

    const isEmpty = (r: number, c: number): boolean => {
      return r >= 0 && r <= 7 && c >= 0 && c <= 7 && !boardState[r][c];
    };

    const isEnemy = (r: number, c: number): boolean => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const target = boardState[r][c];
      if (!target) return false;
      return isWhite ? isBlackPiece(target) : isWhitePiece(target);
    };

    switch (pieceType) {
      case 'p': {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        if (isEmpty(row + direction, col)) {
          moves.push([row + direction, col]);
          if (row === startRow && isEmpty(row + 2 * direction, col)) {
            moves.push([row + 2 * direction, col]);
          }
        }
        if (isEnemy(row + direction, col - 1)) moves.push([row + direction, col - 1]);
        if (isEnemy(row + direction, col + 1)) moves.push([row + direction, col + 1]);
        break;
      }
      case 'r': {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
            if (isEmpty(nr, nc)) moves.push([nr, nc]);
            else {
              if (canMoveTo(nr, nc)) moves.push([nr, nc]);
              break;
            }
          }
        }
        break;
      }
      case 'n': {
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dr, dc] of knightMoves) {
          if (canMoveTo(row + dr, col + dc)) moves.push([row + dr, col + dc]);
        }
        break;
      }
      case 'b': {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
            if (isEmpty(nr, nc)) moves.push([nr, nc]);
            else {
              if (canMoveTo(nr, nc)) moves.push([nr, nc]);
              break;
            }
          }
        }
        break;
      }
      case 'q': {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
            if (isEmpty(nr, nc)) moves.push([nr, nc]);
            else {
              if (canMoveTo(nr, nc)) moves.push([nr, nc]);
              break;
            }
          }
        }
        break;
      }
      case 'k': {
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [dr, dc] of kingMoves) {
          if (canMoveTo(row + dr, col + dc)) moves.push([row + dr, col + dc]);
        }
        break;
      }
    }
    return moves;
  }, []);

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    const piece = board[row][col];

    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        
        // Check for pawn promotion
        let movingPiece = newBoard[selRow][selCol];
        if (movingPiece?.toLowerCase() === 'p') {
          if ((isWhitePiece(movingPiece) && row === 0) || (isBlackPiece(movingPiece) && row === 7)) {
            movingPiece = isWhitePiece(movingPiece) ? 'Q' : 'q';
          }
        }
        
        newBoard[row][col] = movingPiece;
        newBoard[selRow][selCol] = null;
        setBoard(newBoard);

        if (capturedPiece) {
          if (isWhitePiece(capturedPiece)) {
            setCapturedWhite(prev => [...prev, capturedPiece]);
          } else {
            setCapturedBlack(prev => [...prev, capturedPiece]);
          }
          if (capturedPiece.toLowerCase() === 'k') {
            setGameOver(currentPlayer === 'white' ? 'White wins!' : 'Black wins!');
          }
        }

        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (piece && ((currentPlayer === 'white' && isWhitePiece(piece)) || (currentPlayer === 'black' && isBlackPiece(piece)))) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col, board));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece) {
      if ((currentPlayer === 'white' && isWhitePiece(piece)) || (currentPlayer === 'black' && isBlackPiece(piece))) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col, board));
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setValidMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameOver(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full gap-2 glass hover-lift hover-glow"
        >
          <Gamepad2 className="h-4 w-4" />
          Play Chess
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">♟</span> Chess
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              currentPlayer === 'white' 
                ? 'bg-white text-black border border-border' 
                : 'bg-zinc-800 text-white'
            }`}>
              {gameOver || `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn`}
            </div>
            <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Captured Pieces */}
          <div className="flex justify-between text-sm">
            <div className="flex gap-1">
              {capturedBlack.map((p, i) => (
                <span key={i} className="text-lg">{PIECE_SYMBOLS[p!]}</span>
              ))}
            </div>
            <div className="flex gap-1">
              {capturedWhite.map((p, i) => (
                <span key={i} className="text-lg opacity-80">{PIECE_SYMBOLS[p!]}</span>
              ))}
            </div>
          </div>

          {/* Chess Board */}
          <div className="aspect-square w-full max-w-[400px] mx-auto rounded-lg overflow-hidden border-2 border-border shadow-xl">
            <div className="grid grid-cols-8 h-full">
              {board.map((row, rowIdx) =>
                row.map((piece, colIdx) => {
                  const isLight = (rowIdx + colIdx) % 2 === 0;
                  const isSelected = selectedSquare?.[0] === rowIdx && selectedSquare?.[1] === colIdx;
                  const isValidMove = validMoves.some(([r, c]) => r === rowIdx && c === colIdx);
                  
                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleSquareClick(rowIdx, colIdx)}
                      className={`
                        relative flex items-center justify-center cursor-pointer
                        transition-all duration-200 hover:brightness-110
                        ${isLight ? 'bg-amber-100 dark:bg-amber-200' : 'bg-amber-700 dark:bg-amber-800'}
                        ${isSelected ? 'ring-2 ring-primary ring-inset brightness-125' : ''}
                      `}
                    >
                      {isValidMove && (
                        <div className={`absolute inset-0 flex items-center justify-center ${piece ? '' : ''}`}>
                          {piece ? (
                            <div className="absolute inset-1 rounded-full border-4 border-primary/50" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-primary/40" />
                          )}
                        </div>
                      )}
                      {piece && (
                        <span 
                          className={`text-3xl sm:text-4xl select-none drop-shadow-lg transition-transform ${
                            isWhitePiece(piece) ? 'text-white [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]' : 'text-zinc-900'
                          } ${isSelected ? 'scale-110' : ''}`}
                        >
                          {PIECE_SYMBOLS[piece]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-lg font-bold">
                <Trophy className="h-5 w-5" />
                {gameOver}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
