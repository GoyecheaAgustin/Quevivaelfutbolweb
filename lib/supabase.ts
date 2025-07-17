import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
console.log("Supabase URL:", supabaseUrl)
console.log("Supabase KEY:", supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Singleton para el cliente del lado del cliente
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
