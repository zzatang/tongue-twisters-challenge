import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/speech/analyze/route';
import { analyzeSpeech } from '@/lib/speech/google-speech';
import { getTongueTwisterById } from '@/lib/supabase/api';
import 'whatwg-fetch';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((init) => {
      const formData = new FormData();
      return {
        formData: jest.fn().mockResolvedValue(formData),
        _formData: formData,
      };
    }),
    NextResponse: {
      json: (data, options = {}) => ({
        json: async () => data,
        ...options,
      }),
    },
  };
});

// Mock the dependencies
jest.mock('@/lib/speech/google-speech', () => ({
  analyzeSpeech: jest.fn(),
  calculatePronunciationScore: jest.fn().mockReturnValue({
    score: 85,
    feedback: ['Speak a bit more slowly and distinctly'],
  }),
}));

jest.mock('@/lib/supabase/api', () => ({
  getTongueTwisterById: jest.fn(),
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

// Mock FormData.prototype.get to handle our mock blob
const originalGet = FormData.prototype.get;
FormData.prototype.get = function(key: string) {
  const value = originalGet.call(this, key);
  if (key === 'audio' && value) {
    return {
      arrayBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer),
      type: 'audio/wav',
      size: 4,
    };
  }
  return value;
};

describe('Speech Analysis API', () => {
  const mockTongueTwister = {
    id: 'test-id',
    text: 'Peter Piper picked a peck of pickled peppers',
    difficulty: 'intermediate',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTongueTwisterById as jest.Mock).mockResolvedValue(mockTongueTwister);
    (analyzeSpeech as jest.Mock).mockResolvedValue({
      text: 'Peter Piper picked a peck of pickled peppers',
      confidence: 0.85,
      wordTimings: [
        {
          word: 'Peter',
          startTime: 0,
          endTime: 0.5,
          confidence: 0.9,
        },
      ],
    });
  });

  it('should analyze speech and return results', async () => {
    // Create mock request
    const req = new NextRequest({});
    req._formData.append('audio', new Blob(['test audio'], { type: 'audio/wav' }));
    req._formData.append('tongueTwisterId', 'test-id');
    req.formData.mockResolvedValue(req._formData);

    // Call the API endpoint
    const response = await POST(req);
    const data = await response.json();

    // Verify the response
    expect(data).toEqual({
      success: true,
      result: {
        text: 'Peter Piper picked a peck of pickled peppers',
        confidence: 0.85,
        score: 85,
        feedback: ['Speak a bit more slowly and distinctly'],
        wordTimings: [
          {
            word: 'Peter',
            startTime: 0,
            endTime: 0.5,
            confidence: 0.9,
          },
        ],
      },
    });

    // Verify that dependencies were called correctly
    expect(getTongueTwisterById).toHaveBeenCalledWith('test-id');
    expect(analyzeSpeech).toHaveBeenCalled();
  });

  it('should handle missing audio data', async () => {
    const req = new NextRequest({});
    req._formData.append('tongueTwisterId', 'test-id');
    req.formData.mockResolvedValue(req._formData);

    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual({
      error: 'Missing audio data or tongue twister ID',
    });
  });

  it('should handle tongue twister not found', async () => {
    (getTongueTwisterById as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest({});
    req._formData.append('audio', new Blob(['test audio'], { type: 'audio/wav' }));
    req._formData.append('tongueTwisterId', 'non-existent-id');
    req.formData.mockResolvedValue(req._formData);

    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual({
      error: 'Tongue twister not found',
    });
  });
});
