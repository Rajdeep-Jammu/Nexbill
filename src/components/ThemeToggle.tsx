'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/hooks/use-theme-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-10 h-10 bg-secondary/50 hover:bg-primary/20 transition-colors"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-indigo-600" />
          ) : (
            <Sun className="h-5 w-5 text-amber-400" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}