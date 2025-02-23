import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/speech/analyze/route';
import { analyzeSpeech, SpeechAnalysisResult } from '@/lib/speech/google-speech';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { withAuth } from '@/lib/auth/clerk';
import { TongueTwister } from '@/lib/supabase/types';
import 'whatwg-fetch';

// Mock the auth wrapper
jest.mock('@/lib/auth/clerk', () => ({
  withAuth: (handler: Function) => handler,
}));

// Mock dependencies
jest.mock('@/lib/speech/google-speech');
jest.mock('@/lib/supabase/api');

describe('Speech Analysis API', () => {
  const mockUserId = 'test-user-id';
  const mockTongueTwister: TongueTwister = {
    id: 'test-id',
    text: 'She sells seashells',
    difficulty: 'Easy',
    category: 'S sounds',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockAnalysisResult: SpeechAnalysisResult = {
    text: 'She sells seashells',
    confidence: 0.9,
    duration: 2.5,
    wordTimings: [
      {
        word: 'she',
        startTime: 0,
        endTime: 0.5,
        confidence: 0.9,
      },
      {
        word: 'sells',
        startTime: 0.6,
        endTime: 1.2,
        confidence: 0.95,
      },
      {
        word: 'seashells',
        startTime: 1.3,
        endTime: 2.5,
        confidence: 0.85,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTongueTwisterById as jest.MockedFunction<typeof getTongueTwisterById>).mockResolvedValue(mockTongueTwister);
    (analyzeSpeech as jest.MockedFunction<typeof analyzeSpeech>).mockResolvedValue(mockAnalysisResult);
  });

  it('successfully analyzes speech', async () => {
    const request = new NextRequest('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueId: mockTongueTwister.id,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual(expect.objectContaining({
      text: expect.any(String),
      confidence: expect.any(Number),
      duration: expect.any(Number),
      score: expect.any(Number),
      feedback: expect.any(Array),
    }));
  });

  it('handles missing request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('handles non-existent tongue twister', async () => {
    (getTongueTwisterById as jest.MockedFunction<typeof getTongueTwisterById>).mockRejectedValue(new Error('Tongue twister not found'));

    const request = new NextRequest('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueId: 'non-existent-id',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tongue twister not found');
  });

  it('handles speech analysis error', async () => {
    (analyzeSpeech as jest.MockedFunction<typeof analyzeSpeech>).mockRejectedValue(new Error('Analysis failed'));

    const request = new NextRequest('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueId: mockTongueTwister.id,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to analyze speech');
  });
});
