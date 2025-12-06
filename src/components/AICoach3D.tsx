import { useState } from 'react';

interface AICoach3DProps {
  onCoachClick: () => void;
}

export const AICoach3D = ({ onCoachClick }: AICoach3DProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 cursor-pointer transition-transform duration-300 overflow-hidden"
      style={{
        width: '200px',
        height: '200px',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCoachClick}
    >
      <iframe 
        src='https://my.spline.design/genkubgreetingrobot-20QHZBoNJioO5PIBptPd6uAF/' 
        frameBorder='0' 
        width='120%' 
        height='120%'
        style={{ 
          pointerEvents: 'none', 
          borderRadius: '12px',
          marginLeft: '-10%',
          marginTop: '-10%',
        }}
        title="AI Coach Robot"
      />
      {/* Overlay to hide Spline watermark */}
      <div 
        className="absolute bottom-0 right-0 w-full h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"
      />
      {isHovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs whitespace-nowrap animate-fade-in shadow-lg">
          Chat with AI Coach
        </div>
      )}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 whitespace-nowrap">
        Click to Chat!
      </div>
    </div>
  );
};
