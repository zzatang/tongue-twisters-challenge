"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { DifficultyFilter } from "@/components/dashboard/difficulty-filter";
import { TongueTwisterTile } from "@/components/dashboard/tongue-twister-tile";
import { ProgressTracking } from "@/components/dashboard/progress-tracking";

// Sample data - This would come from your Supabase database in production
const tongueTwisters = [
  {
    id: 1,
    title: "Peter Piper",
    text: "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "She Sells Seashells",
    text: "She sells seashells by the seashore. The shells she sells are surely seashells.",
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Fuzzy Wuzzy",
    text: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn't fuzzy, was he?",
    difficulty: "Intermediate",
  },
  {
    id: 4,
    title: "Unique New York",
    text: "Unique New York. You know you need unique New York.",
    difficulty: "Intermediate",
  },
  {
    id: 5,
    title: "Six Slick Slim Slick Slabs",
    text: "Six slick slim slick slabs split.",
    difficulty: "Advanced",
  },
] as const;

// Sample progress data - This would come from your Supabase database in production
const sampleProgressData = {
  practiceStreak: 5,
  totalPracticeTime: 120, // in minutes
  averageClarityScore: 85,
  practiceFrequency: {
    thisWeek: 12,
    lastWeek: 8,
  },
  badges: [
    {
      id: "streak-3",
      name: "3-Day Streak",
      description: "Practice for 3 days in a row",
      earned: true,
    },
    {
      id: "clarity-80",
      name: "Clear Speaker",
      description: "Achieve 80% clarity score",
      earned: true,
    },
    {
      id: "practice-10",
      name: "Dedicated Learner",
      description: "Complete 10 practice sessions",
      earned: true,
    },
    {
      id: "advanced-5",
      name: "Advanced Master",
      description: "Master 5 advanced tongue twisters",
      earned: false,
    },
    {
      id: "perfect-100",
      name: "Perfect Score",
      description: "Achieve 100% clarity score",
      earned: false,
    },
    {
      id: "streak-7",
      name: "Weekly Warrior",
      description: "Practice for 7 days in a row",
      earned: false,
    },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const filteredTwisters = tongueTwisters.filter(
    (twister) =>
      selectedDifficulties.length === 0 ||
      selectedDifficulties.includes(twister.difficulty)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Tongue Twisters Challenge</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Progress Tracking */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <ProgressTracking metrics={sampleProgressData} />
          </section>

          {/* Tongue Twisters */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Practice Tongue Twisters</h2>
            <DifficultyFilter
              selectedDifficulty={selectedDifficulties}
              onDifficultyChange={setSelectedDifficulties}
            />
          </section>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTwisters.map((twister) => (
              <TongueTwisterTile
                key={twister.id}
                title={twister.title}
                text={twister.text}
                difficulty={twister.difficulty}
                onPractice={() => router.push(`/practice/${twister.id}`)}
              />
            ))}
          </section>

          {filteredTwisters.length === 0 && (
            <p className="text-center text-muted-foreground">
              No tongue twisters found for the selected difficulty levels.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
