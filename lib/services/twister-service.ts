import { supabaseAdmin } from '@/lib/supabase/admin';
import type { TongueTwister } from '@/lib/supabase/types';

/**
 * Fetches all tongue twisters from the database
 * @returns Array of tongue twisters
 */
export async function getTongueTwisters(): Promise<TongueTwister[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tongue_twisters')
      .select('*')
      .order('difficulty', { ascending: true })
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching tongue twisters:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTongueTwisters:', error);
    return [];
  }
}

/**
 * Fetches a specific tongue twister by ID
 * @param id The ID of the tongue twister to fetch
 * @returns The tongue twister object or null if not found
 */
export async function getTongueTwisterById(id: string): Promise<TongueTwister | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tongue_twisters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching tongue twister with ID ${id}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getTongueTwisterById for ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetches tongue twisters filtered by difficulty level
 * @param difficulty The difficulty level to filter by
 * @returns Array of tongue twisters matching the difficulty
 */
export async function getTongueTwistersByDifficulty(difficulty: 'Easy' | 'Intermediate' | 'Advanced'): Promise<TongueTwister[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tongue_twisters')
      .select('*')
      .eq('difficulty', difficulty)
      .order('category', { ascending: true });

    if (error) {
      console.error(`Error fetching tongue twisters with difficulty ${difficulty}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getTongueTwistersByDifficulty for difficulty ${difficulty}:`, error);
    return [];
  }
}

/**
 * Fetches tongue twisters filtered by category
 * @param category The category to filter by
 * @returns Array of tongue twisters matching the category
 */
export async function getTongueTwistersByCategory(category: string): Promise<TongueTwister[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tongue_twisters')
      .select('*')
      .eq('category', category)
      .order('difficulty', { ascending: true });

    if (error) {
      console.error(`Error fetching tongue twisters with category ${category}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getTongueTwistersByCategory for category ${category}:`, error);
    return [];
  }
}
