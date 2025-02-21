import { render, screen } from '@testing-library/react';
import { Feedback } from '@/components/practice/feedback';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
}));

describe('Feedback Component', () => {
  const mockFeedback = {
    clarityScore: 85,
    mispronunciations: [
      {
        word: 'Peter',
        expected: 'piːtər',
        actual: 'pɪtər',
      },
    ],
    tips: ['Focus on the long i sound'],
  };

  it('renders loading state correctly', () => {
    render(<Feedback isLoading={true} feedback={null} />);
    expect(screen.getByText('Analyzing your pronunciation...')).toBeInTheDocument();
  });

  it('renders feedback data correctly', () => {
    render(<Feedback isLoading={false} feedback={mockFeedback} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Peter')).toBeInTheDocument();
    expect(screen.getByText(/Focus on the long i sound/)).toBeInTheDocument();
  });

  it('handles null feedback gracefully', () => {
    render(<Feedback isLoading={false} feedback={null} />);
    expect(screen.queryByText('Clarity Score')).not.toBeInTheDocument();
  });
});
