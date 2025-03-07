"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TongueTwisterTileProps {
  title: string;
  text: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  onClick: () => void;
  className?: string;
}

export function TongueTwisterTile({
  title,
  text,
  difficulty,
  onClick,
  className,
}: TongueTwisterTileProps) {
  // Emoji mapping for difficulty levels
  const difficultyEmojis = {
    Easy: "😊",
    Intermediate: "😃",
    Advanced: "🤩",
  };

  // Color mapping for difficulty levels
  const difficultyColorClasses = {
    Easy: "bg-[hsl(var(--fun-green))]/20 text-[hsl(var(--fun-green))] border-[hsl(var(--fun-green))]/30",
    Intermediate: "bg-[hsl(var(--fun-yellow))]/20 text-[hsl(var(--fun-yellow))] border-[hsl(var(--fun-yellow))]/30",
    Advanced: "bg-[hsl(var(--fun-pink))]/20 text-[hsl(var(--fun-pink))] border-[hsl(var(--fun-pink))]/30",
  };

  // Fun animations based on difficulty
  const cardAnimation = {
    Easy: "hover:animate-float",
    Intermediate: "hover:animate-wiggle",
    Advanced: "hover:animate-bounce",
  }[difficulty];

  return (
    <Card className={cn("group card-fun bounce-hover", cardAnimation, className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bubblegum text-shadow-fun">{title}</CardTitle>
          <Badge variant="outline" className={cn(difficultyColorClasses[difficulty], "font-comic")}>
            {difficultyEmojis[difficulty]} {difficulty}
          </Badge>
        </div>
        <CardDescription className="text-base font-comic">{text}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onClick}
          className="w-full bg-[hsl(var(--fun-purple))] hover:bg-[hsl(var(--fun-purple))]/90 text-white font-bubblegum text-lg wiggle-hover"
        >
          <PlayIcon className="mr-2 h-5 w-5" />
          Let&apos;s Practice!
        </Button>
      </CardContent>
    </Card>
  );
}
