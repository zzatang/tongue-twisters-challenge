"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Star, TrendingUp } from "lucide-react";
import { BadgesShowcase } from "./badges-showcase";
import { Badge } from "@/lib/supabase/types";
import { getUserBadges, getAllBadges } from "@/lib/services/badge-service";
import { useToast } from "@/components/ui/use-toast";

interface ProgressMetrics {
  practiceStreak: number;
  totalPracticeTime: number;
  averageClarityScore: number;
  practiceFrequency: {
    thisWeek: number;
    lastWeek: number;
  };
}

interface ProgressTrackingProps {
  metrics: ProgressMetrics;
  userId: string;
}

export const ProgressTracking = ({ metrics, userId }: ProgressTrackingProps) => {
  const [badges, setBadges] = useState<(Badge & { earned: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadBadges() {
      try {
        const [allBadges, userBadges] = await Promise.all([
          getAllBadges(),
          getUserBadges(userId)
        ]);

        const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
        const badgesWithEarnedStatus = allBadges.map(badge => ({
          ...badge,
          earned: earnedBadgeIds.has(badge.id)
        }));

        setBadges(badgesWithEarnedStatus);
      } catch (error) {
        console.error('Error loading badges:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load badges. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadBadges();
  }, [userId]);

  const {
    practiceStreak,
    totalPracticeTime,
    averageClarityScore,
    practiceFrequency,
  } = metrics;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  const calculateProgress = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round((current / previous) * 100);
  };

  const weeklyProgress = calculateProgress(
    practiceFrequency.thisWeek,
    practiceFrequency.lastWeek
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{practiceStreak} days</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(totalPracticeTime)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Clarity</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageClarityScore}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {practiceFrequency.thisWeek} sessions
          </div>
          <Progress value={weeklyProgress} className="mt-2" />
        </CardContent>
      </Card>

      {!isLoading && badges.length > 0 && (
        <BadgesShowcase badges={badges} className="col-span-full" />
      )}
    </div>
  );
};
