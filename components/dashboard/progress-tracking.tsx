import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Star, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import BadgesShowcase from "./badges-showcase";
import { Badge } from "@/lib/supabase/types";
import { getUserBadges, getAllBadges } from "@/lib/services/badge-service";
import { useToast } from "@/components/ui/use-toast";

interface ProgressMetrics {
  practiceStreak: number;
  totalPracticeTime: number; // in minutes
  averageClarityScore: number;
  practiceFrequency: {
    thisWeek: number;
    lastWeek: number;
  };
}

interface ProgressTrackingProps {
  metrics: ProgressMetrics;
  userId: string;
  className?: string;
}

export function ProgressTracking({ metrics, userId, className }: ProgressTrackingProps) {
  const [badges, setBadges] = useState<(Badge & { earned: boolean })[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [userBadges, allBadges] = await Promise.all([
          getUserBadges(userId),
          getAllBadges(),
        ]);

        const badgesWithEarned = allBadges.map(badge => ({
          ...badge,
          earned: userBadges.some(ub => ub.badge_id === badge.id),
        }));

        setBadges(badgesWithEarned);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load badges. Please try again later.",
          variant: "destructive",
        });
      }
    };

    loadBadges();
  }, [userId, toast]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.practiceStreak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.totalPracticeTime)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Clarity</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageClarityScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.practiceFrequency.thisWeek} sessions</div>
          </CardContent>
        </Card>
      </div>

      <BadgesShowcase badges={badges} />
    </div>
  );
}
