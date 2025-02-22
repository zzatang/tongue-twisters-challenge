export type TongueTwister = {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  category: string;
  created_at: string;
  updated_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
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
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
};
