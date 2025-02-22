export type SpeechAnalysisResult = {
  success: boolean;
  result?: {
    text: string;
    confidence: number;
    score: number;
    feedback: string[];
    wordTimings: Array<{
      word: string;
      startTime: number;
      endTime: number;
      confidence: number;
    }>;
  };
  error?: string;
};

export async function analyzeSpeech(
  audioBlob: Blob,
  tongueTwisterId: string
): Promise<SpeechAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('tongueTwisterId', tongueTwisterId);

    const response = await fetch('/api/speech/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze speech');
    }

    return data;
  } catch (error) {
    console.error('Error analyzing speech:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze speech',
    };
  }
}
