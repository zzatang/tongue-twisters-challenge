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
  try {
    // First check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking user progress:', checkError);
      throw checkError;
    }

    if (existingUser) {
      // User exists, return their data
      return existingUser;
    }

    // User doesn't exist, create a new record
    const currentDate = new Date().toISOString();
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
          badges: [],
          created_at: currentDate,
          updated_at: currentDate
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user progress:', createError);
      
      // If there's a conflict, try to fetch the user again (they might have been created in another request)
      if (createError.code === '23505') { // PostgreSQL unique violation code
        const { data: retryData, error: retryError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (retryError) {
          console.error('Error fetching user progress after conflict:', retryError);
          throw retryError;
        }
        
        return retryData;
      }
      
      throw createError;
    }
    
    return newData;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    // Return a default user progress object to prevent UI errors
    return {
      id: 'temp-' + userId,
      user_id: userId,
      practice_frequency: {
        daily: {},
        weekly: {},
        monthly: {}
      },
      clarity_score: 0, // 0-100 scale
      total_practice_time: 0,
      total_sessions: 0,
      practice_streak: 0,
      badges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
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
    clarity_score: (progress.clarity_score + clarityScore) / 2, // Rolling average (both values are on the same scale 0-100)
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
