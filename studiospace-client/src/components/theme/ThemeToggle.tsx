"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { isDark, mounted, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-base-content/15 bg-base-content/5 text-base-content transition hover:border-primary hover:bg-primary/10"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ y: 16, opacity: 0, rotate: -60 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -16, opacity: 0, rotate: 60 }}
            transition={{ duration: 0.22 }}
            className="grid place-items-center"
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
