/**
 * Result of speech analysis containing clarity score, mispronounced words, and improvement tips
 */
export interface SpeechAnalysisResult {
  /**
   * Clarity score from 0-100 representing how well the tongue twister was pronounced
   */
  clarity: number;
  
  /**
   * List of words that were mispronounced
   */
  mispronounced: string[];
  
  /**
   * Tips for improving pronunciation
   */
  tips: string[];
}
