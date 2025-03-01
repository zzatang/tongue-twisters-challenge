import { NextRequest, NextResponse } from 'next/server';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.audioData || !body.tongueTwisterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tongueTwister = await getTongueTwisterById(body.tongueTwisterId);
    if (!tongueTwister) {
      return NextResponse.json(
        { error: 'Tongue twister not found' },
        { status: 404 }
      );
    }

    const analysis = await analyzeSpeech(body.audioData, tongueTwister.text);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
}
