import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressTracking } from '@/components/dashboard/progress-tracking';
import { getAllBadges, getUserBadges } from '@/lib/supabase/api';
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
jest.mock('@/lib/supabase/api', () => ({
  getAllBadges: jest.fn(),
  getUserBadges: jest.fn(),
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
  const mockToast = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('renders progress metrics', async () => {
    const mockMetrics = {
      streak: 5,
      totalTime: 120,
      weeklyPractice: 3,
      averageClarity: 85,
    };

    render(<ProgressTracking userId="test-user" metrics={mockMetrics} />);

    await waitFor(() => {
      const streakText = screen.getByText('5', { exact: false });
      const weeklyText = screen.getByText('3', { exact: false });
      const clarityText = screen.getByText('85', { exact: false });
      
      expect(streakText).toBeInTheDocument();
      expect(weeklyText).toBeInTheDocument();
      expect(clarityText).toBeInTheDocument();
    });
  });

  it('loads and displays badges', async () => {
    const mockBadges = [
      { id: '1', name: 'First Practice', icon: '🎯' },
      { id: '2', name: 'Perfect Score', icon: '⭐' },
    ];

    (getAllBadges as jest.Mock).mockResolvedValue(mockBadges);
    (getUserBadges as jest.Mock).mockResolvedValue(['1']);

    render(<ProgressTracking userId="test-user" metrics={{
      streak: 5,
      totalTime: 120,
      weeklyPractice: 3,
      averageClarity: 85,
    }} />);

    await waitFor(() => {
      expect(getAllBadges).toHaveBeenCalled();
      expect(getUserBadges).toHaveBeenCalledWith('test-user');
      expect(screen.getByTestId('badges-showcase')).toBeInTheDocument();
    });
  });

  it('handles badge loading error', async () => {
    (getAllBadges as jest.Mock).mockRejectedValue(new Error('Failed to load badges'));

    render(<ProgressTracking userId="test-user" metrics={{
      streak: 5,
      totalTime: 120,
      weeklyPractice: 3,
      averageClarity: 85,
    }} />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load badges. Please try again later.',
        variant: 'destructive',
      });
    });
  });
});
