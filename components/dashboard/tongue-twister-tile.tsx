import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

interface TongueTwisterTileProps {
  title: string;
  text: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  onPractice: () => void;
}

export function TongueTwisterTile({ title, text, difficulty, onPractice }: TongueTwisterTileProps) {
  const difficultyColor = {
    Easy: "bg-green-500/10 text-green-500",
    Intermediate: "bg-yellow-500/10 text-yellow-500",
    Advanced: "bg-red-500/10 text-red-500",
  }[difficulty];

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant="outline" className={difficultyColor}>
            {difficulty}
          </Badge>
        </div>
        <CardDescription className="text-base">{text}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onPractice}
          className="w-full group-hover:bg-primary/90"
          size="lg"
        >
          <PlayIcon className="mr-2 h-4 w-4" />
          Practice Now
        </Button>
      </CardContent>
    </Card>
  );
}
