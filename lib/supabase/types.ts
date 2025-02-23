export interface TongueTwister {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  criteria_type: 'streak' | 'clarity' | 'sessions' | 'speed' | 'accuracy' | 'time';
  criteria_value: number;
  icon_name: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserProgress {
  id: string;
  user_id: string;
  practice_streak: number;
  total_sessions: number;
  practice_frequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  clarity_score: number;
  total_practice_time: number;
  badges: Badge[];
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  tongue_twister_id: string;
  clarity_score: number;
  duration: number;
  created_at: string;
}
