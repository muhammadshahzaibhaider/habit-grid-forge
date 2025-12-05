import { useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { RotateCcw, Trophy, Gamepad2, AlertTriangle } from "lucide-react";

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | null;
type Board = PieceType[][];
type Player = 'white' | 'black';

interface Move {
  piece: PieceType;
  from: [number, number];
  to: [number, number];
  captured?: PieceType;
  notation: string;
}

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

const PIECE_NAMES: Record<string, string> = {
  'k': 'K', 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N', 'p': '',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const isWhitePiece = (piece: PieceType): boolean => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: PieceType): boolean => piece !== null && piece === piece.toLowerCase();

const toNotation = (row: number, col: number): string => `${FILES[col]}${RANKS[row]}`;

export const ChessGame = () => {
  const [board, setBoard] = useState<Board>(() => INITIAL_BOARD.map(row => [...row]));
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isCheck, setIsCheck] = useState(false);

  const findKing = useCallback((boardState: Board, isWhiteKing: boolean): [number, number] | null => {
    const kingPiece = isWhiteKing ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (boardState[r][c] === kingPiece) return [r, c];
      }
    }
    return null;
  }, []);

  const getBasicMoves = useCallback((row: number, col: number, boardState: Board): [number, number][] => {
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
            else { if (canMoveTo(nr, nc)) moves.push([nr, nc]); break; }
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
            else { if (canMoveTo(nr, nc)) moves.push([nr, nc]); break; }
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
            else { if (canMoveTo(nr, nc)) moves.push([nr, nc]); break; }
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

  const isSquareAttacked = useCallback((row: number, col: number, boardState: Board, byWhite: boolean): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (!piece) continue;
        if (byWhite !== isWhitePiece(piece)) continue;
        const moves = getBasicMoves(r, c, boardState);
        if (moves.some(([mr, mc]) => mr === row && mc === col)) return true;
      }
    }
    return false;
  }, [getBasicMoves]);

  const isKingInCheck = useCallback((boardState: Board, isWhiteKing: boolean): boolean => {
    const kingPos = findKing(boardState, isWhiteKing);
    if (!kingPos) return false;
    return isSquareAttacked(kingPos[0], kingPos[1], boardState, !isWhiteKing);
  }, [findKing, isSquareAttacked]);

  const getValidMoves = useCallback((row: number, col: number, boardState: Board): [number, number][] => {
    const piece = boardState[row][col];
    if (!piece) return [];
    const isWhite = isWhitePiece(piece);
    const basicMoves = getBasicMoves(row, col, boardState);
    
    return basicMoves.filter(([toRow, toCol]) => {
      const testBoard = boardState.map(r => [...r]);
      testBoard[toRow][toCol] = testBoard[row][col];
      testBoard[row][col] = null;
      return !isKingInCheck(testBoard, isWhite);
    });
  }, [getBasicMoves, isKingInCheck]);

  const hasAnyLegalMoves = useCallback((boardState: Board, isWhitePlayer: boolean): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (!piece) continue;
        if (isWhitePlayer !== isWhitePiece(piece)) continue;
        if (getValidMoves(r, c, boardState).length > 0) return true;
      }
    }
    return false;
  }, [getValidMoves]);

  const kingPosition = useMemo(() => {
    const isWhiteKing = currentPlayer === 'white';
    return findKing(board, isWhiteKing);
  }, [board, currentPlayer, findKing]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    const piece = board[row][col];

    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        const movingPiece = newBoard[selRow][selCol];
        
        let finalPiece = movingPiece;
        if (movingPiece?.toLowerCase() === 'p') {
          if ((isWhitePiece(movingPiece) && row === 0) || (isBlackPiece(movingPiece) && row === 7)) {
            finalPiece = isWhitePiece(movingPiece) ? 'Q' : 'q';
          }
        }
        
        newBoard[row][col] = finalPiece;
        newBoard[selRow][selCol] = null;

        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        const opponentIsWhite = nextPlayer === 'white';
        const inCheck = isKingInCheck(newBoard, opponentIsWhite);
        const hasLegalMoves = hasAnyLegalMoves(newBoard, opponentIsWhite);

        // Create move notation
        const pieceName = PIECE_NAMES[movingPiece!.toLowerCase()];
        const captureSymbol = capturedPiece ? 'x' : '';
        const fromNotation = movingPiece?.toLowerCase() === 'p' && capturedPiece ? FILES[selCol] : '';
        let notation = `${pieceName}${fromNotation}${captureSymbol}${toNotation(row, col)}`;
        
        if (inCheck && !hasLegalMoves) {
          notation += '#';
          setGameOver(`${currentPlayer === 'white' ? 'White' : 'Black'} wins by checkmate!`);
        } else if (inCheck) {
          notation += '+';
        } else if (!hasLegalMoves) {
          setGameOver('Stalemate - Draw!');
        }

        const move: Move = {
          piece: movingPiece,
          from: [selRow, selCol],
          to: [row, col],
          captured: capturedPiece,
          notation,
        };
        setMoveHistory(prev => [...prev, move]);
        setBoard(newBoard);
        setIsCheck(inCheck);

        if (capturedPiece) {
          if (isWhitePiece(capturedPiece)) {
            setCapturedWhite(prev => [...prev, capturedPiece]);
          } else {
            setCapturedBlack(prev => [...prev, capturedPiece]);
          }
        }

        setCurrentPlayer(nextPlayer);
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
    setMoveHistory([]);
    setIsCheck(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          Play Chess
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">♟</span> Chess
          </DialogTitle>
          <DialogDescription className="sr-only">Play a game of chess</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row gap-4 p-4">
          {/* Left: Board Section */}
          <div className="flex-1 space-y-3">
            {/* Status Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPlayer === 'white' 
                  ? 'bg-white text-zinc-900 border border-zinc-300 shadow-sm' 
                  : 'bg-zinc-800 text-white shadow-sm'
              }`}>
                {isCheck && !gameOver && <AlertTriangle className="h-4 w-4 text-red-500" />}
                {gameOver ? (
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {gameOver}
                  </span>
                ) : (
                  <span>{currentPlayer === 'white' ? 'White' : 'Black'}'s turn {isCheck && '(Check!)'}</span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={resetGame} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            {/* Captured Pieces - Black */}
            <div className="flex items-center gap-1 min-h-[28px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800/50">
              <span className="text-xs text-muted-foreground mr-1">Black:</span>
              {capturedBlack.map((p, i) => (
                <span key={i} className="text-lg leading-none">{PIECE_SYMBOLS[p!]}</span>
              ))}
            </div>

            {/* Chess Board */}
            <div className="rounded-lg overflow-hidden border-2 border-zinc-400 dark:border-zinc-600 shadow-xl mx-auto" style={{ width: 'fit-content' }}>
              <div className="grid grid-cols-8">
                {board.map((row, rowIdx) =>
                  row.map((piece, colIdx) => {
                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    const isSelected = selectedSquare?.[0] === rowIdx && selectedSquare?.[1] === colIdx;
                    const isValidMove = validMoves.some(([r, c]) => r === rowIdx && c === colIdx);
                    const isKingSquare = isCheck && kingPosition && kingPosition[0] === rowIdx && kingPosition[1] === colIdx;
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleSquareClick(rowIdx, colIdx)}
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center cursor-pointer
                          transition-all duration-150 hover:brightness-110
                          ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                          ${isSelected ? 'ring-2 ring-inset ring-blue-500 brightness-110' : ''}
                          ${isKingSquare ? 'bg-red-400' : ''}
                        `}
                      >
                        {colIdx === 0 && (
                          <span className="absolute left-0.5 top-0.5 text-[8px] font-semibold opacity-60">{RANKS[rowIdx]}</span>
                        )}
                        {rowIdx === 7 && (
                          <span className="absolute right-0.5 bottom-0 text-[8px] font-semibold opacity-60">{FILES[colIdx]}</span>
                        )}
                        {isValidMove && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {piece ? (
                              <div className="absolute inset-1 rounded-full border-[3px] border-blue-500/60" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                            )}
                          </div>
                        )}
                        {piece && (
                          <span 
                            className={`text-3xl sm:text-4xl select-none drop-shadow transition-transform ${
                              isWhitePiece(piece) 
                                ? 'text-white [text-shadow:_1px_1px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000]' 
                                : 'text-zinc-900'
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

            {/* Captured Pieces - White */}
            <div className="flex items-center gap-1 min-h-[28px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800/50">
              <span className="text-xs text-muted-foreground mr-1">White:</span>
              {capturedWhite.map((p, i) => (
                <span key={i} className="text-lg leading-none opacity-90">{PIECE_SYMBOLS[p!]}</span>
              ))}
            </div>
          </div>

          {/* Right: Move History Panel */}
          <div className="lg:w-48 space-y-2">
            <h4 className="font-semibold text-sm px-1">Move History</h4>
            <ScrollArea className="h-[320px] sm:h-[400px] rounded-lg border border-border bg-background/50 p-2">
              {moveHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No moves yet</p>
              ) : (
                <div className="space-y-0.5">
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                    const whiteMove = moveHistory[i * 2];
                    const blackMove = moveHistory[i * 2 + 1];
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs py-0.5 px-1 rounded hover:bg-muted/50">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="flex-1 font-mono">{whiteMove?.notation || ''}</span>
                        <span className="flex-1 font-mono">{blackMove?.notation || ''}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
