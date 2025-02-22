"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { DifficultyFilter } from "@/components/dashboard/difficulty-filter";
import { TongueTwisterTile } from "@/components/dashboard/tongue-twister-tile";
import { ProgressTracking } from "@/components/dashboard/progress-tracking";
import { getTongueTwisters, getUserProgress } from "@/lib/supabase/api";
import { TongueTwister, UserProgress } from "@/lib/supabase/types";
import { generateTitle } from "@/lib/utils/text";

type Difficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'All';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("All");
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
        const [twistersData, progressData] = await Promise.all([
          getTongueTwisters(),
          getUserProgress(user.id)
        ]);

        setTongueTwisters(twistersData);
        setUserProgress(progressData);
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
    (twister) => selectedDifficulty === "All" || twister.difficulty === selectedDifficulty
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
                  practiceStreak: userProgress.practice_frequency.daily,
                  totalPracticeTime: userProgress.total_practice_time,
                  averageClarityScore: userProgress.clarity_score,
                  practiceFrequency: {
                    thisWeek: userProgress.practice_frequency.weekly,
                    lastWeek: userProgress.practice_frequency.monthly / 4, // Approximate
                  },
                  badges: userProgress.badges.map(badge => ({
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    earned: badge.earned,
                  }))
                }}
              />
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tongue Twisters</h2>
                <DifficultyFilter
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={setSelectedDifficulty}
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
