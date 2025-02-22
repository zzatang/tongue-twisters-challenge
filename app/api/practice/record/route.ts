import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { recordPracticeSession } from '@/lib/supabase/api';

export const POST = withAuth(async (userId: string, req: NextRequest) => {
  try {
    const body = await req.json();
    const { tongueTwisterId, clarityScore, duration } = body;

    if (!tongueTwisterId || clarityScore === undefined || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await recordPracticeSession(
      userId,
      tongueTwisterId,
      clarityScore,
      duration
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording practice session:', error);
    return NextResponse.json(
      { error: 'Failed to record practice session' },
      { status: 500 }
    );
  }
});
