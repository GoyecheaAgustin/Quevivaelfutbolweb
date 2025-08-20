import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log("🔍 Iniciando test de conexión a la base de datos...")

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Faltan variables de entorno de Supabase")
    }

    console.log("✅ Variables de entorno encontradas")
    console.log("📍 URL:", supabaseUrl)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test 1: Conexión básica
    console.log("🧪 Test 1: Conexión básica...")
    const { data: connectionTest, error: connectionError } = await supabase.from("users").select("count").limit(1)

    if (connectionError) {
      console.error("❌ Error de conexión:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Error de conexión a la base de datos",
          details: connectionError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Conexión exitosa")

    // Test 2: Verificar estructura de tablas
    console.log("🧪 Test 2: Verificando estructura de tablas...")
    const { data: usersStructure, error: usersError } = await supabase.from("users").select("*").limit(1)

    const { data: studentsStructure, error: studentsError } = await supabase.from("students").select("*").limit(1)

    console.log("✅ Estructura de tablas verificada")

    // Test 3: Contar registros
    console.log("🧪 Test 3: Contando registros...")
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

    const { count: studentsCount } = await supabase.from("students").select("*", { count: "exact", head: true })

    console.log(`📊 Usuarios: ${usersCount}, Estudiantes: ${studentsCount}`)

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos exitosa",
      data: {
        connection: "OK",
        tables: {
          users: {
            accessible: !usersError,
            count: usersCount,
            error: usersError?.message || null,
          },
          students: {
            accessible: !studentsError,
            count: studentsCount,
            error: studentsError?.message || null,
          },
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Error en test de base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
