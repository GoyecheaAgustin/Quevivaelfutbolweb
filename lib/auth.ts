import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  role: "student" | "admin" | "coach"
}

const USE_MOCK_AUTH = false

export async function signIn(email: string, password: string) {
  if (USE_MOCK_AUTH) {
    throw new Error("Mock auth not implemented")
  }

  try {
    console.log("🔐 Iniciando sesión para:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      console.error("❌ Error en signInWithPassword:", error)
      throw new Error(error.message)
    }

    const user = data.user
    if (!user) {
      throw new Error("No se pudo obtener el usuario.")
    }

    console.log("✅ Usuario autenticado:", user.id)

    // Buscar perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("profile_completed, role")
      .eq("auth_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("❌ Error al buscar perfil:", profileError)
      // Si no encuentra el perfil, asumir que necesita completarlo
      return {
        user,
        requiresProfile: true,
      }
    }

    console.log("📂 Perfil encontrado:", userProfile)

    const hasCompleteProfile = userProfile?.profile_completed === true
    console.log("📌 ¿Tiene perfil completo?:", hasCompleteProfile)

    return {
      user,
      requiresProfile: !hasCompleteProfile,
    }
  } catch (error: any) {
    console.error("❌ Error en signIn:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, role = "student") {
  if (USE_MOCK_AUTH) {
    throw new Error("Mock auth not implemented")
  }

  try {
    console.log("📝 Registrando usuario:", email)

    const signUpResponse = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { role },
        emailRedirectTo: undefined,
      },
    })

    if (signUpResponse.error) {
      console.error("❌ Error en signUp:", signUpResponse.error)

      if (
        signUpResponse.error.message.includes("duplicate") ||
        signUpResponse.error.message.includes("already registered") ||
        signUpResponse.error.message.includes("User already registered")
      ) {
        throw new Error("Ya existe una cuenta con ese email.")
      }

      throw new Error("Error al registrar usuario: " + signUpResponse.error.message)
    }

    const authUserId = signUpResponse.data.user?.id
    if (!authUserId) {
      throw new Error("No se obtuvo el ID del usuario luego del registro.")
    }

    console.log("✅ Usuario registrado exitosamente, ID:", authUserId)
    return signUpResponse.data
  } catch (error: any) {
    console.error("❌ Error en signUp:", error)
    throw error
  }
}

export async function signOut() {
  if (USE_MOCK_AUTH) {
    throw new Error("Mock auth not implemented")
  }

  try {
    console.log("🚪 Cerrando sesión")
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("❌ Error en signOut:", error)
      throw error
    }
    console.log("✅ Sesión cerrada exitosamente")
  } catch (error: any) {
    console.error("❌ Error en signOut:", error)
    throw error
  }
}

export async function getCurrentUser() {
  if (USE_MOCK_AUTH) {
    throw new Error("Mock auth not implemented")
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw error || new Error("No se pudo obtener el usuario")
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("auth_id", user.id)
      .maybeSingle()

    if (userError || !userData) {
      throw userError || new Error("No se encontró el perfil del usuario")
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    }
  } catch (error: any) {
    console.error("❌ Error en getCurrentUser:", error)
    throw error
  }
}

export async function checkUserExists(email: string): Promise<boolean> {
  if (USE_MOCK_AUTH) {
    throw new Error("Mock auth not implemented")
  }

  try {
    console.log("🔍 Verificando existencia de usuario:", email)

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      if (error.code === "PGRST116") {
        console.log("✅ Usuario no existe (PGRST116)")
        return false
      }
      console.error("❌ Error al verificar usuario:", error)
      throw new Error(`Error al verificar usuario: ${error.message}`)
    }

    const exists = !!data
    console.log(exists ? "⚠️ Usuario ya existe" : "✅ Usuario no existe")
    return exists
  } catch (error: any) {
    console.error("❌ Excepción en checkUserExists:", error)
    throw new Error(`Error al verificar email: ${error.message}`)
  }
}
