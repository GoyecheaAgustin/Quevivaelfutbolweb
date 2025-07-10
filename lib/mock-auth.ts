// Sistema de autenticación mock para desarrollo
export const mockUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@escuela.com",
    password: "password",
    role: "admin" as const,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "alumno@escuela.com",
    password: "password",
    role: "student" as const,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "entrenador@escuela.com",
    password: "password",
    role: "coach" as const,
  },
]

export async function mockSignIn(email: string, password: string) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Credenciales incorrectas")
  }

  // Guardar en localStorage para persistencia
  localStorage.setItem("currentUser", JSON.stringify(user))

  return { user }
}

export async function mockGetCurrentUser() {
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  return JSON.parse(userStr)
}

export async function mockSignOut() {
  localStorage.removeItem("currentUser")
}
