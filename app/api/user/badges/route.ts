import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { getUserBadges } from '@/lib/services/badge-service';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const badges = await getUserBadges(userId);
    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
});
