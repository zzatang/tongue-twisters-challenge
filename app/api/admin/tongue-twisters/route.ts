import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAuth } from '@clerk/nextjs/server';

type DifficultyLevel = 'Easy' | 'Intermediate' | 'Advanced';

interface TongueTwisterRequest {
  text: string;
  difficulty: DifficultyLevel;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const data: TongueTwisterRequest = await request.json();

    // Validate required fields
    if (!data.text || !data.difficulty || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the new tongue twister
    const { data: newTwister, error } = await supabaseAdmin
      .from('tongue_twisters')
      .insert([
        {
          text: data.text,
          difficulty: data.difficulty,
          category: data.category
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting tongue twister:', error);
      return NextResponse.json(
        { error: 'Failed to add tongue twister' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Tongue twister added successfully', data: newTwister },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in tongue twister API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
