import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  if (!supabaseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "Variable de entorno NEXT_PUBLIC_SUPABASE_URL no configurada.",
        details: "Asegúrate de que NEXT_PUBLIC_SUPABASE_URL esté definida en tus variables de entorno de Vercel.",
      },
      { status: 500 },
    )
  }
  if (!supabaseServiceRoleKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Variable de entorno SUPABASE_SERVICE_ROLE_KEY no configurada.",
        details:
          "Asegúrate de que SUPABASE_SERVICE_ROLE_KEY esté definida en tus variables de entorno de Vercel. Esta es la clave 'service_role' de Supabase.",
      },
      { status: 500 },
    )
  }
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    })

    const { data, error } = await supabaseAdmin.from("users").select("id, email").limit(1)

    if (error) {
      console.error("Error en la API de prueba de DB:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Error al conectar o consultar la base de datos.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        status: "success",
        message: "Conexión a la base de datos exitosa.",
        data: data[0],
      })
    } else {
      return NextResponse.json({
        status: "success",
        message: "Conexión a la base de datos exitosa, pero la tabla 'users' está vacía.",
      })
    }
  } catch (e: any) {
    console.error("Excepción en la API de prueba de DB:", e)
    return NextResponse.json(
      {
        status: "error",
        message: "Error interno del servidor al probar la conexión.",
        details: e.message,
      },
      { status: 500 },
    )
  }
}
