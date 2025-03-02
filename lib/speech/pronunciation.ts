import { analyzeSpeech as googleAnalyzeSpeech, calculatePronunciationScore as googleCalculateScore } from './google-speech';

interface PronunciationResult {
  score: number;
  feedback: string[];
}

interface SpeechAnalysisResult {
  clarity: number;
  mispronounced: string[];
  tips: string[];
}

/**
 * Analyze speech audio data against an expected tongue twister text
 * 
 * @param audioData - Base64 encoded audio data
 * @param expectedText - The original tongue twister text to compare against
 * @returns Object containing clarity score, mispronounced words, and improvement tips
 */
export async function analyzeSpeech(
  audioData: string,
  expectedText: string
): Promise<SpeechAnalysisResult> {
  try {
    // Convert base64 to Buffer for Google Speech API
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Call Google Speech-to-Text API
    const googleResult = await googleAnalyzeSpeech(audioBuffer);
    
    // If no speech was detected (empty text)
    if (!googleResult.text || googleResult.text.trim() === '') {
      return {
        clarity: 0,
        mispronounced: [],
        tips: [
          "No speech detected. Please speak clearly into your microphone.",
          "Make sure your microphone is working properly.",
          "Try speaking louder or closer to your microphone."
        ]
      };
    }
    
    // Calculate pronunciation score using Google's result
    const { score, feedback } = googleCalculateScore(googleResult, expectedText);
    
    // Identify potentially mispronounced words by comparing with expected text
    const expectedWords = expectedText.toLowerCase().split(/\s+/);
    const recognizedWords = googleResult.text.toLowerCase().split(/\s+/);
    
    // Find words that are in expected but not in recognized (or with low confidence)
    const mispronounced = expectedWords.filter(word => {
      const matchingWord = googleResult.wordTimings.find(
        timing => timing.word.toLowerCase() === word.toLowerCase()
      );
      return !matchingWord || matchingWord.confidence < 0.7;
    });
    
    return {
      clarity: score,
      mispronounced: mispronounced.length ? mispronounced : [],
      tips: feedback,
    };
  } catch (error) {
    console.error('Speech analysis error:', error);
    // Return a user-friendly error response instead of throwing
    return {
      clarity: 0,
      mispronounced: [],
      tips: [
        "We couldn't analyze your speech. Please try again.",
        "Make sure your microphone is properly connected and working.",
        "Try speaking more clearly and directly into your microphone."
      ]
    };
  }
}

/**
 * Calculate a pronunciation score and generate feedback by comparing the recognized text
 * with the expected tongue twister text.
 * 
 * @param recognizedText - The text recognized by the speech-to-text API
 * @param expectedText - The original tongue twister text
 * @returns Object containing score (0-100) and array of feedback messages
 */
export function calculatePronunciationScore(
  recognizedText: string,
  expectedText: string
): PronunciationResult {
  // Normalize both texts for comparison
  const normalizedRecognized = recognizedText.toLowerCase().trim();
  const normalizedExpected = expectedText.toLowerCase().trim();

  // Calculate word accuracy
  const expectedWords = normalizedExpected.split(/\s+/);
  const recognizedWords = normalizedRecognized.split(/\s+/);
  
  const correctWords = recognizedWords.filter((word, index) => 
    expectedWords[index] === word
  ).length;

  // Calculate base score (0-100)
  const score = Math.floor((correctWords / expectedWords.length) * 100 + 0.5);

  // Generate feedback based on score and specific patterns
  const feedback: string[] = [];

  if (score < 50) {
    feedback.push("Try speaking more slowly and clearly.");
  } else if (score < 75) {
    feedback.push("Good effort! Focus on pronouncing each word distinctly.");
  } else if (score < 90) {
    feedback.push("Very good! Keep practicing to perfect your pronunciation.");
  } else {
    feedback.push("Excellent pronunciation! Try increasing your speed.");
  }

  // Check for specific patterns
  if (recognizedWords.length < expectedWords.length) {
    feedback.push("Make sure to say all the words in the tongue twister.");
  }

  if (recognizedWords.length > expectedWords.length) {
    feedback.push("Try to maintain a steady pace without adding extra words.");
  }

  return { score, feedback };
}
