"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge, UserBadge } from "@/lib/supabase/types";
import { Medal, Star, Lock, Award, Zap, Target, Clock, Gift, Crown, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  gift: Gift,
  crown: Crown,
  heart: Heart,
};

// Fun badge colors for children
const badgeColors = [
  'from-fun-purple to-fun-pink',
  'from-fun-blue to-fun-purple',
  'from-fun-green to-fun-blue',
  'from-fun-yellow to-fun-green',
  'from-fun-pink to-fun-yellow',
];

export default function BadgesShowcase({ badges, earnedBadgeIds = [], className }: BadgesShowcaseProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  
  if (!badges.length) {
    return (
      <div className={cn("text-center py-8 card-fun", className)}>
        <Award className="w-16 h-16 mx-auto text-fun-yellow animate-float mb-4" />
        <p className="text-xl font-bubblegum text-fun-purple text-shadow-fun">No badges yet!</p>
        <p className="text-base font-comic text-gray-600 mt-2">Keep practicing to earn awesome badges!</p>
      </div>
    );
  }

  return (
    <Card className={cn("w-full card-fun bg-fun-pattern", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-bubblegum text-fun-purple text-shadow-fun">
          <Award className="h-6 w-6 text-fun-yellow" />
          Collect All Badges!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const Icon = iconMap[badge.icon_name?.toLowerCase()] || Award;
            const colorClass = badgeColors[index % badgeColors.length];
            const isHovered = hoveredBadge === badge.id;
            
            return (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className={cn(
                        "relative cursor-pointer transition-all duration-300 overflow-hidden",
                        isEarned ? "pop-in" : "opacity-60",
                        isHovered ? "scale-105" : ""
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredBadge(badge.id)}
                      onMouseLeave={() => setHoveredBadge(null)}
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-20",
                        colorClass
                      )} />
                      <CardContent className="p-4 text-center relative z-10">
                        {!isEarned && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Lock className="h-8 w-8 text-fun-purple mb-2" />
                            <p className="text-xs font-comic text-gray-600">Keep practicing!</p>
                          </div>
                        )}
                        <div className={cn(
                          "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                          isEarned ? `bg-gradient-to-br ${colorClass} animate-float` : "bg-gray-100"
                        )}>
                          <Icon className={cn(
                            "h-8 w-8",
                            isEarned ? "text-white" : "text-gray-400"
                          )} />
                        </div>
                        <p className={cn(
                          "text-sm font-bubblegum truncate",
                          isEarned ? "text-fun-purple" : "text-gray-400"
                        )}>{badge.name}</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="p-4 max-w-xs">
                    <p className="font-bubblegum text-lg text-fun-purple">{badge.name}</p>
                    <p className="text-sm font-comic text-gray-600 mt-1">{badge.description}</p>
                    {!isEarned && (
                      <div className="mt-2 p-2 bg-fun-purple/10 rounded-md">
                        <p className="text-sm font-comic text-fun-purple">
                          Goal: {badge.criteria_value} {badge.criteria_type}
                        </p>
                      </div>
                    )}
                    {isEarned && (
                      <div className="mt-2 p-2 bg-fun-green/10 rounded-md">
                        <p className="text-sm font-comic text-fun-green flex items-center">
                          <Star className="h-4 w-4 mr-1" /> You earned this badge!
                        </p>
                      </div>
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
