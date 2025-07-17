"use server"

import { createClient } from "@supabase/supabase-js"

// Asegúrate de que estas variables de entorno estén configuradas en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createUserByAdminAction(
  email: string,
  password: string,
  role: "admin" | "coach",
  createdBy: string,
) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase para la acción del servidor.")
  }

  // Inicializa un cliente de Supabase con privilegios de administrador (service_role key)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false, // Importante para operaciones del lado del servidor
    },
  })

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: role,
        created_by: createdBy,
      },
      email_confirm: true, // Opcional: confirma el email automáticamente para usuarios creados por admin
    })

    if (error) {
      console.error("Error al crear usuario por admin:", error.message)
      throw new Error(error.message)
    }
    return data
  } catch (error: any) {
    console.error("Excepción en createUserByAdminAction:", error.message)
    throw new Error(`Error al crear usuario: ${error.message}`)
  }
}
