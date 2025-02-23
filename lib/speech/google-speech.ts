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
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      audioChannelCount: 1,
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      model: 'default',
      useEnhanced: true, // Enable enhanced speech recognition
    };

    const request = {
      audio,
      config,
    };

    console.log('Sending request to Google Speech API with config:', {
      ...config,
      content_length: audioBuffer.length,
    });

    // Perform the transcription
    const [response] = await client.recognize(request);
    
    // Create a safe version of the response data for logging
    const responseInfo = {
      results: response?.results?.length || 0,
      hasAlternatives: Boolean(response?.results?.[0]?.alternatives?.length),
      firstTranscript: response?.results?.[0]?.alternatives?.[0]?.transcript || '',
    };
    
    console.log('Google Speech API response:', JSON.stringify(responseInfo, null, 2));

    if (!response?.results || response.results.length === 0) {
      throw new Error('No transcription results returned from Google Speech API');
    }

    const transcription = response.results[0]?.alternatives?.[0];

    if (!transcription) {
      throw new Error('No transcription alternatives available');
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

    // Calculate total duration from word timings
    const duration = wordTimings.length > 0
      ? wordTimings[wordTimings.length - 1].endTime - wordTimings[0].startTime
      : 0;

    return {
      text: transcription.transcript || '',
      confidence: transcription.confidence || 0,
      duration,
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
