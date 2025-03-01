import { supabase } from './client';
import type { TongueTwister, UserProgress, Badge } from './types';
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
  // First check if the user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('user_progress')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingUser) {
    // User doesn't exist, create a new record
    const { data: newData, error: createError } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          practice_frequency: {
            daily: {},
            weekly: {},
            monthly: {}
          },
          clarity_score: 0,
          total_practice_time: 0,
          total_sessions: 0,
          practice_streak: 0,
          badges: []
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user progress:', createError);
      throw createError;
    }
    return newData;
  }

  // User exists, get their data
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user progress:', error);
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

/**
 * Get all available badges from the database
 * @returns Array of Badge objects
 */
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('criteria_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

/**
 * Get badges earned by a specific user
 * @param userId - The user's ID
 * @returns Array of badge IDs earned by the user
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return (data || []).map(ub => ub.badge_id);
}
