import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Badge, UserBadge, BadgeProgress } from '@/lib/supabase/types';

type ProgressMetric = keyof Omit<BadgeProgress, 'practice_frequency' | 'created_at' | 'updated_at' | 'user_id'>;

interface BadgeCriteria {
  type: ProgressMetric;
  value: number;
}

function checkBadgeCriteria(progress: BadgeProgress, criteria: BadgeCriteria): boolean {
  return progress[criteria.type] >= criteria.value;
}

export async function checkAndAwardBadges(userId: string, progress: BadgeProgress): Promise<void> {
  try {
    // Get all available badges
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select('*');

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return;
    }

    // Get user's existing badges
    const { data: userBadges, error: userBadgesError } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError);
      return;
    }

    const earnedBadgeIds = new Set((userBadges || []).map((ub: { badge_id: string }) => ub.badge_id));

    // Check each badge's criteria
    for (const badge of (badges || [])) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const criteria: BadgeCriteria = {
        type: badge.criteria_type as ProgressMetric,
        value: badge.criteria_value
      };

      // Check if user meets the badge criteria
      if (checkBadgeCriteria(progress, criteria)) {
        // Award the badge
        const { error: awardError } = await supabaseAdmin
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            earned_at: new Date().toISOString()
          });

        if (awardError) {
          console.error(`Error awarding badge ${badge.id}:`, awardError);
        }
      }
    }

    return;
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error);
    return;
  }
}

export async function getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
  const { data: userBadges, error } = await supabaseAdmin
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return (userBadges || []).map((ub: UserBadge & { badge: Badge }) => ub);
}

export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabaseAdmin
    .from('badges')
    .select('*')
    .order('criteria_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}
