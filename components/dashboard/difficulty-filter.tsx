"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DifficultyLevel = 1 | 2 | 3;
type DifficultyFilter = 'All' | DifficultyLevel;

interface DifficultyFilterProps {
  selectedDifficulty: DifficultyFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
}

const difficultyOptions: [DifficultyFilter, string][] = [
  ['All', 'All'],
  [1, 'Easy'],
  [2, 'Intermediate'],
  [3, 'Advanced']
];

export function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFilterProps) {
  return (
    <div className="flex gap-2">
      {difficultyOptions.map(([value, label]) => (
        <Button
          key={value}
          variant={selectedDifficulty === value ? "default" : "outline"}
          onClick={() => onDifficultyChange(value)}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            selectedDifficulty === value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
