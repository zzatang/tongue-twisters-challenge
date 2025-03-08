import { supabaseAdmin } from '@/lib/supabase/admin';
import type { BadgeProgress, UserProgress } from '@/lib/supabase/types';
import type { PostgrestError } from '@supabase/supabase-js';

type PracticeFrequency = {
  daily: { [key: string]: number };
  weekly: { [key: string]: number };
  monthly: { [key: string]: number };
};

/**
 * Fetches user progress data from the database
 * @param userId The user ID to fetch progress for
 * @returns The user's progress data or null if not found
 */
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no data found, create default progress for new user
      if (error.code === 'PGRST116') { // PGRST116 is "no rows returned" error
        return await createDefaultUserProgress(userId);
      }
      
      console.error(`Error fetching user progress for user ${userId}:`, error);
      return null;
    }

    return data as UserProgress;
  } catch (error) {
    console.error(`Error in getUserProgress for user ${userId}:`, error);
    return null;
  }
}

/**
 * Creates default progress entry for a new user
 * @param userId The user ID to create progress for
 * @returns The newly created user progress data
 */
async function createDefaultUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const defaultProgress = {
      user_id: userId,
      practice_streak: 0,
      total_practice_time: 0,
      clarity_score: 0,
      total_sessions: 0,
      practice_frequency: {
        daily: {},
        weekly: {},
        monthly: {}
      },
      badges: []
    };

    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .insert(defaultProgress)
      .select()
      .single();

    if (error) {
      console.error(`Error creating default progress for user ${userId}:`, error);
      return null;
    }

    console.log(`Created default progress for new user ${userId}`);
    return data as UserProgress;
  } catch (error) {
    console.error(`Error in createDefaultUserProgress for user ${userId}:`, error);
    return null;
  }
}

async function updatePracticeFrequency(userId: string, date: string = new Date().toISOString().split('T')[0]): Promise<PracticeFrequency> {
  const { data: userProgress, error } = await supabaseAdmin
    .from('user_progress')
    .select('practice_frequency')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching user progress:', error);
    throw error;
  }

  // Initialize with empty objects if no data exists
  const practice_frequency: PracticeFrequency = {
    daily: {},
    weekly: {},
    monthly: {}
  };

  // If we have existing data, safely copy it
  if (userProgress?.practice_frequency) {
    const existing = userProgress.practice_frequency as PracticeFrequency;
    if (existing.daily && typeof existing.daily === 'object') {
      practice_frequency.daily = { ...existing.daily };
    }
    if (existing.weekly && typeof existing.weekly === 'object') {
      practice_frequency.weekly = { ...existing.weekly };
    }
    if (existing.monthly && typeof existing.monthly === 'object') {
      practice_frequency.monthly = { ...existing.monthly };
    }
  }

  // Update daily count
  practice_frequency.daily[date] = (practice_frequency.daily[date] || 0) + 1;

  // Update weekly count
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekKey = weekStart.toISOString().split('T')[0];
  practice_frequency.weekly[weekKey] = (practice_frequency.weekly[weekKey] || 0) + 1;

  // Update monthly count
  const monthKey = date.slice(0, 7); // YYYY-MM
  practice_frequency.monthly[monthKey] = (practice_frequency.monthly[monthKey] || 0) + 1;

  // Clean up old entries (keep last 90 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // Clean up old entries safely
  Object.keys(practice_frequency.daily).forEach(key => {
    if (key < cutoffDateStr) {
      delete practice_frequency.daily[key];
    }
  });

  const weekCutoff = new Date(cutoffDate);
  weekCutoff.setDate(weekCutoff.getDate() - weekCutoff.getDay());
  const weekCutoffStr = weekCutoff.toISOString().split('T')[0];
  Object.keys(practice_frequency.weekly).forEach(key => {
    if (key < weekCutoffStr) {
      delete practice_frequency.weekly[key];
    }
  });

  const monthCutoff = cutoffDateStr.slice(0, 7);
  Object.keys(practice_frequency.monthly).forEach(key => {
    if (key < monthCutoff) {
      delete practice_frequency.monthly[key];
    }
  });

  return practice_frequency;
}

function calculatePracticeStreak(practice_frequency: PracticeFrequency): number {
  const today = new Date();
  let currentDate = new Date(today);
  let streak = 0;

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Check if there was practice on this day
    if (!practice_frequency.daily[dateStr]) {
      break;
    }

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);

    // Stop if we've gone back more than the number of days we have data for
    if (streak > Object.keys(practice_frequency.daily).length) {
      break;
    }
  }

  return streak;
}

export async function updateUserProgress(
  userId: string,
  tongueId: string,
  duration: number,
  clarityScore: number
): Promise<BadgeProgress> {
  try {
    // Round all numeric values to integers
    const roundedDuration = Math.round(duration);
    const roundedClarityScore = Math.round(clarityScore);
    
    // Update practice frequency first
    const updatedFrequency = await updatePracticeFrequency(userId);
    
    // Get current progress
    const { data: currentProgress, error: fetchError } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current progress:', fetchError);
      throw fetchError;
    }

    // Record this practice session in the practice_sessions table
    const { error: sessionError } = await supabaseAdmin
      .from('practice_sessions')
      .insert({
        user_id: userId,
        tongue_twister_id: tongueId,
        clarity_score: roundedClarityScore,
        duration: roundedDuration,
        created_at: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Error recording practice session:', sessionError);
      // Continue even if there's an error - don't block progress updates
    } else {
      console.log('Practice session recorded successfully');
    }

    // Get the best clarity score from all practice sessions
    const { data: bestScoreData, error: bestScoreError } = await supabaseAdmin
      .from('practice_sessions')
      .select('clarity_score')
      .eq('user_id', userId)
      .order('clarity_score', { ascending: false })
      .limit(1)
      .single();

    const bestClarityScore = bestScoreError ? roundedClarityScore : Math.max(bestScoreData?.clarity_score || 0, roundedClarityScore);

    // Calculate new values (ensure all are integers)
    const totalPracticeTime = Math.round((currentProgress?.total_practice_time || 0) + roundedDuration);
    const totalSessions = Math.round((currentProgress?.total_sessions || 0) + 1);
    const practiceStreak = Math.round(calculatePracticeStreak(updatedFrequency));
    
    // Calculate new average clarity score (ensure integer)
    const currentTotalScore = Math.round((currentProgress?.clarity_score || 0) * (totalSessions - 1));
    const newAverageClarityScore = Math.round((currentTotalScore + roundedClarityScore) / totalSessions);

    // Update user progress
    const { error: updateError } = await supabaseAdmin
      .from('user_progress')
      .update({
        practice_frequency: updatedFrequency,
        clarity_score: newAverageClarityScore,
        best_clarity_score: bestClarityScore, // Add best clarity score
        total_practice_time: totalPracticeTime,
        total_sessions: totalSessions,
        practice_streak: practiceStreak,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user progress:', updateError);
      throw updateError;
    }

    // Return badge progress data with camelCase fields
    const badgeProgress: BadgeProgress = {
      practiceStreak,
      totalPracticeTime,
      totalSessions,
      clarityScore: roundedClarityScore, // Use the current session score for badge checks
      bestClarityScore, // Add best clarity score
      practiceFrequency: updatedFrequency,
      userId,
      createdAt: currentProgress?.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return badgeProgress;
  } catch (error) {
    console.error('Error in updateUserProgress:', error);
    throw error;
  }
}
