import { supabase } from '@/lib/supabase/client';
import { checkAndAwardBadges } from './badge-service';

interface ProgressUpdate {
  tongueId: string;
  duration: number;
  clarityScore: number;
}

/**
 * Update user progress after completing a practice session.
 * This includes:
 * - Updating practice streak
 * - Adding to total practice time
 * - Updating average clarity score
 * - Incrementing total sessions
 * - Checking and awarding badges
 */
export async function updateUserProgress({
  tongueId,
  duration,
  clarityScore,
}: ProgressUpdate): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const today = new Date().toISOString().split('T')[0];

  // Get current progress
  const { data: currentProgress, error: fetchError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error('Failed to fetch user progress');
  }

  // Calculate new values
  const lastPracticeDate = currentProgress?.last_practice_date;
  const isConsecutiveDay = lastPracticeDate 
    ? new Date(today).getTime() - new Date(lastPracticeDate).getTime() <= 86400000 // 24 hours
    : false;

  const newProgress = {
    user_id: userId,
    practice_streak: isConsecutiveDay 
      ? (currentProgress?.practice_streak || 0) + 1 
      : 1,
    total_practice_time: (currentProgress?.total_practice_time || 0) + Math.round(duration / 60), // Convert seconds to minutes
    total_sessions: (currentProgress?.total_sessions || 0) + 1,
    average_clarity_score: currentProgress
      ? ((currentProgress.average_clarity_score * currentProgress.total_sessions) + clarityScore) / (currentProgress.total_sessions + 1)
      : clarityScore,
    last_practice_date: today,
  };

  // Update or insert progress
  const { error: upsertError } = await supabase
    .from('user_progress')
    .upsert(newProgress);

  if (upsertError) {
    throw new Error('Failed to update user progress');
  }

  // Check and award badges based on new progress
  await checkAndAwardBadges(userId, {
    streak: newProgress.practice_streak,
    clarity: clarityScore,
    sessions: newProgress.total_sessions,
    speed: Math.round(duration),
    accuracy: clarityScore,
    time: newProgress.total_practice_time,
  });
}
