import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DifficultyFilterProps {
  selectedDifficulty: string[];
  onDifficultyChange: (value: string[]) => void;
}

export function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Difficulty Level</h3>
      <ToggleGroup
        type="multiple"
        value={selectedDifficulty}
        onValueChange={onDifficultyChange}
        className="justify-start"
      >
        <ToggleGroupItem value="Easy" aria-label="Toggle easy difficulty">
          Easy
        </ToggleGroupItem>
        <ToggleGroupItem
          value="Intermediate"
          aria-label="Toggle intermediate difficulty"
        >
          Intermediate
        </ToggleGroupItem>
        <ToggleGroupItem
          value="Advanced"
          aria-label="Toggle advanced difficulty"
        >
          Advanced
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
