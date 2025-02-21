"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeechRecorder } from "@/components/practice/speech-recorder";
import { Feedback } from "@/components/practice/feedback";

// Sample data - This would come from your Supabase database in production
const tongueTwisters = [
  {
    id: "1",
    title: "Peter Piper",
    text: "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.",
    difficulty: "Easy",
  },
  {
    id: "2",
    title: "She Sells Seashells",
    text: "She sells seashells by the seashore. The shells she sells are surely seashells.",
    difficulty: "Easy",
  },
  {
    id: "3",
    title: "Fuzzy Wuzzy",
    text: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn't fuzzy, was he?",
    difficulty: "Intermediate",
  },
  {
    id: "4",
    title: "Unique New York",
    text: "Unique New York. You know you need unique New York.",
    difficulty: "Intermediate",
  },
  {
    id: "5",
    title: "Six Slick Slim Slick Slabs",
    text: "Six slick slim slick slabs split.",
    difficulty: "Advanced",
  },
] as const;

interface PracticePageProps {
  params: {
    id: string;
  };
}

type FeedbackData = {
  clarityScore: number;
  mispronunciations: Array<{
    word: string;
    expected: string;
    actual: string;
  }>;
  tips: string[];
};

export default function PracticePage({ params }: PracticePageProps) {
  const router = useRouter();
  const [tongueTwister, setTongueTwister] = useState<(typeof tongueTwisters)[number] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    const twister = tongueTwisters.find((t) => t.id === params.id);
    if (!twister) {
      router.push("/dashboard");
      return;
    }
    setTongueTwister(twister);
  }, [params.id, router]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    setFeedback(null);

    // TODO: Implement actual Google Speech-to-Text API integration
    // For now, simulate API response with mock data
    setTimeout(() => {
      setFeedback({
        clarityScore: 75,
        mispronunciations: [
          {
            word: "Peter",
            expected: "piːtər",
            actual: "pɪtər",
          },
          {
            word: "Piper",
            expected: "paɪpər",
            actual: "pɪpər",
          },
        ],
        tips: [
          "Focus on the 'long i' sound in 'Piper'",
          "Try slowing down the phrase to improve accuracy",
          "Practice the 'p' and 't' sounds separately",
        ],
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  if (!tongueTwister) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{tongueTwister.title}</h1>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Practice this tongue twister</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-xl font-medium text-center p-8 bg-muted/50 rounded-lg">
                {tongueTwister.text}
              </div>

              <SpeechRecorder onRecordingComplete={handleRecordingComplete} />

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Start slowly and gradually increase your speed</li>
                  <li>Focus on clear pronunciation of each word</li>
                  <li>Practice the difficult sounds in isolation first</li>
                  <li>Take breaks between attempts to avoid fatigue</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Feedback isLoading={isAnalyzing} feedback={feedback} />
        </div>
      </main>
    </div>
  );
}
