import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpeechRecorder } from '@/components/practice/speech-recorder';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Mic: () => <div data-testid="mic-icon" />,
  Square: () => <div data-testid="square-icon" />,
}));

// Mock the MediaRecorder API
class MockMediaRecorder {
  static isTypeSupported = jest.fn().mockReturnValue(true);
  ondataavailable: ((e: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  state: RecordingState = 'inactive';

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    // Simulate data being available
    if (this.ondataavailable) {
      const blob = new Blob(['test-audio'], { type: 'audio/webm' });
      const event = { data: blob } as BlobEvent;
      this.ondataavailable(event);
    }
    // Call onstop handler
    if (this.onstop) {
      this.onstop();
    }
  }
}

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{
      stop: jest.fn()
    }];
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn().mockResolvedValue(new MockMediaStream());
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: { getUserMedia: mockGetUserMedia },
});

// Mock MediaRecorder globally
(global as any).MediaRecorder = MockMediaRecorder;

describe('SpeechRecorder Component', () => {
  const mockOnRecordingComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders start recording button initially', () => {
    render(<SpeechRecorder onRecordingComplete={mockOnRecordingComplete} />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('shows recording state when started', async () => {
    render(<SpeechRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('handles recording completion', async () => {
    await act(async () => {
      render(<SpeechRecorder onRecordingComplete={mockOnRecordingComplete} />);
    });

    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // After starting recording, the stop button should be visible
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // Wait for any async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnRecordingComplete).toHaveBeenCalled();
  });
});
