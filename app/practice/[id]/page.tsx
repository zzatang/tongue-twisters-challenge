"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeechRecorder } from "@/components/practice/speech-recorder";
import { Feedback } from "@/components/practice/feedback";
import { analyzeSpeech } from "@/lib/api/speech";
import { getTongueTwisterById } from "@/lib/supabase/api";
import type { TongueTwister } from "@/lib/supabase/types";

type FeedbackData = {
  clarityScore: number;
  mispronunciations: Array<{
    word: string;
    expected: string;
    actual: string;
  }>;
  tips: string[];
};

// Helper function to generate a title from the tongue twister text
function generateTitle(text: string): string {
  // Take first few words (up to 5) and capitalize them
  return text.split(' ').slice(0, 5).join(' ');
}

export default function PracticePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tongueTwister, setTongueTwister] = useState<TongueTwister | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTongueTwister() {
      try {
        const twister = await getTongueTwisterById(params.id);
        if (!twister) {
          router.push("/dashboard");
          return;
        }
        setTongueTwister(twister);
      } catch (error) {
        console.error("Error fetching tongue twister:", error);
        router.push("/dashboard");
      }
    }

    fetchTongueTwister();
  }, [params.id, router]);

  const handleRecordingComplete = async (audioData: string) => {
    setIsAnalyzing(true);
    setFeedback(null);
    setError(null);

    try {
      // Convert base64 string to Blob for API call
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/webm' });
      
      console.log('Calling analyzeSpeech with tongue twister ID:', params.id);
      const result = await analyzeSpeech(audioBlob, params.id);
      console.log('Speech analysis result:', result);

      if (!result.success) {
        // Special handling for "no speech detected" case
        if (result.error === 'No speech detected' && result.result) {
          // Show feedback with the tips for no speech detected
          const noSpeechFeedback: FeedbackData = {
            clarityScore: 0,
            mispronunciations: [],
            tips: result.result.feedback,
          };
          setFeedback(noSpeechFeedback);
          setError("No speech detected. Please try again.");
          return;
        }
        
        // Handle other errors
        throw new Error(result.error || 'Failed to analyze speech');
      }

      if (!result.result) {
        throw new Error('No analysis results returned');
      }

      // Convert the API result to our FeedbackData format
      const feedbackData: FeedbackData = {
        clarityScore: result.result.score,
        mispronunciations: [], // We'll enhance this with actual mispronunciations later
        tips: result.result.feedback,
      };

      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error analyzing speech:", error);
      setError(error instanceof Error ? error.message : "Failed to analyze speech");
    } finally {
      setIsAnalyzing(false);
    }
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
          <h1 className="text-2xl font-bold">{generateTitle(tongueTwister.text)}</h1>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Practice this tongue twister</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {tongueTwister ? (
                <>
                  <div className="text-xl font-medium text-center p-8 bg-muted/50 rounded-lg">
                    {tongueTwister.text}
                  </div>

                  <SpeechRecorder 
                    onRecordingComplete={handleRecordingComplete}
                    tongueTwister={tongueTwister}
                  />
                </>
              ) : (
                <div className="text-center p-8">
                  Loading tongue twister...
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

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

          <Feedback isLoading={isAnalyzing} feedback={feedback} error={error} />
        </div>
      </main>
    </div>
  );
}
