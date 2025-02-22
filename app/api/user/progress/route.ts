import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { getUserProgress } from '@/lib/supabase/api';

export const GET = withAuth(async (userId: string, req: NextRequest) => {
  try {
    const progress = await getUserProgress(userId);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
});
