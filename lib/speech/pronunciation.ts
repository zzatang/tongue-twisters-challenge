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
    // In a real implementation, this would send the audio to Google Speech-to-Text API
    // For testing purposes, we'll simulate a response
    
    // Simulate recognized text (in production, this would come from the API)
    const recognizedText = expectedText; // Perfect match for testing
    
    // Calculate pronunciation score using our existing function
    const { score, feedback } = calculatePronunciationScore(recognizedText, expectedText);
    
    // Identify potentially mispronounced words (simplified for testing)
    const mispronounced = expectedText
      .toLowerCase()
      .split(/\s+/)
      .filter(() => Math.random() < 0.2); // Randomly select ~20% of words as "mispronounced"
    
    return {
      clarity: score,
      mispronounced: mispronounced.length ? mispronounced : [],
      tips: feedback,
    };
  } catch (error) {
    console.error('Speech analysis error:', error);
    throw new Error('Failed to analyze speech');
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

  // Check for repeated mistakes in specific sounds
  const commonSoundPatterns = [
    { pattern: /sh|ch|th/, message: "Pay attention to the 'sh/ch/th' sounds." },
    { pattern: /s|z/, message: "Focus on clear 's' and 'z' sounds." },
    { pattern: /r|l/, message: "Practice the 'r' and 'l' sounds carefully." },
  ];

  for (const { pattern, message } of commonSoundPatterns) {
    if (pattern.test(expectedText) && !pattern.test(recognizedText)) {
      feedback.push(message);
    }
  }

  return {
    score,
    feedback: feedback.slice(0, 3), // Limit to top 3 most relevant feedback items
  };
}
