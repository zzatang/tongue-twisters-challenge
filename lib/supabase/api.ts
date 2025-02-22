import { supabase } from './client';
import type { TongueTwister, UserProgress } from './types';
import type { Database } from './database.types';

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

  if (error) {
    if (error.code === 'PGRST116') {
      // No record found, create a new one
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
    throw error;
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
  const { data: progress, error: fetchError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  if (!progress) {
    throw new Error('User progress not found');
  }

  // Update practice frequency
  const now = new Date();
  const practiceFrequency = progress.practice_frequency as {
    daily: number;
    weekly: number;
    monthly: number;
  };

  // Update metrics
  const updatedProgress = {
    practice_frequency: {
      ...practiceFrequency,
      daily: practiceFrequency.daily + 1,
      weekly: practiceFrequency.weekly + 1,
      monthly: practiceFrequency.monthly + 1,
    },
    clarity_score: (progress.clarity_score + clarityScore) / 2, // Rolling average
    total_practice_time: progress.total_practice_time + duration,
  };

  const { error: updateError } = await supabase
    .from('user_progress')
    .update(updatedProgress)
    .eq('user_id', userId);

  if (updateError) throw updateError;
}
