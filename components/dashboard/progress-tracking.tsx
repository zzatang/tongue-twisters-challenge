"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Calendar, TrendingUp, Star } from "lucide-react";

interface ProgressMetrics {
  practiceStreak: number;
  totalPracticeTime: number;
  averageClarityScore: number;
  practiceFrequency: {
    thisWeek: number;
    lastWeek: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
  }>;
}

interface ProgressTrackingProps {
  metrics: ProgressMetrics;
}

export const ProgressTracking = ({ metrics }: ProgressTrackingProps) => {
  const {
    practiceStreak,
    totalPracticeTime,
    averageClarityScore,
    practiceFrequency,
    badges,
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
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalPracticeTime)}</div>
            <p className="text-xs text-muted-foreground">Minutes spent practicing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Clarity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageClarityScore}%</div>
            <Progress value={averageClarityScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceFrequency.thisWeek} sessions</div>
            <Progress value={weeklyProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  badge.earned ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <div
                  className={`rounded-full p-2 ${
                    badge.earned ? "bg-primary/20" : "bg-muted-foreground/20"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      badge.earned ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
