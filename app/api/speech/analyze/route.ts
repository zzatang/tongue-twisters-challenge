import { NextRequest, NextResponse } from 'next/server';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';
import { updateUserProgress } from '@/lib/services/progress-service';
import { checkAndAwardBadges } from '@/lib/services/badge-service';
import { withAuth } from '@/lib/auth/clerk';

// Export the POST handler wrapped with auth
export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.audioData || !body.tongueTwisterId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const tongueTwister = await getTongueTwisterById(body.tongueTwisterId);
      if (!tongueTwister) {
        return NextResponse.json(
          { success: false, error: 'Tongue twister not found' },
          { status: 404 }
        );
      }

      // Call the speech analysis function
      try {
        console.log('Analyzing speech for tongue twister:', tongueTwister.text);
        
        // Analyze the speech using Google Speech-to-Text API
        const analysis = await analyzeSpeech(body.audioData, tongueTwister.text);
        
        console.log('Speech analysis result:', {
          clarity: analysis.clarity,
          mispronounced: analysis.mispronounced,
          tips: analysis.tips
        });
        
        // Check if we have a "no speech detected" case
        const isNoSpeechDetected = analysis.clarity === 0 && 
          analysis.tips.some(tip => tip.includes("No speech detected"));
        
        if (isNoSpeechDetected) {
          return NextResponse.json({
            success: false,
            error: 'No speech detected',
            result: {
              text: '',
              confidence: 0,
              score: 0,
              feedback: analysis.tips,
              wordTimings: []
            }
          });
        }
        
        // Calculate approximate duration (in minutes) - assuming 30 seconds for a typical practice
        // In a real implementation, the client would send the actual duration
        const practiceDuration = body.duration || 0.5; // Default to 30 seconds (0.5 minutes)
        
        // Update user progress metrics (only for successful attempts)
        try {
          const progressData = await updateUserProgress(
            userId,
            body.tongueTwisterId,
            practiceDuration,
            analysis.clarity
          );
          console.log('User progress updated successfully');
          
          // Check and award badges based on updated progress
          try {
            await checkAndAwardBadges(userId, progressData);
            console.log('Badge check completed successfully');
          } catch (badgeError) {
            // Log the error but don't fail the request
            console.error('Failed to check and award badges:', badgeError);
          }
        } catch (progressError) {
          // Log the error but don't fail the request
          console.error('Failed to update user progress:', progressError);
        }
        
        // Format the response to match the expected format in the client
        return NextResponse.json({
          success: true,
          result: {
            text: tongueTwister.text,
            confidence: analysis.clarity / 100, // Convert to 0-1 scale
            score: analysis.clarity,
            feedback: analysis.tips,
            wordTimings: [] // We'll implement this later if needed
          }
        });
      } catch (analysisError) {
        console.error('Speech analysis processing error:', analysisError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to process speech analysis',
            details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } catch (tongueTwisterError) {
      // Handle tongue twister retrieval errors
      console.error('Tongue twister retrieval error:', tongueTwisterError);
      if (tongueTwisterError instanceof Error && 
          tongueTwisterError.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Tongue twister not found' },
          { status: 404 }
        );
      }
      throw tongueTwisterError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
