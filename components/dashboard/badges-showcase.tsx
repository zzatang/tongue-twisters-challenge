"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge, UserBadge } from "@/lib/supabase/types";
import { Medal, Star, Lock, Award, Zap, Target, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgesShowcaseProps {
  badges: Badge[];
  earnedBadgeIds?: string[];
  className?: string;
}

const iconMap: { [key: string]: any } = {
  medal: Medal,
  star: Star,
  zap: Zap,
  target: Target,
  clock: Clock,
};

export default function BadgesShowcase({ badges, earnedBadgeIds = [], className }: BadgesShowcaseProps) {
  if (!badges.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No badges available</p>
        <p className="text-sm text-muted-foreground">Keep practicing to earn badges!</p>
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const Icon = iconMap[badge.icon_name.toLowerCase()] || Award;

            return (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className={cn(
                      "relative cursor-pointer transition-all duration-200",
                      isEarned ? "bg-primary/5" : "opacity-50"
                    )}>
                      <CardContent className="p-4 text-center">
                        {!isEarned && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Icon className={cn(
                          "h-8 w-8 mx-auto mb-2",
                          isEarned ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="text-sm font-medium truncate">{badge.name}</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    {!isEarned && (
                      <p className="text-sm mt-1">
                        Goal: {badge.criteria_value} {badge.criteria_type}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
