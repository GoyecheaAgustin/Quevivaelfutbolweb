// Script para crear el primer administrador
// Ejecutar con: node scripts/create-first-admin.js

const bcrypt = require("bcrypt")

async function createFirstAdmin() {
  const adminEmail = "tu-email@gmail.com" // CAMBIAR POR TU EMAIL
  const adminPassword = "admin123" // CAMBIAR POR UNA CONTRASEÑA SEGURA

  try {
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    console.log("=== DATOS DEL PRIMER ADMINISTRADOR ===")
    console.log("Email:", adminEmail)
    console.log("Password Hash:", passwordHash)
    console.log("")
    console.log("=== SQL PARA INSERTAR EN LA BASE DE DATOS ===")
    console.log(`
INSERT INTO users (id, email, password_hash, role, created_at) VALUES 
  ('${generateUUID()}', '${adminEmail}', '${passwordHash}', 'admin', NOW());
    `)

    console.log("")
    console.log("=== INSTRUCCIONES ===")
    console.log("1. Ejecuta el SQL anterior en tu base de datos")
    console.log("2. Usa el email y contraseña para hacer login como admin")
    console.log("3. Cambia la contraseña desde el panel de administración")
  } catch (error) {
    console.error("Error:", error)
  }
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

createFirstAdmin()
