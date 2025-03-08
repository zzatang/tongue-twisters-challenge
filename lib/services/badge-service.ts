import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Badge, UserBadge, BadgeProgress } from '@/lib/supabase/types';

type ProgressMetric = keyof Pick<BadgeProgress, 'practiceStreak' | 'totalPracticeTime' | 'totalSessions' | 'clarityScore'>;

interface BadgeCriteria {
  type: ProgressMetric | string;
  value: number;
}

function checkBadgeCriteria(progress: BadgeProgress, criteria: BadgeCriteria): boolean {
  // Map database criteria types to BadgeProgress property names
  const criteriaTypeMap: Record<string, keyof BadgeProgress> = {
    'clarity': 'clarityScore',
    'streak': 'practiceStreak',
    'sessions': 'totalSessions',
    'time': 'totalPracticeTime',
    // Add other mappings as needed
  };

  // Get the correct property name from the map or use the original type
  const propertyName = criteriaTypeMap[criteria.type] || criteria.type as keyof BadgeProgress;
  const value = progress[propertyName];
  
  console.log(`Checking badge criteria: ${criteria.type} (${propertyName}) >= ${criteria.value}, actual value: ${value}`);
  return typeof value === 'number' && value >= criteria.value;
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
        type: badge.criteria_type,
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
        } else {
          console.log(`Awarded badge ${badge.name} to user ${userId}`);
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
