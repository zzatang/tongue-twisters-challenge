import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpeechRecorder } from '@/components/practice/speech-recorder';
import type { TongueTwister } from '@/lib/supabase/types';
import { useToast } from '@/components/ui/use-toast';

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock MediaRecorder
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockMediaRecorder = {
  start: mockStart,
  stop: mockStop,
  state: 'inactive',
  addEventListener: jest.fn(),
};

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
window.navigator.mediaDevices = {
  getUserMedia: mockGetUserMedia,
} as any;

describe('SpeechRecorder', () => {
  const mockToast = jest.fn();
  const mockOnRecordingComplete = jest.fn();
  const mockTongueTwister: TongueTwister = {
    id: '1',
    text: 'Peter Piper picked a peck of pickled peppers',
    difficulty: 1,
    category: 'P sounds',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'A classic tongue twister focusing on P sounds',
    example_words: ['Peter', 'Piper', 'picked', 'peppers'],
    phonetic_focus: ['p']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    mockGetUserMedia.mockResolvedValue('mock-stream');
    (window as any).MediaRecorder = jest.fn(() => mockMediaRecorder);
  });

  it('renders correctly', () => {
    render(
      <SpeechRecorder
        tongueTwister={mockTongueTwister}
        onRecordingComplete={mockOnRecordingComplete}
      />
    );

    expect(screen.getByText(mockTongueTwister.text)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('handles recording flow', async () => {
    render(
      <SpeechRecorder
        tongueTwister={mockTongueTwister}
        onRecordingComplete={mockOnRecordingComplete}
      />
    );

    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(mockStart).toHaveBeenCalled();
    });

    // Update button state
    const stopButton = screen.getByRole('button', { name: /recording/i });
    expect(stopButton).toBeInTheDocument();

    // Stop recording
    fireEvent.click(stopButton);
    expect(mockStop).toHaveBeenCalled();
  });

  it('handles microphone access error', async () => {
    const error = new Error('Permission denied');
    mockGetUserMedia.mockRejectedValue(error);

    render(
      <SpeechRecorder
        tongueTwister={mockTongueTwister}
        onRecordingComplete={mockOnRecordingComplete}
      />
    );

    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to access microphone. Please ensure you have granted microphone permissions.',
        variant: 'destructive',
      });
    });
  });
});
