// /app/actions/register.ts
"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAnon
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .single();

    if (error && error.code === "PGRST116") {
      return false; // No existe
    }

    if (error) {
      console.error("Error checking user existence:", error.message);
      throw error;
    }

    return !!data; // Existe si hay datos
  } catch (error) {
    console.error("Exception in checkUserExists:", error);
    throw error;
  }
}

export async function createUserUserAction(
  email: string,
  password: string,
  studentData: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    phone?: string;
    parent_name: string;
    parent_phone: string;
    parent_email?: string;
    address?: string;
    category: string;
    notes?: string;
  }
) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase. Configúralas en Vercel.");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  console.log("Iniciando creación de usuario:", { email, role: "student" });

  try {
    // Verificar si el email ya existe en auth.users
    const exists = await checkUserExists(email);
    if (exists) {
      throw new Error("A user with this email address has already been registered");
    }

    // Paso 1: Crear usuario en auth.users
    console.log("Creando usuario en auth.users...");
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: "student" },
      email_confirm: false,
    });

    if (authError) {
      console.error("Error al crear usuario en auth:", authError.message);
      throw new Error(authError.message);
    }

    const authUserId = data.user?.id;
    if (!authUserId) throw new Error("No se obtuvo el ID del usuario luego del registro.");

    console.log("Usuario creado en auth, ID:", authUserId);

    // Paso 2: Insertar en tabla 'users'
    console.log("Insertando en public.users...");
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_id: authUserId,
        email,
        role: "student",
        status: "moroso",
        created_at: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (userError) {
      console.error("Error al insertar en users - Detalles:", userError.code, userError.message);
      throw userError;
    }

    const userId = userData.id;
    console.log("Usuario insertado en users, ID:", userId);

    // Paso 3: Insertar en tabla 'students'
    const cleanedData = {
      user_id: userId,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      dob: new Date(studentData.date_of_birth).toISOString().split("T")[0],
      category: studentData.category,
      status_pago: "moroso",
      phone: studentData.phone || null,
      parent_name: studentData.parent_name,
      parent_phone: studentData.parent_phone,
      parent_email: studentData.parent_email || null,
      address: studentData.address || null,
      notes: studentData.notes || null,
      enrollment_date: new Date().toISOString().split("T")[0],
      qr_code: "",
      created_at: new Date().toISOString(),
    };

    const { error: studentError } = await supabaseAdmin.from("users").insert(cleanedData);

    if (studentError) {
      console.error("Error al insertar en users:", studentError.message);
      throw studentError;
    }

    console.log("Estudiante insertado exitosamente");
    return { success: true, message: "¡Cuenta creada exitosamente! Se ha enviado un correo de confirmación." };
  } catch (error: any) {
    console.error("Excepción en createUserUserAction - Stack:", error.stack);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
}

export async function createUserByAdminAction(
  email: string,
  password: string,
  role: "admin" | "coach",
  createdBy: string,
) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase. Configúralas en Vercel.");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: role,
        created_by: createdBy,
      },
      email_confirm: true,
    });

    if (error) {
      console.error("Error al crear usuario por admin:", error.message);
      throw new Error(error.message);
    }
    return data;
  } catch (error: any) {
    console.error("Excepción en createUserByAdminAction:", error.message);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
}
