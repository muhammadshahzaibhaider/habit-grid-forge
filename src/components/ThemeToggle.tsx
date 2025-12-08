import { Moon, Sun, Waves } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const themes = [
  { id: "light", name: "Light", icon: Sun, color: "hsl(145, 60%, 45%)" },
  { id: "dark", name: "Dark", icon: Moon, color: "hsl(145, 70%, 50%)" },
  { id: "ocean", name: "Ocean", icon: Waves, color: "hsl(190, 80%, 50%)" },
];

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved && themes.find(t => t.id === saved)) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(t.id));
    // Add current theme class (light doesn't need a class as it's the :root default)
    if (theme !== "light") {
      root.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const IconComponent = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent transition-all duration-300"
        >
          <IconComponent className="h-5 w-5" style={{ color: currentTheme.color }} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 cursor-pointer ${theme === t.id ? "bg-accent" : ""}`}
            >
              <Icon className="h-4 w-4" style={{ color: t.color }} />
              <span>{t.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};