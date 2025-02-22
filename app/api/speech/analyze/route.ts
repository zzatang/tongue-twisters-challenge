import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { analyzeSpeech, calculatePronunciationScore } from '@/lib/speech/google-speech';
import { getTongueTwisterById } from '@/lib/supabase/api';

export const POST = withAuth(async (userId: string, req: NextRequest) => {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;
    const tongueTwisterId = formData.get('tongueTwisterId') as string;

    if (!audioBlob || !tongueTwisterId) {
      return NextResponse.json(
        { error: 'Missing audio data or tongue twister ID' },
        { status: 400 }
      );
    }

    // Get the tongue twister text
    const tongueTwister = await getTongueTwisterById(tongueTwisterId);
    if (!tongueTwister) {
      return NextResponse.json(
        { error: 'Tongue twister not found' },
        { status: 404 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Analyze speech
    const analysisResult = await analyzeSpeech(buffer, tongueTwister.text);

    // Calculate pronunciation score
    const { score, feedback } = calculatePronunciationScore(
      analysisResult,
      tongueTwister.text
    );

    return NextResponse.json({
      success: true,
      result: {
        text: analysisResult.text,
        confidence: analysisResult.confidence,
        score,
        feedback,
        wordTimings: analysisResult.wordTimings,
      },
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
});
