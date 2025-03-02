import { NextRequest, NextResponse } from 'next/server';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.audioData || !body.tongueTwisterId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
}
