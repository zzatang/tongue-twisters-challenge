import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/speech/analyze/route';
import { getTongueTwisterById } from '@/lib/supabase/api';
import { analyzeSpeech } from '@/lib/speech/pronunciation';

// Mock dependencies
jest.mock('@/lib/supabase/api', () => ({
  getTongueTwisterById: jest.fn()
}));

jest.mock('@/lib/speech/pronunciation', () => ({
  analyzeSpeech: jest.fn()
}));

// Mock console.error to prevent test output pollution
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: function() {
      return {};
    },
    NextResponse: {
      json: (data, options) => ({
        status: options?.status || 200,
        json: async () => data
      })
    }
  };
});

// Mock the auth wrapper
jest.mock('@/lib/auth/clerk', () => ({
  withAuth: (handler) => handler
}));

describe('Speech Analysis API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully analyzes speech', async () => {
    // Setup mocks
    const mockRequest = {
      json: async () => ({
        audioData: 'base64-audio-data',
        tongueTwisterId: '123'
      })
    };

    (getTongueTwisterById as jest.Mock).mockResolvedValue({
      id: '123',
      text: 'She sells seashells'
    });

    (analyzeSpeech as jest.Mock).mockResolvedValue({
      clarity: 85,
      mispronounced: ['sells'],
      tips: ['Focus on the "s" sound']
    });

    // Call the API route handler
    const response = await POST(mockRequest as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({
      clarity: 85,
      mispronounced: ['sells'],
      tips: ['Focus on the "s" sound']
    });
    expect(getTongueTwisterById).toHaveBeenCalledWith('123');
    expect(analyzeSpeech).toHaveBeenCalledWith('base64-audio-data', 'She sells seashells');
  });

  it('handles missing request body', async () => {
    // Setup mocks
    const mockRequest = {
      json: async () => ({})
    };

    // Call the API route handler
    const response = await POST(mockRequest as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Missing required fields'
    });
  });

  it('handles tongue twister not found', async () => {
    // Setup mocks
    const mockRequest = {
      json: async () => ({
        audioData: 'base64-audio-data',
        tongueTwisterId: 'non-existent'
      })
    };

    (getTongueTwisterById as jest.Mock).mockResolvedValue(null);

    // Call the API route handler
    const response = await POST(mockRequest as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Tongue twister not found'
    });
  });

  it('handles speech analysis error', async () => {
    // Setup mocks
    const mockRequest = {
      json: async () => ({
        audioData: 'base64-audio-data',
        tongueTwisterId: '123'
      })
    };

    (getTongueTwisterById as jest.Mock).mockResolvedValue({
      id: '123',
      text: 'She sells seashells'
    });

    (analyzeSpeech as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

    // Call the API route handler
    const response = await POST(mockRequest as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to analyze speech'
    });
  });
});
