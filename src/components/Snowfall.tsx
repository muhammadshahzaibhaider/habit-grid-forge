import { useEffect, useRef } from "react";

interface Snowflake {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  wobble: number;
  wobbleSpeed: number;
}

export const Snowfall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initSnowflakes();
    };

    const initSnowflakes = () => {
      const flakeCount = Math.floor((canvas.width * canvas.height) / 12000);
      snowflakesRef.current = [];

      for (let i = 0; i < flakeCount; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.3,
          speedY: Math.random() * 0.8 + 0.3,
          speedX: Math.random() * 0.3 - 0.15,
          wobble: 0,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((flake) => {
        // Update wobble for gentle side-to-side motion
        flake.wobble += flake.wobbleSpeed;
        const wobbleOffset = Math.sin(flake.wobble) * 0.5;

        // Update position
        flake.y += flake.speedY;
        flake.x += flake.speedX + wobbleOffset;

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }

        // Draw snowflake with soft glow
        const gradient = ctx.createRadialGradient(
          flake.x, flake.y, 0,
          flake.x, flake.y, flake.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity})`);
        gradient.addColorStop(0.5, `rgba(220, 235, 255, ${flake.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(200, 220, 255, 0)");

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw bright core
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};
