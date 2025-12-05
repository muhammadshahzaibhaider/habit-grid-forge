import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent transition-all duration-300"
    >
      <Sun className={`h-5 w-5 transition-all duration-500 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-500 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
