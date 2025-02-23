import { supabase } from '@/lib/supabase/client';
import { Badge, UserBadge } from '@/lib/supabase/types';

export interface BadgeProgress {
  streak: number;
  clarity: number;
  sessions: number;
  speed: number;
  accuracy: number;
  time: number;
}

export async function checkAndAwardBadges(userId: string, progress: BadgeProgress): Promise<Badge[]> {
  // Get all badges and user's earned badges
  const { data: badges } = await supabase.from('badges').select('*');
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (!badges) return [];

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
  const newlyEarnedBadges: Badge[] = [];

  // Check each badge
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const hasEarned = checkBadgeCriteria(badge, progress);
    if (hasEarned) {
      await awardBadge(userId, badge.id);
      newlyEarnedBadges.push(badge);
    }
  }

  return newlyEarnedBadges;
}

function checkBadgeCriteria(badge: Badge, progress: BadgeProgress): boolean {
  const value = progress[badge.criteria_type];
  return value >= badge.criteria_value;
}

async function awardBadge(userId: string, badgeId: string): Promise<void> {
  await supabase.from('user_badges').insert({
    user_id: userId,
    badge_id: badgeId
  });
}

export async function getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
  const { data } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);
  
  return data || [];
}

export async function getAllBadges(): Promise<Badge[]> {
  const { data } = await supabase.from('badges').select('*');
  return data || [];
}
