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
    
    // Check if we have any results
    if (!response.results || response.results.length === 0) {
      // No speech detected
      return {
        text: '',
        confidence: 0,
        duration: 0,
        wordTimings: [],
      };
    }
    
    const transcription = response.results[0];

    if (!transcription || !transcription.alternatives?.[0]) {
      // Return empty result instead of throwing
      return {
        text: '',
        confidence: 0,
        duration: 0,
        wordTimings: [],
      };
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
    // Return a default result instead of throwing
    return {
      text: '',
      confidence: 0,
      duration: 0,
      wordTimings: [],
    };
  }
}

export function calculatePronunciationScore(
  result: SpeechAnalysisResult,
  expectedText: string
): {
  score: number;
  feedback: string[];
} {
  // If no speech was detected or text is empty
  if (!result.text || result.text.trim() === '') {
    return {
      score: 0,
      feedback: [
        "No speech detected. Please speak clearly into your microphone.",
        "Make sure your microphone is working properly.",
        "Try speaking louder or closer to your microphone."
      ]
    };
  }

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
    (sum, word) => sum + (word.endTime - word.startTime),
    0
  ) / (result.wordTimings.length || 1);

  // Combine scores with appropriate weights
  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(wordMatchScore * 0.7 + confidenceScore * 0.3)
    )
  );

  // Generate feedback based on score
  if (score < 30) {
    feedback.push("Try speaking more slowly and clearly.");
    feedback.push("Focus on pronouncing each word distinctly.");
  } else if (score < 60) {
    feedback.push("Good effort! Try to enunciate each syllable more clearly.");
  } else if (score < 80) {
    feedback.push("Very good! Keep practicing to perfect your pronunciation.");
  } else {
    feedback.push("Excellent pronunciation! Try increasing your speed.");
  }

  // Add specific feedback on missed words
  const missedWords = expectedWords.filter(word => !transcribedWords.includes(word));
  if (missedWords.length > 0) {
    feedback.push(`Focus on pronouncing: ${missedWords.slice(0, 3).join(', ')}${missedWords.length > 3 ? '...' : ''}`);
  }

  return { score, feedback };
}
