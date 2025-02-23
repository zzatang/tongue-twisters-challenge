import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk';
import { analyzeSpeech, calculatePronunciationScore } from '@/lib/speech/google-speech';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { checkAndAwardBadges, BadgeProgress } from '@/lib/services/badge-service';
import { getUserProgress } from '@/lib/supabase/api';

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

    console.log('Audio data info:', {
      blobType: audioBlob.type,
      blobSize: audioBlob.size,
      bufferLength: buffer.length
    });

    // Analyze speech
    const analysisResult = await analyzeSpeech(buffer, tongueTwister.text);

    // Calculate pronunciation score
    const { score, feedback } = calculatePronunciationScore(
      analysisResult,
      tongueTwister.text
    );

    const userProgress = await getUserProgress(userId);
    
    // Prepare the response object
    const resultObject = {
      text: analysisResult.text,
      confidence: analysisResult.confidence,
      score,
      feedback,
      wordTimings: analysisResult.wordTimings,
    };

    if (userProgress) {
      const badgeProgress: BadgeProgress = {
        streak: userProgress.practice_streak || 0,
        clarity: Math.round(analysisResult.confidence * 100),
        sessions: userProgress.total_sessions || 0,
        speed: Math.round(analysisResult.duration), 
        accuracy: Math.round(score * 100),
        time: userProgress.total_practice_time || 0
      };

      const newBadges = await checkAndAwardBadges(userId, badgeProgress);
      
      if (newBadges.length > 0) {
        return NextResponse.json({
          success: true,
          result: resultObject,
          newBadges
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: resultObject
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
});
