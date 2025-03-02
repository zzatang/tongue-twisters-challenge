import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Star, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import BadgesShowcase from "./badges-showcase";
import { getUserBadges, getAllBadges } from "@/lib/services/badge-service";
import { useToast } from '@/components/ui/use-toast';
import type { Badge } from '@/lib/supabase/types';

interface UserProgress {
  practice_streak: number;
  total_practice_time: number;
  total_sessions: number;
  clarity_score: number;
  practice_frequency: {
    daily: { [key: string]: number };
    weekly: { [key: string]: number };
    monthly: { [key: string]: number };
  };
  badges: any[];
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface ProgressMetrics {
  practiceStreak: number;
  totalPracticeTime: number; // in minutes
  averageClarityScore: number;
  practiceFrequency: {
    thisWeek: number;
    lastWeek: number;
  };
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
  }>;
}

interface ProgressTrackingProps {
  metrics?: ProgressMetrics;
  userId?: string;
  className?: string;
}

export function ProgressTracking({ metrics, userId: propUserId, className }: ProgressTrackingProps = {}) {
  const { userId: authUserId } = useAuth();
  const effectiveUserId = propUserId || authUserId;
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!effectiveUserId) {
      setError('User not authenticated');
      return;
    }

    const userId = effectiveUserId as string; // TypeScript now knows this is defined

    async function fetchUserData() {
      try {
        // If metrics are provided via props (for testing), use those
        if (metrics) {
          const today = new Date().toISOString().split('T')[0];
          const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          // Create a properly structured mock object
          const mockProgress: UserProgress = {
            practice_streak: metrics.practiceStreak,
            total_practice_time: metrics.totalPracticeTime,
            total_sessions: 0,
            clarity_score: metrics.averageClarityScore,
            practice_frequency: {
              daily: {},
              weekly: {},
              monthly: {}
            },
            badges: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId
          };

          // Add practice frequency data safely
          if (metrics.practiceFrequency) {
            if (typeof metrics.practiceFrequency.thisWeek === 'number') {
              mockProgress.practice_frequency.daily[today] = metrics.practiceFrequency.thisWeek;
              mockProgress.practice_frequency.weekly[today.slice(0, 7)] = metrics.practiceFrequency.thisWeek;
              mockProgress.practice_frequency.monthly[today.slice(0, 7)] = metrics.practiceFrequency.thisWeek;
            }
            
            if (typeof metrics.practiceFrequency.lastWeek === 'number') {
              mockProgress.practice_frequency.weekly[lastWeek.slice(0, 7)] = metrics.practiceFrequency.lastWeek;
            }
          }

          setProgress(mockProgress);
          return;
        }

        // Otherwise fetch real data
        const [userBadges, allBadges] = await Promise.all([
          getUserBadges(userId),
          getAllBadges()
        ]);

        setBadges(allBadges);
        setEarnedBadgeIds(userBadges.map(ub => ub.badge_id));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user progress');
        toast({
          title: 'Error',
          description: 'Failed to load user progress. Please try again later.',
          variant: 'destructive',
        });
      }
    }

    fetchUserData();
  }, [effectiveUserId, metrics, toast]);

  if (!effectiveUserId) {
    return <div className="text-red-500">Please log in to view your progress</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!progress) {
    return <div>Loading...</div>;
  }

  // Calculate practice frequency stats
  const now = new Date();
  const thisWeek = now.toISOString().split('T')[0].slice(0, 7);
  
  // Ensure practice_frequency exists and has the expected structure
  const practiceFreq = progress?.practice_frequency || { daily: {}, weekly: {}, monthly: {} };
  const dailyPractices = practiceFreq.daily || {};
  
  const practicesThisWeek = Object.entries(dailyPractices)
    .filter(([date]) => date && date.startsWith(thisWeek))
    .reduce((sum, [_, count]) => sum + (typeof count === 'number' ? count : 0), 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.practice_streak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(progress.total_practice_time)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Practice</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practicesThisWeek} sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Clarity</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(progress.clarity_score)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <BadgesShowcase badges={badges} earnedBadgeIds={earnedBadgeIds} />
    </div>
  );
}
