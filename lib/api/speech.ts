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
    // Convert blob to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(audioBlob);
    });

    console.log('Sending audio data to API...');
    
    const response = await fetch('/api/speech/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64Audio,
        tongueTwisterId,
      }),
    });

    const data = await response.json();
    console.log('API response:', data);

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
