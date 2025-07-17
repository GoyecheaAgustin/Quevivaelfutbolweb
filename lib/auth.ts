""// auth.ts - Versión corregida para manejar registro e inserción de perfil post-login
import { supabase } from "./supabase"
import {
  mockSignIn,
  mockGetCurrentUser,
  mockSignOut,
  mockSignUp,
  mockCheckUserExists
} from "./mock-auth"

export interface User {
  id: string
  email: string
  role: "student" | "admin" | "coach"
}

const USE_MOCK_AUTH = false // Mantené esto en false para Supabase real

export async function signIn(email: string, password: string) {
  if (USE_MOCK_AUTH) return await mockSignIn(email, password)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const user = data.user
  if (!user) throw new Error("No se pudo obtener el usuario.")
  console.log("✅ Usuario autenticado:", JSON.stringify(user))

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("completo") // ⚠️ solo pedimos el campo necesario
    .eq("auth_id", user.id)
    .maybeSingle()

  console.log("📂 Resultado de búsqueda de perfil:", userProfile)

  const hasCompleteProfile = userProfile?.completo === true
  console.log("📌 ¿Tiene perfil completo?:", hasCompleteProfile)

  return {
    user,
    requiresProfile: !hasCompleteProfile
  }
}

export async function signUp(email: string, password: string, role = "student") {
  const signUpResponse = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  })

  if (signUpResponse.error) {
    if (signUpResponse.error.message.includes("duplicate key value")) {
      throw new Error("Ya existe una cuenta con ese email.")
    }
    throw new Error("Error al registrar usuario: " + signUpResponse.error.message)
  }

  const authUserId = signUpResponse.data.user?.id
  if (!authUserId) throw new Error("No se obtuvo el ID del usuario luego del registro.")

  // NO insertar en 'users' acá: esperar a que confirme y complete perfil luego del primer login
  return signUpResponse.data
}

export async function signOut() {
  if (USE_MOCK_AUTH) return await mockSignOut()

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (USE_MOCK_AUTH) return await mockGetCurrentUser()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) throw error || new Error("No se pudo obtener el usuario")

  // Ahora buscamos en la tabla 'users' por el auth_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (userError || !userData) throw userError || new Error("No se encontró el perfil del usuario")

  return {
    id: userData.id,
    email: userData.email,
    role: userData.role
  }
}


export async function checkUserExists(email: string) {
  if (USE_MOCK_AUTH) return await mockCheckUserExists(email)

  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (error) throw error
  return !!data
}
