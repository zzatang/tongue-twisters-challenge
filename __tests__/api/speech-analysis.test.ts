import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/speech/analyze/route';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';
import 'whatwg-fetch';

// Mock the auth wrapper
jest.mock('@/lib/auth/clerk', () => ({
  withAuth: (handler: Function) => handler,
}));

// Mock dependencies
jest.mock('@/lib/supabase/api');
jest.mock('@/lib/speech/pronunciation');

describe('Speech Analysis API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully analyzes speech', async () => {
    const mockRequest = new Request('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueTwisterId: '123',
      }),
    }) as unknown as NextRequest;

    (getTongueTwisterById as jest.Mock).mockResolvedValue({
      id: '123',
      text: 'She sells seashells',
    });

    (analyzeSpeech as jest.Mock).mockResolvedValue({
      clarity: 85,
      mispronounced: ['sells'],
      tips: ['Focus on the "s" sound'],
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      clarity: 85,
      mispronounced: ['sells'],
      tips: ['Focus on the "s" sound'],
    });
  });

  it('handles missing request body', async () => {
    const mockRequest = new Request('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    }) as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Missing required fields',
    });
  });

  it('handles non-existent tongue twister', async () => {
    const mockRequest = new Request('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueTwisterId: '123',
      }),
    }) as unknown as NextRequest;

    (getTongueTwisterById as jest.Mock).mockRejectedValue(new Error('Tongue twister not found'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Tongue twister not found',
    });
  });

  it('handles speech analysis error', async () => {
    const mockRequest = new Request('http://localhost:3000/api/speech/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audioData: 'base64-audio-data',
        tongueTwisterId: '123',
      }),
    }) as unknown as NextRequest;

    (getTongueTwisterById as jest.Mock).mockResolvedValue({
      id: '123',
      text: 'She sells seashells',
    });

    (analyzeSpeech as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to analyze speech',
    });
  });
});
