import speech from '@google-cloud/speech';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Speech-to-Text client
const client = new speech.SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
});

export interface SpeechAnalysisResult {
  text: string;
  confidence: number;
  duration: number; // Total duration in seconds
  wordTimings: {
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }[];
}

export async function analyzeSpeech(
  audioBuffer: Buffer
): Promise<SpeechAnalysisResult> {
  try {
    // Create a unique name for this audio sample
    const audioFileName = `speech-${uuidv4()}`;

    // Configure the request
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      model: 'latest_long',
    };

    const request = {
      audio,
      config,
    };

    // Make the request
    const [response] = await client.recognize(request);
    const transcription = response.results?.[0];

    if (!transcription || !transcription.alternatives?.[0]) {
      throw new Error('No transcription results');
    }

    const result = transcription.alternatives[0];
    const wordTimings = (result.words || []).map(word => ({
      word: word.word || '',
      startTime: Number(word.startTime?.seconds || 0) + Number(word.startTime?.nanos || 0) / 1e9,
      endTime: Number(word.endTime?.seconds || 0) + Number(word.endTime?.nanos || 0) / 1e9,
      confidence: word.confidence || 0,
    }));

    // Calculate total duration from word timings
    const duration = wordTimings.length > 0
      ? wordTimings[wordTimings.length - 1].endTime - wordTimings[0].startTime
      : 0;

    return {
      text: result.transcript || '',
      confidence: result.confidence || 0,
      duration,
      wordTimings,
    };
  } catch (error) {
    console.error('Speech analysis error:', error);
    throw error;
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
