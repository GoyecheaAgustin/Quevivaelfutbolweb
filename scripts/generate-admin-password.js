// Script para generar el hash de la contraseña del administrador
// Ejecutar con: node scripts/generate-admin-password.js

const bcrypt = require("bcrypt")

async function generateAdminPassword() {
  const adminEmail = "nitsuga022@gmail.com"
  const adminPassword = "FutbolBeto2024!" // Tu contraseña segura

  try {
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    console.log("=== CREDENCIALES DEL ADMINISTRADOR ===")
    console.log("Email:", adminEmail)
    console.log("Contraseña:", adminPassword)
    console.log("Password Hash:", passwordHash)
    console.log("")
    console.log("=== SQL PARA INSERTAR EN LA BASE DE DATOS ===")
    console.log(`
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES 
  ('admin-001-2024', '${adminEmail}', '${passwordHash}', 'admin', NOW(), NOW());
    `)

    console.log("")
    console.log("=== INSTRUCCIONES ===")
    console.log("1. Ejecuta el SQL anterior en tu base de datos")
    console.log("2. Usa estas credenciales para hacer login:")
    console.log("   Email: " + adminEmail)
    console.log("   Contraseña: " + adminPassword)
    console.log("3. Una vez dentro, puedes crear entrenadores desde 'Gestión de Usuarios'")
  } catch (error) {
    console.error("Error:", error)
  }
}

generateAdminPassword()
