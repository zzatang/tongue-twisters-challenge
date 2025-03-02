"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface FeedbackProps {
  isLoading?: boolean;
  feedback: {
    clarityScore: number;
    mispronunciations: Array<{
      word: string;
      expected: string;
      actual: string;
    }>;
    tips: string[];
  } | null;
  error?: string | null;
}

export const Feedback = ({ isLoading, feedback, error }: FeedbackProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyzing your pronunciation...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error === "No speech detected. Please try again." ? "No Speech Detected" : "Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-red-600 flex items-start">
            <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              {feedback && feedback.tips && feedback.tips.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Tips:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feedback.tips.map((tip, index) => (
                      <li key={index} className="text-sm">{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm mt-4">Please try again or try a different tongue twister.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return null;
  }

  const { clarityScore, mispronunciations, tips } = feedback;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pronunciation Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clarity Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Clarity Score</h3>
            <span className="text-sm text-muted-foreground">
              {clarityScore}%
            </span>
          </div>
          <Progress value={typeof clarityScore === 'number' ? clarityScore : 0} className="h-2" />
        </div>

        {/* Mispronunciations */}
        {mispronunciations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Words to Practice</h3>
            <div className="space-y-2">
              {mispronunciations.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{item.word}</p>
                    <p className="text-sm text-muted-foreground">
                      You said: &quot;{item.actual}&quot;
                      <br />
                      Expected: &quot;{item.expected}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Improvement Tips</h3>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  {clarityScore >= 80 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
