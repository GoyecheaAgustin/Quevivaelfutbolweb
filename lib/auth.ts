import { supabase } from "./supabase"
import { mockSignIn, mockGetCurrentUser, mockSignOut } from "./mock-auth"

export interface User {
  id: string
  email: string
  role: "student" | "admin" | "coach"
}

export async function signIn(email: string, password: string) {
  // Usar autenticación mock para desarrollo
  return await mockSignIn(email, password)
}

export async function signUp(email: string, password: string, role = "student") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  // Usar logout mock para desarrollo
  await mockSignOut()
}

export async function getCurrentUser(): Promise<User | null> {
  // Usar autenticación mock para desarrollo
  const user = await mockGetCurrentUser()
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}
