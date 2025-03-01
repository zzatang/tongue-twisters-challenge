export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          criteria_type: string
          criteria_value: number
          description: string
          icon_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          criteria_type: string
          criteria_value: number
          description: string
          icon_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          clarity_score: number
          created_at: string | null
          duration: number
          id: string
          tongue_twister_id: string
          user_id: string
        }
        Insert: {
          clarity_score: number
          created_at?: string | null
          duration: number
          id?: string
          tongue_twister_id: string
          user_id: string
        }
        Update: {
          clarity_score?: number
          created_at?: string | null
          duration?: number
          id?: string
          tongue_twister_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_tongue_twister_id_fkey"
            columns: ["tongue_twister_id"]
            isOneToOne: false
            referencedRelation: "tongue_twisters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tongue_twisters: {
        Row: {
          category: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          text: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          badges: Json
          clarity_score: number
          created_at: string | null
          id: string
          practice_frequency: Json
          practice_streak: number
          total_practice_time: number
          total_sessions: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges?: Json
          clarity_score?: number
          created_at?: string | null
          id?: string
          practice_frequency?: Json
          practice_streak?: number
          total_practice_time?: number
          total_sessions?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges?: Json
          clarity_score?: number
          created_at?: string | null
          id?: string
          practice_frequency?: Json
          practice_streak?: number
          total_practice_time?: number
          total_sessions?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "Easy" | "Intermediate" | "Advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Badge = {
  id: string;
  name: string;
  description: string;
  criteria_type: string;
  criteria_value: number;
  icon_name: string;
  created_at: string | null;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string | null;
};

export type TongueTwister = {
  id: string;
  text: string;
  difficulty: number;
  category: string;
  created_at: string | null;
  updated_at: string | null;
  description?: string;
  example_words?: string[];
  phonetic_focus?: string[];
};

export interface BadgeProgress {
  practiceStreak: number;
  totalPracticeTime: number;
  totalSessions: number;
  clarityScore: number;
  practiceFrequency: {
    daily: { [key: string]: number };
    weekly: { [key: string]: number };
    monthly: { [key: string]: number };
  };
  userId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UserProgress {
  user_id: string;
  practice_frequency: {
    daily: { [key: string]: number };
    weekly: { [key: string]: number };
    monthly: { [key: string]: number };
  };
  clarity_score: number;
  practice_streak: number;
  total_practice_time: number;
  total_sessions: number;
  badges: any[];
  created_at: string | null;
  updated_at: string | null;
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
