"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { ProgressTracking } from "@/components/dashboard/progress-tracking";
import { TongueTwisterTile } from "@/components/dashboard/tongue-twister-tile";
import { getTongueTwisters } from "@/lib/services/twister-service";
import { getUserProgress } from "@/lib/services/progress-service";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Sparkles, Music } from "lucide-react";
import type { UserProgress } from "@/lib/supabase/types";

type DifficultyLevel = "Easy" | "Intermediate" | "Advanced";
type DifficultyFilter = DifficultyLevel | "All";

interface TongueTwister {
  id: string;
  text: string;
  difficulty: DifficultyLevel;
  category: string;
  created_at: string | null;
  updated_at: string | null;
  description?: string | null;
  example_words?: string[];
  phonetic_focus?: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

interface Metrics {
  practiceStreak: number;
  totalPracticeTime: number;
  averageClarityScore: number;
  practiceFrequency: {
    thisWeek: number;
    lastWeek: number;
  };
  badges: Badge[];
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [tongueTwisters, setTongueTwisters] = useState<TongueTwister[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value as DifficultyFilter);
  };

  const handleTongueTwisterClick = (twisterId: string) => {
    router.push(`/practice/${twisterId}`);
  };

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tongue twisters and user progress in parallel
        const [twistersData, progressData] = await Promise.allSettled([
          getTongueTwisters(),
          getUserProgress(user.id)
        ]);

        // Handle tongue twisters data
        if (twistersData.status === 'fulfilled') {
          // Map the database tongue twisters to our local type
          const mappedTwisters: TongueTwister[] = twistersData.value.map(twister => ({
            id: twister.id,
            text: twister.text,
            difficulty: twister.difficulty as DifficultyLevel,
            category: twister.category,
            created_at: twister.created_at,
            updated_at: twister.updated_at,
            description: twister.description,
            example_words: twister.example_words,
            phonetic_focus: twister.phonetic_focus
          }));

          setTongueTwisters(mappedTwisters);
        } else {
          console.error("Error fetching tongue twisters:", twistersData.reason);
          setError("Failed to load tongue twisters. Please try again later.");
        }

        // Handle user progress data
        if (progressData.status === 'fulfilled') {
          setUserProgress(progressData.value);
        } else {
          console.error("Error fetching user progress:", progressData.reason);
          // Don't set error here, as we can still show tongue twisters
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const filteredTongueTwisters = tongueTwisters.filter(
    (twister) => {
      if (selectedDifficulty === "All") return true;
      return twister.difficulty === selectedDifficulty;
    }
  );

  // Calculate metrics from user progress data
  const calculateMetrics = (): Metrics | null => {
    if (!userProgress) return null;
    
    const thisWeekCount = userProgress.practice_frequency && 
      typeof userProgress.practice_frequency === 'object' && 
      userProgress.practice_frequency.daily ? 
      Object.values(userProgress.practice_frequency.daily).reduce((sum: number, count: number) => sum + count, 0) : 0;
    
    const lastWeekCount = userProgress.practice_frequency && 
      typeof userProgress.practice_frequency === 'object' && 
      userProgress.practice_frequency.weekly ? 
      Object.values(userProgress.practice_frequency.weekly).reduce((sum: number, count: number) => sum + count, 0) : 0;
    
    const badges = userProgress.badges && Array.isArray(userProgress.badges) ? 
      userProgress.badges.map((badge: any) => ({
        id: badge.id || '',
        name: badge.name || '',
        description: badge.description || '',
        earned: !!badge.earned
      })) : [];
    
    return {
      practiceStreak: userProgress.practice_streak || 0,
      totalPracticeTime: userProgress.total_practice_time || 0,
      averageClarityScore: userProgress.clarity_score || 0,
      practiceFrequency: {
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount
      },
      badges
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-fun-pattern">
      <header className="border-b border-[hsl(var(--fun-purple))]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))] flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-[hsl(var(--fun-yellow))] animate-float" />
            Tongue Twisters Challenge
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container px-4 py-8">
        {error ? (
          <div className="text-red-500 text-center p-6 font-comic bg-white rounded-xl shadow-lg">
            <p className="text-xl font-bubblegum text-[hsl(var(--fun-pink))] mb-2">Oops!</p>
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-[hsl(var(--fun-purple))] hover:bg-[hsl(var(--fun-purple))]/90 font-comic"
            >
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center p-8">
            <div className="animate-bounce mb-4">
              <Music className="h-12 w-12 text-[hsl(var(--fun-purple))] mx-auto" />
            </div>
            <p className="text-xl font-bubblegum text-[hsl(var(--fun-purple))]">Loading your fun tongue twisters...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {metrics && (
              <ProgressTracking metrics={metrics} />
            )}

            <div className="card-fun p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))] flex items-center">
                  <Mic className="h-6 w-6 mr-2 text-[hsl(var(--fun-pink))]" />
                  Pick a Tongue Twister!
                </h2>
                <DifficultyFilter
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={handleDifficultyChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTongueTwisters.length > 0 ? (
                  filteredTongueTwisters.map((twister) => (
                    <TongueTwisterTile
                      key={twister.id}
                      title={twister.category}
                      text={twister.text}
                      difficulty={twister.difficulty}
                      onClick={() => handleTongueTwisterClick(twister.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center p-8 font-comic">
                    <p className="text-xl font-bubblegum text-[hsl(var(--fun-purple))] mb-2">No tongue twisters found!</p>
                    <p>Try selecting a different difficulty level.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: {
  selectedDifficulty: DifficultyFilter;
  onDifficultyChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium text-[hsl(var(--fun-purple))] font-comic">Difficulty:</span>
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-[140px] border-2 border-[hsl(var(--fun-purple))]/30 bg-white font-comic text-[hsl(var(--fun-purple))]">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent className="font-comic">
          <SelectItem value="All" className="cursor-pointer">All Levels</SelectItem>
          <SelectItem value="Easy" className="cursor-pointer">Easy</SelectItem>
          <SelectItem value="Intermediate" className="cursor-pointer">Intermediate</SelectItem>
          <SelectItem value="Advanced" className="cursor-pointer">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
