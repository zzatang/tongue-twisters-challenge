import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Star, Activity, Award, Flame, Trophy, Medal } from "lucide-react";
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
  best_clarity_score: number;
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
            best_clarity_score: metrics.averageClarityScore,
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
    return <div className="text-red-500 font-comic">Please log in to view your progress</div>;
  }

  if (error) {
    return <div className="text-red-500 font-comic">Error: {error}</div>;
  }

  if (!progress) {
    return <div className="font-comic animate-bounce">Loading your super progress...</div>;
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
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // Fun emoji and color based on progress values
  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌟';
  };

  const getClarityEmoji = (clarity: number) => {
    if (clarity >= 90) return '🏆';
    if (clarity >= 75) return '🥇';
    if (clarity >= 60) return '🥈';
    return '🥉';
  };

  const getSessionsEmoji = (sessions: number) => {
    if (sessions >= 10) return '🚀';
    if (sessions >= 5) return '🎯';
    return '🎮';
  };

  const getTimeEmoji = (minutes: number) => {
    if (minutes >= 120) return '⏰';
    if (minutes >= 60) return '⌚';
    return '⏱️';
  };

  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your practice streak today!";
    if (streak === 1) return "You started practicing! Keep it up!";
    if (streak < 3) return "You're building momentum!";
    if (streak < 5) return "You're on fire! 🔥";
    if (streak < 7) return "Amazing dedication!";
    return "Wow! You're a superstar! 🌟";
  };

  const getTimeMessage = (minutes: number): string => {
    if (minutes < 10) return "Just getting started!";
    if (minutes < 30) return "You're making progress!";
    if (minutes < 60) return "You're putting in good time!";
    if (minutes < 120) return "Impressive practice time!";
    return "You're a dedicated speaker! 🏆";
  };

  const getFrequencyMessage = (thisWeek: number, lastWeek: number): string => {
    const change = thisWeek - lastWeek;
    const percentChange = lastWeek ? Math.round((change / lastWeek) * 100) : 0;
    
    if (thisWeek === 0) return "No practice yet this week. Let's get started!";
    if (change > 0 && percentChange > 20) return `Wow! ${percentChange}% more practice than last week! 🚀`;
    if (change > 0) return "More practice than last week! Keep it up!";
    if (change === 0) return "Consistent practice! Good job!";
    return "Let's try to practice more than last week!";
  };

  const getClarityMessage = (score: number): string => {
    if (score < 40) return "Keep practicing to improve your clarity!";
    if (score < 60) return "You're making progress with your clarity!";
    if (score < 80) return "Good clarity! Keep refining!";
    if (score < 90) return "Excellent clarity! Almost perfect!";
    return "Amazing clarity! You're a tongue twister master! 🎯";
  };

  const streakMessage = getStreakMessage(progress.practice_streak);
  const timeMessage = getTimeMessage(progress.total_practice_time);
  const frequencyMessage = getFrequencyMessage(practicesThisWeek, 0);
  const clarityMessage = getClarityMessage(progress.clarity_score);

  // Calculate progress percentage for visual indicators
  const streakPercentage = Math.min(100, (progress.practice_streak / 7) * 100);
  const clarityPercentage = progress.clarity_score;
  const frequencyPercentage = Math.min(100, (practicesThisWeek / Math.max(5, 2)) * 100);

  // Determine emoji based on progress
  const getEmoji = (percentage: number) => {
    if (percentage < 20) return "😊";
    if (percentage < 40) return "😃";
    if (percentage < 60) return "😄";
    if (percentage < 80) return "🤩";
    return "🌟";
  };

  const streakEmoji = getEmoji(streakPercentage);
  const clarityEmoji = getEmoji(clarityPercentage);
  const frequencyEmoji = getEmoji(frequencyPercentage);

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))] text-shadow-fun mb-4">Your Amazing Progress!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-fun bg-gradient-to-br from-[hsl(var(--fun-purple))]/10 to-[hsl(var(--fun-pink))]/10 pop-in" style={{animationDelay: '0ms'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bubblegum text-[hsl(var(--fun-purple))]">Practice Streak</CardTitle>
            <Flame className="h-6 w-6 text-[hsl(var(--fun-pink))] animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-bubblegum flex items-center">
              <span>{progress.practice_streak}</span>
              <span className="ml-2 text-2xl">{getStreakEmoji(progress.practice_streak)}</span>
              <span className="ml-2 text-lg font-comic text-gray-600">days</span>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[hsl(var(--fun-purple))] to-[hsl(var(--fun-pink))] rounded-full" 
                style={{ width: `${streakPercentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-comic text-gray-600">{streakMessage}</p>
          </CardContent>
        </Card>

        <Card className="card-fun bg-gradient-to-br from-[hsl(var(--fun-blue))]/10 to-[hsl(var(--fun-purple))]/10 pop-in" style={{animationDelay: '100ms'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bubblegum text-[hsl(var(--fun-blue))]">Practice Time</CardTitle>
            <Clock className="h-6 w-6 text-[hsl(var(--fun-blue))] animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-bubblegum flex items-center">
              <span>{formatTime(progress.total_practice_time)}</span>
              <span className="ml-2 text-2xl">{getTimeEmoji(progress.total_practice_time)}</span>
            </div>
            <p className="text-sm font-comic mt-2 text-gray-600">
              {progress.total_practice_time > 60 
                ? `Amazing! That's over an hour of practice!` 
                : "Every minute counts!"}
            </p>
          </CardContent>
        </Card>

        <Card className="card-fun bg-gradient-to-br from-[hsl(var(--fun-green))]/10 to-[hsl(var(--fun-blue))]/10 pop-in" style={{animationDelay: '200ms'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bubblegum text-[hsl(var(--fun-green))]">Weekly Practice</CardTitle>
            <Activity className="h-6 w-6 text-[hsl(var(--fun-green))] animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-bubblegum flex items-center">
              <span>{practicesThisWeek}</span>
              <span className="ml-2 text-2xl">{getSessionsEmoji(practicesThisWeek)}</span>
              <span className="ml-2 text-lg font-comic text-gray-600">times</span>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[hsl(var(--fun-green))] to-[hsl(var(--fun-blue))] rounded-full" 
                style={{ width: `${frequencyPercentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-comic text-gray-600">{frequencyMessage}</p>
          </CardContent>
        </Card>

        <Card className="card-fun bg-gradient-to-br from-[hsl(var(--fun-yellow))]/10 to-[hsl(var(--fun-green))]/10 pop-in" style={{animationDelay: '300ms'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bubblegum text-[hsl(var(--fun-yellow))]">Speech Clarity</CardTitle>
            <Trophy className="h-6 w-6 text-[hsl(var(--fun-yellow))] animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-bubblegum flex items-center justify-between">
              <div>
                <span className="text-3xl">{Math.round(progress.clarity_score)}%</span>
                <span className="text-sm ml-1 font-comic text-gray-600">avg</span>
              </div>
              <div>
                <span className="text-3xl">{Math.round(progress.best_clarity_score || progress.clarity_score)}%</span>
                <span className="text-sm ml-1 font-comic text-gray-600">best</span>
                <span className="ml-2 text-2xl">{getClarityEmoji(progress.best_clarity_score || progress.clarity_score)}</span>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full rounded-full" 
                style={{
                  width: `${clarityPercentage}%`,
                  background: `linear-gradient(to right, hsl(var(--fun-green)), hsl(var(--fun-yellow)) ${clarityPercentage}%)`
                }}
              />
            </div>
            <p className="mt-3 text-sm font-comic text-gray-600">{clarityMessage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))] text-shadow-fun mb-4">Your Awesome Badges!</h2>
        <BadgesShowcase badges={badges} earnedBadgeIds={earnedBadgeIds} />
      </div>
    </div>
  );
}
