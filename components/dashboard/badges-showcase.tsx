"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/lib/supabase/types";
import { Medal, Star, Lock, Award, Zap, Target, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgesShowcaseProps {
  badges: (Badge & { earned: boolean })[];
  className?: string;
}

const BadgeIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "streak master":
      return <Medal className="h-8 w-8" />;
    case "clarity champion":
      return <Star className="h-8 w-8" />;
    case "practice pro":
      return <Award className="h-8 w-8" />;
    case "speed demon":
      return <Zap className="h-8 w-8" />;
    case "perfect score":
      return <Target className="h-8 w-8" />;
    case "dedication":
      return <Clock className="h-8 w-8" />;
    default:
      return <Star className="h-8 w-8" />;
  }
};

export const BadgesShowcase = ({ badges, className }: BadgesShowcaseProps) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`relative flex flex-col items-center justify-center p-4 rounded-lg border ${
                      badge.earned
                        ? "bg-primary/10 border-primary/20"
                        : "bg-muted/50 border-muted grayscale opacity-50"
                    }`}
                  >
                    <div className={`mb-2 ${badge.earned ? "text-primary" : "text-muted-foreground"}`}>
                      <BadgeIcon name={badge.name} />
                    </div>
                    <h3 className="text-sm font-medium text-center">{badge.name}</h3>
                    {!badge.earned && (
                      <Lock className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.description}</p>
                  {!badge.earned && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {badge.criteria_type === 'streak' && `Practice for ${badge.criteria_value} days in a row`}
                      {badge.criteria_type === 'clarity' && `Achieve ${badge.criteria_value}% clarity score`}
                      {badge.criteria_type === 'sessions' && `Complete ${badge.criteria_value} practice sessions`}
                      {badge.criteria_type === 'speed' && `Complete in under ${badge.criteria_value} seconds`}
                      {badge.criteria_type === 'accuracy' && `Get ${badge.criteria_value}% accuracy`}
                      {badge.criteria_type === 'time' && `Practice for ${badge.criteria_value} minutes`}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
