import { render, screen } from '@testing-library/react';
import { ProgressTracking } from '@/components/dashboard/progress-tracking';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Trophy: () => <div data-testid="trophy-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Star: () => <div data-testid="star-icon" />,
}));

describe('ProgressTracking Component', () => {
  const mockMetrics = {
    practiceStreak: 5,
    totalPracticeTime: 120,
    averageClarityScore: 85,
    practiceFrequency: {
      thisWeek: 12,
      lastWeek: 8,
    },
    badges: [
      {
        id: 'test-badge',
        name: 'Test Badge',
        description: 'Test Description',
        earned: true,
      },
    ],
  };

  it('renders all metrics correctly', () => {
    render(<ProgressTracking metrics={mockMetrics} />);
    
    // Check streak
    expect(screen.getByText('5 days')).toBeInTheDocument();
    
    // Check practice time
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
    
    // Check clarity score
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Check weekly sessions
    expect(screen.getByText('12 sessions')).toBeInTheDocument();
  });

  it('renders badges correctly', () => {
    render(<ProgressTracking metrics={mockMetrics} />);
    
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    const metricsWithShortTime = {
      ...mockMetrics,
      totalPracticeTime: 45,
    };
    
    render(<ProgressTracking metrics={metricsWithShortTime} />);
    expect(screen.getByText('45m')).toBeInTheDocument();
  });
});
