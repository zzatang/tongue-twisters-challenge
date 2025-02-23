export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tongue_twisters: {
        Row: {
          id: string
          text: string
          difficulty: 'Easy' | 'Intermediate' | 'Advanced'
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          difficulty: 'Easy' | 'Intermediate' | 'Advanced'
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          difficulty?: 'Easy' | 'Intermediate' | 'Advanced'
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          practice_frequency: Json
          clarity_score: number
          total_practice_time: number
          badges: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          practice_frequency?: Json
          clarity_score?: number
          total_practice_time?: number
          badges?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          practice_frequency?: Json
          clarity_score?: number
          total_practice_time?: number
          badges?: Json
          created_at?: string
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          tongue_twister_id: string
          clarity_score: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tongue_twister_id: string
          clarity_score: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tongue_twister_id?: string
          clarity_score?: number
          duration?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: 'Easy' | 'Intermediate' | 'Advanced'
    }
  }
}
