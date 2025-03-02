import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/speech/analyze/route';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';
import type { TongueTwister } from '@/lib/supabase/types';
import type { SpeechAnalysisResult } from '@/lib/speech/types';

// Mock the Supabase API
jest.mock('@/lib/supabase/api', () => ({
  getTongueTwisterById: jest.fn(),
}));

// Mock the speech analysis function
jest.mock('@/lib/speech/pronunciation', () => ({
  analyzeSpeech: jest.fn(),
}));

// Mock console.error to prevent test output pollution
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Next.js Response and Request
jest.mock('next/server', () => ({
  __esModule: true,
  NextRequest: function() {
    return {};
  },
  NextResponse: {
    json: (data: any, options?: { status?: number }) => ({
      status: options?.status || 200,
      json: async () => data
    })
  }
}));

// Mock the auth wrapper
jest.mock('@/lib/auth/clerk', () => ({
  withAuth: (handler: Function) => handler
}));

describe('Speech Analysis API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully analyzes speech', async () => {
    // Mock request data
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        audioData: 'base64-encoded-audio-data',
        tongueTwisterId: '123',
      }),
    } as unknown as NextRequest;

    // Mock tongue twister data
    const mockTongueTwister: TongueTwister = {
      id: '123',
      text: 'She sells seashells by the seashore',
      difficulty: 'Intermediate',
      category: 'S sounds',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: 'A classic tongue twister focusing on S sounds',
      example_words: ['sells', 'seashells', 'seashore'],
      phonetic_focus: ['s']
    };
    (getTongueTwisterById as jest.Mock).mockResolvedValue(mockTongueTwister);

    // Mock analysis result
    const mockAnalysisResult: SpeechAnalysisResult = {
      clarity: 85,
      mispronounced: ['seashells', 'seashore'],
      tips: ['Focus on the "sh" sound in "seashells" and "seashore"'],
    };
    (analyzeSpeech as jest.Mock).mockResolvedValue(mockAnalysisResult);

    // Call the API
    const response = await POST(mockRequest);

    // Verify the response
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual(mockAnalysisResult);

    // Verify that the correct functions were called
    expect(getTongueTwisterById).toHaveBeenCalledWith('123');
    expect(analyzeSpeech).toHaveBeenCalledWith('base64-encoded-audio-data', mockTongueTwister.text);
  });

  it('returns 500 if request body is missing or invalid', async () => {
    // Mock request with missing body
    const mockRequest = {
      json: jest.fn().mockImplementation(() => {
        throw new Error('Invalid JSON');
      }),
    } as unknown as NextRequest;

    // Call the API
    const response = await POST(mockRequest);

    // Verify the response
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to analyze speech' });
  });

  it('returns 404 if tongue twister is not found', async () => {
    // Mock request data
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        audioData: 'base64-encoded-audio-data',
        tongueTwisterId: '999', // Non-existent ID
      }),
    } as unknown as NextRequest;

    // Mock tongue twister not found
    (getTongueTwisterById as jest.Mock).mockResolvedValue(null);

    // Call the API
    const response = await POST(mockRequest);

    // Verify the response
    expect(response.status).toBe(404);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Tongue twister not found' });
  });

  it('returns 500 if speech analysis fails', async () => {
    // Mock request data
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        audioData: 'base64-encoded-audio-data',
        tongueTwisterId: '123',
      }),
    } as unknown as NextRequest;

    // Mock tongue twister data
    const mockTongueTwister: TongueTwister = {
      id: '123',
      text: 'She sells seashells by the seashore',
      difficulty: 'Intermediate',
      category: 'S sounds',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: 'A classic tongue twister focusing on S sounds',
      example_words: ['sells', 'seashells', 'seashore'],
      phonetic_focus: ['s']
    };
    (getTongueTwisterById as jest.Mock).mockResolvedValue(mockTongueTwister);

    // Mock analysis error
    const mockError = new Error('Speech analysis failed');
    (analyzeSpeech as jest.Mock).mockRejectedValue(mockError);

    // Call the API
    const response = await POST(mockRequest);

    // Verify the response
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to analyze speech' });
  });
});
