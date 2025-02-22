import { supabase } from './client';
import type { TongueTwister, UserProgress } from './types';
import { Database } from './database.types';

export async function getTongueTwisters(): Promise<TongueTwister[]> {
  const { data, error } = await supabase
    .from('tongue_twisters')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getTongueTwisterById(id: string): Promise<TongueTwister> {
  const { data, error } = await supabase
    .from('tongue_twisters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Tongue twister not found');
  return data;
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!data) {
    // Create new progress record if none exists
    const { data: newData, error: createError } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          practice_frequency: { daily: 0, weekly: 0, monthly: 0 },
          clarity_score: 0,
          total_practice_time: 0,
          badges: []
        }
      ])
      .select()
      .single();

    if (createError) throw createError;
    return newData;
  }

  return data;
}

export async function updateUserProgress(
  userId: string,
  updates: Partial<Database['public']['Tables']['user_progress']['Update']>
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .update(updates)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function recordPracticeSession(
  userId: string,
  tongueTwisterId: string,
  clarityScore: number,
  duration: number
): Promise<void> {
  const { error } = await supabase
    .from('practice_sessions')
    .insert([
      {
        user_id: userId,
        tongue_twister_id: tongueTwisterId,
        clarity_score: clarityScore,
        duration: duration
      }
    ]);

  if (error) throw error;

  // Update user progress
  const { data: currentProgress } = await supabase
    .from('user_progress')
    .select('total_practice_time, clarity_score')
    .eq('user_id', userId)
    .single();

  if (currentProgress) {
    const totalSessions = await supabase
      .from('practice_sessions')
      .select('clarity_score', { count: 'exact' })
      .eq('user_id', userId);

    const sessionCount = totalSessions.count || 1;
    const newAverageClarity = (
      (currentProgress.clarity_score * (sessionCount - 1) + clarityScore) /
      sessionCount
    ).toFixed(2);

    await updateUserProgress(userId, {
      total_practice_time: currentProgress.total_practice_time + duration,
      clarity_score: parseFloat(newAverageClarity)
    });
  }
}
