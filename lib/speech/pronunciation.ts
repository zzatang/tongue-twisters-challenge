interface PronunciationResult {
  score: number;
  feedback: string[];
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
  const score = Math.round((correctWords / expectedWords.length) * 100);

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
