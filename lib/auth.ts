import { supabase } from "./supabase"
import { mockSignIn, mockGetCurrentUser, mockSignOut, mockSignUp, mockCheckUserExists } from "./mock-auth"

export interface User {
  id: string
  email: string
  role: "student" | "admin" | "coach"
}

// Flag para usar autenticación mock en desarrollo
const USE_MOCK_AUTH = false // Mantener como false para Supabase en producción

export async function signIn(email: string, password: string) {
  if (USE_MOCK_AUTH) {
    return await mockSignIn(email, password)
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, role = "student", studentData?: any) {
  // Paso 1: Crear en Supabase Auth
  const signUpResponse = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });

  if (signUpResponse.error) {
    if (signUpResponse.error.message.includes("duplicate key value")) {
      throw new Error("Ya existe una cuenta con ese email.");
    }
    throw signUpResponse.error;
  }

  const authUserId = signUpResponse.data.user?.id;
  if (!authUserId) throw new Error("No se obtuvo el ID del usuario luego del registro.");

  // Paso 2: Insertar en tabla 'users' con el auth_id y obtener ID generado
  const { data: userInsertResult, error: userError } = await supabase
    .from("users")
    .insert({
      auth_id: authUserId,
      email,
      role,
      status: "moroso",
      created_at: new Date().toISOString(),
    })
    .select("id") // importante para obtener el ID generado
    .single();

  if (userError || !userInsertResult) {
    console.error("Error al insertar en users:", userError);
    throw userError;
  }

  const userId = userInsertResult.id;

  // Paso 3: Insertar en tabla 'students'
  if (studentData) {
    // Validar y limpiar datos según columnas reales
    const cleanedData = {
      user_id: userId,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      dob: studentData.date_of_birth,
      category: studentData.category,
      status_pago: studentData.status_pago || "moroso",
      phone: studentData.phone,
      parent_name: studentData.parent_name,
      parent_phone: studentData.parent_phone,
      parent_email: studentData.parent_email,
      address: studentData.address,
      notes: studentData.notes,
      enrollment_date: studentData.enrollment_date,
      qr_code: studentData.qr_code || "",
      created_at: new Date().toISOString(),
    };

    const { error: studentError } = await supabase.from("students").insert(cleanedData);

    if (studentError) {
      console.error("Error al insertar en students:", studentError);
      throw studentError;
    }
  }

  return signUpResponse.data;
}




export async function checkUserExists(email: string) {
  if (USE_MOCK_AUTH) {
    return await mockCheckUserExists(email)
  }

  // Esta consulta necesita una política RLS para el rol 'anon' para SELECT en la tabla 'users'
  const { data, error } = await supabase.from("users").select("email").eq("email", email.toLowerCase()).single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 significa "no se encontraron filas"
  return !!data
}

// ELIMINAR createUserByAdmin de aquí, ahora es una Server Action
// export async function createUserByAdmin(...) { ... }

export async function signOut() {
  if (USE_MOCK_AUTH) {
    await mockSignOut()
    return
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCK_AUTH) {
    const user = await mockGetCurrentUser()
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email!,
    role: (user.user_metadata?.role as "student" | "admin" | "coach") || "student",
  }
}
