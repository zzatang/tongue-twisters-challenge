"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { DifficultyFilter } from "@/components/dashboard/difficulty-filter";
import { TongueTwisterTile } from "@/components/dashboard/tongue-twister-tile";
import { ProgressTracking } from "@/components/dashboard/progress-tracking";
import { getTongueTwisters, getUserProgress } from "@/lib/supabase/api";
import type { UserProgress, TongueTwister as DbTongueTwister } from "@/lib/supabase/types";
import { generateTitle } from "@/lib/utils/text";

// Update types to match database schema
type DifficultyLevel = 'Easy' | 'Intermediate' | 'Advanced';
type DifficultyFilter = 'All' | DifficultyLevel;

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

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("All");
  
  // Handle difficulty change
  const handleDifficultyChange = (difficulty: DifficultyFilter) => {
    console.log('Setting difficulty to:', difficulty);
    setSelectedDifficulty(difficulty);
  };

  const [tongueTwisters, setTongueTwisters] = useState<TongueTwister[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

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
      console.log('Filtering twister:', twister.difficulty, 'Selected difficulty:', selectedDifficulty);
      
      if (selectedDifficulty === "All") return true;
      
      return twister.difficulty === selectedDifficulty;
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container px-4 py-8">
        {error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : isLoading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <div className="space-y-8">
            {userProgress && (
              <ProgressTracking
                metrics={{
                  practiceStreak: userProgress.practice_streak,
                  totalPracticeTime: userProgress.total_practice_time,
                  averageClarityScore: userProgress.clarity_score,
                  practiceFrequency: {
                    thisWeek: Object.values(userProgress.practice_frequency.daily || {}).reduce((sum, count) => sum + count, 0),
                    lastWeek: Object.values(userProgress.practice_frequency.weekly || {}).reduce((sum, count) => sum + count, 0)
                  },
                  badges: userProgress.badges?.map(badge => ({
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    earned: badge.earned
                  })) || []
                }}
              />
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tongue Twisters</h2>
                <DifficultyFilter
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={handleDifficultyChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTongueTwisters.map((twister) => (
                  <TongueTwisterTile
                    key={twister.id}
                    title={generateTitle(twister.text)}
                    text={twister.text}
                    difficulty={twister.difficulty}
                    onClick={() => router.push(`/practice/${twister.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
