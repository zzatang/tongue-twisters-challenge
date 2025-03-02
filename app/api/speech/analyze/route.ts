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
      const analysis = await analyzeSpeech(body.audioData, tongueTwister.text);
      
      // Format the response to match the expected format in the client
      return NextResponse.json({
        success: true,
        result: {
          text: tongueTwister.text,
          confidence: 0.9, // Placeholder value
          score: analysis.clarity,
          feedback: analysis.tips,
          wordTimings: [] // Placeholder for now
        }
      });
    } catch (analysisError) {
      console.error('Speech analysis processing error:', analysisError);
      return NextResponse.json(
        { success: false, error: 'Failed to process speech analysis' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
}
