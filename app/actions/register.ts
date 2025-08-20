"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createUserUserAction(
  email: string,
  password: string,
  studentData: {
    first_name: string
    last_name: string
    date_of_birth: string
    phone?: string
    parent_name: string
    parent_phone: string
    parent_email?: string
    address?: string
    category: string
    notes?: string
  },
) {
  console.log("🚀 Iniciando createUserUserAction con datos:", {
    email,
    studentData: {
      ...studentData,
      password: "[HIDDEN]",
    },
  })

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Faltan variables de entorno")
    throw new Error("Faltan variables de entorno de Supabase. Configúralas en Vercel.")
  }

  // Crear cliente admin con configuración específica
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  try {
    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase()
    console.log("📧 Email normalizado:", normalizedEmail)

    // Validar datos obligatorios
    if (
      !normalizedEmail ||
      !password ||
      !studentData.first_name ||
      !studentData.last_name ||
      !studentData.date_of_birth ||
      !studentData.parent_name ||
      !studentData.parent_phone ||
      !studentData.category
    ) {
      throw new Error("Faltan datos obligatorios")
    }

    // Crear usuario en auth.users
    console.log("👤 Creando usuario en auth.users...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: {
        role: "student",
        first_name: studentData.first_name,
        last_name: studentData.last_name,
      },
      email_confirm: true, // Confirmar automáticamente el email
    })

    if (authError) {
      console.error("❌ Error al crear usuario en auth:", authError)

      if (authError.message.includes("User already registered")) {
        throw new Error("Ya existe un usuario con este email")
      }

      throw new Error(`Error de autenticación: ${authError.message}`)
    }

    const authUserId = authData.user?.id
    if (!authUserId) {
      throw new Error("No se obtuvo el ID del usuario luego del registro.")
    }

    console.log("✅ Usuario creado en auth, ID:", authUserId)

    // Preparar datos para insertar en users
    const userData = {
      auth_id: authUserId,
      email: normalizedEmail,
      role: "student" as const,
      status: "moroso" as const,
      profile_completed: true,
      first_name: studentData.first_name.trim(),
      last_name: studentData.last_name.trim(),
      dob: new Date(studentData.date_of_birth).toISOString().split("T")[0],
      phone: studentData.phone?.trim() || null,
      parent_name: studentData.parent_name.trim(),
      parent_phone: studentData.parent_phone.trim(),
      parent_email: studentData.parent_email?.trim().toLowerCase() || null,
      address: studentData.address?.trim() || null,
      category: studentData.category,
      notes: studentData.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Insertando en public.users con datos:", userData)

    // Insertar en tabla 'users'
    const { data: userInsertData, error: userError } = await supabaseAdmin
      .from("users")
      .insert(userData)
      .select("id")
      .single()

    if (userError) {
      console.error("❌ Error al insertar en users:", {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
      })
      throw new Error(`Error al crear perfil de usuario: ${userError.message}`)
    }

    const userId = userInsertData.id
    console.log("✅ Usuario insertado en users, ID:", userId)

    // Preparar datos para students
    const studentInsertData = {
      user_id: userId,
      first_name: studentData.first_name.trim(),
      last_name: studentData.last_name.trim(),
      dob: new Date(studentData.date_of_birth).toISOString().split("T")[0],
      category: studentData.category,
      status_pago: "moroso" as const,
      phone: studentData.phone?.trim() || null,
      parent_name: studentData.parent_name.trim(),
      parent_phone: studentData.parent_phone.trim(),
      parent_email: studentData.parent_email?.trim().toLowerCase() || null,
      address: studentData.address?.trim() || null,
      notes: studentData.notes?.trim() || null,
      enrollment_date: new Date().toISOString().split("T")[0],
      qr_code: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("🎓 Insertando en students con datos:", studentInsertData)

    // Insertar en tabla 'students'
    const { error: studentError } = await supabaseAdmin.from("students").insert(studentInsertData)

    if (studentError) {
      console.error("❌ Error al insertar en students:", {
        code: studentError.code,
        message: studentError.message,
        details: studentError.details,
        hint: studentError.hint,
      })
      throw new Error(`Error al crear perfil de estudiante: ${studentError.message}`)
    }

    console.log("🎉 Estudiante insertado exitosamente")

    return {
      success: true,
      message: "¡Cuenta creada exitosamente! Ya puedes iniciar sesión.",
    }
  } catch (error: any) {
    console.error("💥 Excepción en createUserUserAction:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Limpiar el mensaje de error para el usuario
    let userMessage = error.message
    if (userMessage.includes("Database error")) {
      userMessage = "Error en la base de datos. Por favor intenta de nuevo."
    }
    if (userMessage.includes("Invalid Refresh Token")) {
      userMessage = "Error de configuración. Por favor intenta de nuevo."
    }

    throw new Error(userMessage)
  }
}

export async function createUserByAdminAction(
  email: string,
  password: string,
  role: "admin" | "coach",
  createdBy: string,
) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.")
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  try {
    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: {
        role: role,
        created_by: createdBy,
      },
      email_confirm: true, // Confirmar automáticamente
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
