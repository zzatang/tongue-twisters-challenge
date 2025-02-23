import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { analyzeSpeech } from '@/lib/speech/google-speech';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { calculatePronunciationScore } from '@/lib/speech/pronunciation';
import { updateUserProgress } from '@/lib/services/progress-service';

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();
    const { audioData, tongueTwisterId } = body;

    if (!audioData || !tongueTwisterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the tongue twister text for comparison
    const tongueTwister = await getTongueTwisterById(tongueTwisterId);
    if (!tongueTwister) {
      return NextResponse.json(
        { error: 'Tongue twister not found' },
        { status: 404 }
      );
    }

    // Convert base64 audio data to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Analyze the speech using Google Speech-to-Text
    const analysisResult = await analyzeSpeech(audioBuffer);

    // Calculate pronunciation score and feedback
    const { score, feedback } = calculatePronunciationScore(
      analysisResult.text,
      tongueTwister.text
    );

    // Update user progress with the practice results
    await updateUserProgress({
      tongueId: tongueTwisterId,
      duration: analysisResult.duration,
      clarityScore: score,
    });

    return NextResponse.json({
      text: analysisResult.text,
      confidence: analysisResult.confidence,
      duration: analysisResult.duration,
      wordTimings: analysisResult.wordTimings,
      score,
      feedback,
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
});
