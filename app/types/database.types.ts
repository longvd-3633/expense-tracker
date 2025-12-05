/**
 * Supabase Database Types
 * 
 * This file will be auto-generated after running the Supabase migration.
 * For now, we use a placeholder type.
 * 
 * To generate types after setting up Supabase:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Generate types: supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
 */

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          type?: 'income' | 'expense'
          amount?: number
          category_id?: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          currency: string
          date_format: string
          number_format: string
          default_view: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          currency?: string
          date_format?: string
          number_format?: string
          default_view?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          currency?: string
          date_format?: string
          number_format?: string
          default_view?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
