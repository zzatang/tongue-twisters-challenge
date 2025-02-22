"use client";

import { Button } from "@/components/ui/button";

type Difficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'All';

interface DifficultyFilterProps {
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFilterProps) {
  const difficulties: Difficulty[] = ['All', 'Easy', 'Intermediate', 'Advanced'];

  return (
    <div className="flex gap-2">
      {difficulties.map((difficulty) => (
        <Button
          key={difficulty}
          variant={selectedDifficulty === difficulty ? "default" : "outline"}
          onClick={() => onDifficultyChange(difficulty)}
          className="text-sm"
        >
          {difficulty}
        </Button>
      ))}
    </div>
  );
}
