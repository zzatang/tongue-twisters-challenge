import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressTracking } from '@/components/dashboard/progress-tracking';
import { getUserBadges, getAllBadges } from '@/lib/services/badge-service';
import { useToast } from '@/components/ui/use-toast';
import type { Badge } from '@/lib/supabase/types';
import { useAuth } from '@clerk/nextjs';

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    userId: 'test-user',
  })),
}));

// Mock BadgesShowcase component
jest.mock('@/components/dashboard/badges-showcase', () => ({
  __esModule: true,
  default: () => <div data-testid="badges-showcase" />,
}));

// Mock the badge service functions
jest.mock('@/lib/services/badge-service', () => ({
  getUserBadges: jest.fn(),
  getAllBadges: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Award: () => <div data-testid="award-icon" />,
}));

describe('ProgressTracking', () => {
  const mockMetrics = {
    practiceStreak: 5,
    totalPracticeTime: 120,
    averageClarityScore: 85,
    practiceFrequency: {
      thisWeek: 3,
      lastWeek: 2,
    },
  };

  const mockBadges: Badge[] = [
    {
      id: '1',
      name: 'First Timer',
      description: 'Complete your first practice session',
      criteria_type: 'sessions',
      criteria_value: 1,
      icon_name: 'star',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Practice Makes Perfect',
      description: 'Complete 10 practice sessions',
      criteria_type: 'sessions',
      criteria_value: 10,
      icon_name: 'award',
      created_at: new Date().toISOString(),
    },
  ];

  const mockUserBadges = ['1'];

  beforeEach(() => {
    jest.clearAllMocks();
    (getAllBadges as jest.Mock).mockResolvedValue(mockBadges);
    (getUserBadges as jest.Mock).mockResolvedValue(mockUserBadges);
    (useAuth as jest.Mock).mockImplementation(() => ({
      userId: 'test-user',
    }));
  });

  it('renders progress metrics', async () => {
    render(
      <ProgressTracking
        metrics={mockMetrics}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Practice streak
      expect(screen.getByText('120')).toBeInTheDocument(); // Total practice time
      expect(screen.getByText('85%')).toBeInTheDocument(); // Average clarity score
      expect(screen.getByText('3')).toBeInTheDocument(); // This week's practice count
      expect(screen.getByText('2')).toBeInTheDocument(); // Last week's practice count
    });
  });

  it('loads and displays badges', async () => {
    render(
      <ProgressTracking
        metrics={mockMetrics}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(getAllBadges).toHaveBeenCalled();
      expect(getUserBadges).toHaveBeenCalledWith('test-user');
      expect(screen.getByTestId('badges-showcase')).toBeInTheDocument();
    });
  });

  it('handles badge loading error', async () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (getAllBadges as jest.Mock).mockRejectedValue(new Error('Failed to load badges'));

    render(
      <ProgressTracking
        metrics={mockMetrics}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load badges. Please try again later.',
        variant: 'destructive',
      });
    });
  });
});
