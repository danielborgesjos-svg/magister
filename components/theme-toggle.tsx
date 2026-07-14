"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
    >
      <Sun className="h-4.5 w-4.5 dark:hidden" />
      <Moon className="h-4.5 w-4.5 hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
