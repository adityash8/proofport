import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_anon_key_for_development'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          pnr: string | null
          hotel_conf: string | null
          ttl: string | null
          expiry: string | null
          status: string
          json_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pnr?: string | null
          hotel_conf?: string | null
          ttl?: string | null
          expiry?: string | null
          status?: string
          json_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pnr?: string | null
          hotel_conf?: string | null
          ttl?: string | null
          expiry?: string | null
          status?: string
          json_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          status: string
          stripe_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          status?: string
          stripe_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          status?: string
          stripe_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}