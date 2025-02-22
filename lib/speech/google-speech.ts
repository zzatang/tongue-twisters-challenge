import speech from '@google-cloud/speech';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Speech-to-Text client
const client = new speech.SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
});

export interface SpeechAnalysisResult {
  text: string;
  confidence: number;
  wordTimings: {
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }[];
}

export async function analyzeSpeech(
  audioBuffer: Buffer,
  expectedText: string
): Promise<SpeechAnalysisResult> {
  try {
    // Create a unique name for this audio sample
    const audioFileName = `speech-${uuidv4()}`;

    // Configure the request
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'LINEAR16' as const,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      model: 'default',
    };

    const request = {
      audio,
      config,
    };

    // Perform the transcription
    const [response] = await client.recognize(request);
    const transcription = response.results?.[0]?.alternatives?.[0];

    if (!transcription) {
      throw new Error('No transcription result available');
    }

    // Process word timing information
    const wordTimings = transcription.words?.map((wordInfo) => ({
      word: wordInfo.word || '',
      startTime: Number(wordInfo.startTime?.seconds || 0) + 
                Number(wordInfo.startTime?.nanos || 0) / 1e9,
      endTime: Number(wordInfo.endTime?.seconds || 0) + 
              Number(wordInfo.endTime?.nanos || 0) / 1e9,
      confidence: wordInfo.confidence || 0,
    })) || [];

    return {
      text: transcription.transcript || '',
      confidence: transcription.confidence || 0,
      wordTimings,
    };
  } catch (error) {
    console.error('Speech analysis error:', error);
    throw new Error('Failed to analyze speech');
  }
}

export function calculatePronunciationScore(
  result: SpeechAnalysisResult,
  expectedText: string
): {
  score: number;
  feedback: string[];
} {
  const expectedWords = expectedText.toLowerCase().split(/\s+/);
  const transcribedWords = result.text.toLowerCase().split(/\s+/);
  const feedback: string[] = [];

  // Calculate word match score
  const matchedWords = transcribedWords.filter(word => 
    expectedWords.includes(word)
  ).length;
  const wordMatchScore = (matchedWords / expectedWords.length) * 100;

  // Calculate confidence score
  const confidenceScore = result.confidence * 100;

  // Calculate timing score
  const avgWordDuration = result.wordTimings.reduce(
    (sum, timing) => sum + (timing.endTime - timing.startTime),
    0
  ) / result.wordTimings.length;

  // Generate feedback
  if (wordMatchScore < 80) {
    feedback.push('Try to pronounce each word more clearly');
  }
  if (confidenceScore < 70) {
    feedback.push('Speak a bit more slowly and distinctly');
  }
  if (avgWordDuration > 0.5) {
    feedback.push('Try to maintain a steady, natural speaking pace');
  }

  // Calculate final score (weighted average)
  const finalScore = (
    wordMatchScore * 0.5 +
    confidenceScore * 0.3 +
    Math.min(100, (1 - avgWordDuration) * 100) * 0.2
  );

  return {
    score: Math.round(finalScore),
    feedback,
  };
}
