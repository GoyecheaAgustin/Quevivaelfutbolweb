// Sistema de autenticación mock para desarrollo
// Usamos localStorage para simular persistencia en el navegador
const loadMockUsers = (defaultUsers: any[]) => {
  if (typeof window !== "undefined") {
    const storedUsers = localStorage.getItem("mockUsers")
    return storedUsers ? JSON.parse(storedUsers) : defaultUsers
  }
  return defaultUsers
}

export const saveMockUsers = (users: any) => {
  // Exportar saveMockUsers
  if (typeof window !== "undefined") {
    localStorage.setItem("mockUsers", JSON.stringify(users))
  }
}

// Usuario administrador inicial que siempre debe existir
const initialAdminUser = {
  id: "admin-001-2024",
  email: "nitsuga022@gmail.com",
  password: "FutbolBeto2024!", // Esta es la contraseña mock, no el hash real
  role: "admin" as const,
  created_at: new Date().toISOString(),
}

export let mockUsers = loadMockUsers([initialAdminUser])

// Función para resetear los usuarios mock (útil para desarrollo)
export const resetMockUsers = () => {
  // Exportar resetMockUsers
  mockUsers = [initialAdminUser] // Reiniciar con el admin por defecto
  saveMockUsers(mockUsers)
}

export async function mockSignIn(email: string, password: string) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Credenciales incorrectas")
  }

  // Guardar en localStorage para persistencia de la sesión actual
  localStorage.setItem("currentUser", JSON.stringify(user))

  return { user }
}

export async function mockCheckUserExists(email: string) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const existingUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  return !!existingUser
}

export async function mockSignUp(email: string, password: string, role = "student", studentData?: any) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Verificar si el usuario ya existe
  const existingUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    throw new Error("Ya existe una cuenta con este email")
  }

  // Solo permitir registro de estudiantes públicamente
  if (role !== "student") {
    throw new Error(
      "Solo se pueden registrar estudiantes. Los administradores y entrenadores deben ser asignados por un administrador.",
    )
  }

  // Crear nuevo usuario
  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    role: role as "student" | "admin" | "coach",
    created_at: new Date().toISOString(),
  }

  // Agregar a la lista de usuarios mock y guardar
  mockUsers.push(newUser)
  saveMockUsers(mockUsers)

  // Si es un estudiante, crear también el perfil de estudiante con los datos completos
  if (role === "student" && studentData) {
    const { mockStudents, updateMockStudents } = await import("./mock-data")

    // Generar QR code único
    const qrCode = `STU-${Date.now().toString().slice(-6)}-${studentData.first_name.charAt(0)}${studentData.last_name.charAt(0)}`

    const newStudent = {
      id: `student-${Date.now()}`,
      user_id: newUser.id,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      date_of_birth: studentData.date_of_birth,
      phone: studentData.phone || "",
      parent_name: studentData.parent_name,
      parent_phone: studentData.parent_phone,
      parent_email: studentData.parent_email || "",
      address: studentData.address || "",
      category: studentData.category,
      enrollment_date: new Date().toISOString().split("T")[0],
      status: "active",
      qr_code: qrCode,
      notes: studentData.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: { email: newUser.email, role: newUser.role },
      fees: [],
    }
    updateMockStudents([...mockStudents, newStudent])
  }

  return { user: newUser }
}

// Función para que el admin cree usuarios (entrenadores/admins)
export async function mockCreateUserByAdmin(
  email: string,
  password: string,
  role: "admin" | "coach",
  createdBy: string,
) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Verificar si el usuario ya existe
  const existingUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    throw new Error("Ya existe una cuenta con este email")
  }

  // Crear nuevo usuario
  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    role: role,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  }

  // Agregar a la lista de usuarios mock y guardar
  mockUsers.push(newUser)
  saveMockUsers(mockUsers)

  return { user: newUser }
}

export async function mockGetCurrentUser() {
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  return JSON.parse(userStr)
}

export async function mockSignOut() {
  localStorage.removeItem("currentUser")
}
