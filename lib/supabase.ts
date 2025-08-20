import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          role: "admin" | "coach" | "student"
          status: "active" | "inactive" | "moroso"
          profile_completed: boolean
          first_name: string | null
          last_name: string | null
          dob: string | null
          phone: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          address: string | null
          category: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          role?: "admin" | "coach" | "student"
          status?: "active" | "inactive" | "moroso"
          profile_completed?: boolean
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          phone?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          address?: string | null
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          role?: "admin" | "coach" | "student"
          status?: "active" | "inactive" | "moroso"
          profile_completed?: boolean
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          phone?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          address?: string | null
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          dob: string
          category: string
          status_pago: "al_dia" | "moroso" | "exonerado"
          phone: string | null
          parent_name: string
          parent_phone: string
          parent_email: string | null
          address: string | null
          notes: string | null
          enrollment_date: string
          qr_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          dob: string
          category: string
          status_pago?: "al_dia" | "moroso" | "exonerado"
          phone?: string | null
          parent_name: string
          parent_phone: string
          parent_email?: string | null
          address?: string | null
          notes?: string | null
          enrollment_date?: string
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          dob?: string
          category?: string
          status_pago?: "al_dia" | "moroso" | "exonerado"
          phone?: string | null
          parent_name?: string
          parent_phone?: string
          parent_email?: string | null
          address?: string | null
          notes?: string | null
          enrollment_date?: string
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
