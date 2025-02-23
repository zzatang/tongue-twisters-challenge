import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SpeechRecorder } from '@/components/practice/speech-recorder';
import { TongueTwister } from '@/lib/supabase/types';

// Mock useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  state: 'inactive' | 'recording' = 'inactive';

  constructor(public stream: MediaStream) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test-audio'], { type: 'audio/webm' }) });
    }
  }

  static isTypeSupported(type: string): boolean {
    return type === 'audio/webm';
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn().mockImplementation(() => {
  return Promise.resolve(new MediaStream());
});

// Mock navigator.mediaDevices
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock MediaRecorder globally
global.MediaRecorder = MockMediaRecorder as any;

describe('SpeechRecorder', () => {
  const mockTongueTwister: TongueTwister = {
    id: '1',
    text: 'Peter Piper picked a peck of pickled peppers',
    difficulty: 'Easy',
    category: 'P sounds',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders record button', () => {
    const onRecordingComplete = jest.fn();
    const { getByRole } = render(
      <SpeechRecorder
        onRecordingComplete={onRecordingComplete}
        tongueTwister={mockTongueTwister}
      />
    );

    expect(getByRole('button', { name: /record/i })).toBeInTheDocument();
  });

  it('handles recording flow', async () => {
    const onRecordingComplete = jest.fn();
    const { getByRole } = render(
      <SpeechRecorder
        onRecordingComplete={onRecordingComplete}
        tongueTwister={mockTongueTwister}
      />
    );

    // Start recording
    const recordButton = getByRole('button', { name: /record/i });
    fireEvent.click(recordButton);

    // Should show stop button
    const stopButton = getByRole('button', { name: /stop/i });
    expect(stopButton).toBeInTheDocument();

    // Stop recording
    fireEvent.click(stopButton);

    // Wait for recording to be processed
    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalled();
    });
  });

  it('handles microphone access error', async () => {
    // Mock getUserMedia to reject
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    const onRecordingComplete = jest.fn();
    const { getByRole } = render(
      <SpeechRecorder
        onRecordingComplete={onRecordingComplete}
        tongueTwister={mockTongueTwister}
      />
    );

    // Try to start recording
    const recordButton = getByRole('button', { name: /record/i });
    fireEvent.click(recordButton);

    // Should show error toast
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/microphone access/i);
    });
  });
});
