import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { RotateCcw, Gamepad2, Trophy } from "lucide-react";

const EMOJIS = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎵', '🎲', '🎸'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const shuffleCards = (): Card[] => {
  const pairs = [...EMOJIS, ...EMOJIS];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
};

export const MemoryGame = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>(shuffleCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const isWon = matchedPairs === EMOJIS.length;

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      const [first, second] = flippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((card, i) => 
          i === first || i === second ? { ...card, isMatched: true } : card
        ));
        setFlippedCards([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, i) =>
            i === first || i === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2) return;
    
    setCards(prev => prev.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, index]);
  };

  const resetGame = () => {
    setCards(shuffleCards());
    setFlippedCards([]);
    setMoves(0);
    setIsLocked(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 glass hover-lift hover-glow">
          <Gamepad2 className="h-4 w-4" />
          Memory Match
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🃏</span> Memory Match
          </DialogTitle>
          <DialogDescription className="sr-only">Play Memory Match game</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary">
                Moves: {moves}
              </div>
              <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400">
                Pairs: {matchedPairs}/{EMOJIS.length}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetGame} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          {isWon && (
            <div className="text-center py-2 text-yellow-400 font-semibold flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4" /> You won in {moves} moves!
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mx-auto" style={{ width: 'fit-content' }}>
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`w-16 h-16 rounded-lg text-2xl font-bold transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-primary/20 border-2 border-primary/50 rotate-0' 
                    : 'bg-zinc-700 border-2 border-zinc-600 hover:bg-zinc-600'
                  }
                  ${card.isMatched ? 'opacity-60' : 'hover:scale-105'}`}
                disabled={card.isMatched}
              >
                {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
