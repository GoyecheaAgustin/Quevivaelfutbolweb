import { supabase } from "./supabase"
import {
  mockUsers,
  mockFees,
  mockAttendance,
  mockNews,
  updateMockUsers,
  updateMockFees,
  updateMockAttendance,
  updateMockNews,
} from "./mock-data"

// Flag para usar datos mock en desarrollo
const USE_MOCK_DATA = false

// Funciones para estudiantes
export async function getUsers() {
  if (USE_MOCK_DATA) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockUsers
  }

  try {
    // Intentar primero con JOIN
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        users!inner(email, role)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error with JOIN query:", error)
      // Si falla el JOIN, intentar sin él
      const { data: simpleData, error: simpleError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (simpleError) throw simpleError
      return simpleData
    }

    return data
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw error
  }
}

export async function getUserByUserId(userId: string) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockUsers.find((s) => s.user_id === userId)
  }

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    console.log("🔍 Buscando estudiante con auth_id:", userId)

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error in getUserByUserId:", error)
    throw error
  }
}

export async function createUser(studentData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newUser = {
      ...studentData,
      id: `student-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: { email: `${studentData.first_name.toLowerCase()}@escuela.com`, role: "student" },
      fees: [],
    }
    updateMockUsers([...mockUsers, newUser])
    return newUser
  }

  const { data, error } = await supabase.from("users").insert([studentData]).select()
  if (error) throw error
  return data[0]
}

export async function updateUser(id: string, studentData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockUsers.findIndex((s) => s.id === id)
    if (index !== -1) {
      const updatedUsers = [...mockUsers]
      updatedUsers[index] = { ...updatedUsers[index], ...studentData, updated_at: new Date().toISOString() }
      updateMockUsers(updatedUsers)
      return updatedUsers[index]
    }
    throw new Error("User not found")
  }

  const { data, error } = await supabase.from("users").update(studentData).eq("id", id).select()
  if (error) throw error
  return data[0]
}

export async function deleteUser(id: string) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockUsers.findIndex((s) => s.id === id)
    if (index !== -1) {
      const updatedUsers = mockUsers.filter((s) => s.id !== id)
      updateMockUsers(updatedUsers)
      return
    }
    throw new Error("User not found")
  }

  const { error } = await supabase.from("users").delete().eq("id", id)
  if (error) throw error
}

// Funciones para cuotas
export async function getFees(studentId?: string) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    let filteredFees = mockFees
    if (studentId) {
      filteredFees = mockFees.filter((fee) => fee.student_id === studentId)
    }
    return filteredFees
  }

  try {
    let query = supabase.from("fees").select(`
      *,
      users!inner(first_name, last_name)
    `)

    if (studentId) {
      query = query.eq("student_id", studentId)
    }

    const { data, error } = await query.order("due_date", { ascending: false })

    if (error) {
      console.error("Error with fees JOIN query:", error)
      // Si falla el JOIN, intentar sin él
      let simpleQuery = supabase.from("fees").select("*")
      if (studentId) {
        simpleQuery = simpleQuery.eq("student_id", studentId)
      }
      const { data: simpleData, error: simpleError } = await simpleQuery.order("due_date", { ascending: false })
      if (simpleError) throw simpleError
      return simpleData
    }

    return data
  } catch (error) {
    console.error("Error in getFees:", error)
    throw error
  }
}

export async function createFee(feeData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const student = mockUsers.find((s) => s.id === feeData.student_id)
    const newFee = {
      ...feeData,
      id: `fee-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: student ? { first_name: student.first_name, last_name: student.last_name } : null,
    }
    updateMockFees([...mockFees, newFee])
    return newFee
  }

  // Si no se pasa due_date, lo generamos automáticamente (día 10 del mes)
  const dueDate = feeData.due_date
    ? feeData.due_date
    : new Date(feeData.year, feeData.month - 1, 10).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("fees")
    .insert([
      {
        ...feeData,
        due_date: dueDate,
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}


export async function updateFee(id: string, feeData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockFees.findIndex((f) => f.id === id)
    if (index !== -1) {
      const updatedFees = [...mockFees]
      updatedFees[index] = { ...updatedFees[index], ...feeData, updated_at: new Date().toISOString() }
      updateMockFees(updatedFees)
      return updatedFees[index]
    }
    throw new Error("Fee not found")
  }

  const { data, error } = await supabase.from("fees").update(feeData).eq("id", id).select()
  if (error) throw error
  return data[0]
}

// Funciones para asistencia
export async function getAttendance(date?: string) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    let filteredAttendance = mockAttendance
    if (date) {
      filteredAttendance = mockAttendance.filter((att) => att.date === date)
    }
    return filteredAttendance
  }

  try {
    let query = supabase.from("attendance").select(`
      *,
      users!inner(first_name, last_name, category)
    `)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Error with attendance JOIN query:", error)
      // Si falla el JOIN, intentar sin él
      let simpleQuery = supabase.from("attendance").select("*")
      if (date) {
        simpleQuery = simpleQuery.eq("date", date)
      }
      const { data: simpleData, error: simpleError } = await simpleQuery.order("date", { ascending: false })
      if (simpleError) throw simpleError
      return simpleData
    }

    return data
  } catch (error) {
    console.error("Error in getAttendance:", error)
    throw error
  }
}

export async function markAttendance(attendanceData: any[]) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedAttendance = [...mockAttendance]
    attendanceData.forEach((newRecord) => {
      const existingIndex = updatedAttendance.findIndex(
        (att) => att.student_id === newRecord.student_id && att.date === newRecord.date,
      )

      const student = mockUsers.find((s) => s.id === newRecord.student_id)
      const recordWithUser = {
        ...newRecord,
        id: existingIndex !== -1 ? updatedAttendance[existingIndex].id : `att-${Date.now()}-${newRecord.student_id}`,
        created_at: existingIndex !== -1 ? updatedAttendance[existingIndex].created_at : new Date().toISOString(),
        users: student
          ? {
              first_name: student.first_name,
              last_name: student.last_name,
              category: student.category,
            }
          : null,
      }

      if (existingIndex !== -1) {
        updatedAttendance[existingIndex] = recordWithUser
      } else {
        updatedAttendance.push(recordWithUser)
      }
    })
    updateMockAttendance(updatedAttendance)
    return attendanceData
  }

  const { data, error } = await supabase.from("attendance").upsert(attendanceData).select()
  if (error) throw error
  return data
}

// Funciones para noticias
export async function getNews() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockNews
  }

  try {
    const { data, error } = await supabase
      .from("news")
      .select(`
        *,
        users!inner(email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error with news JOIN query:", error)
      // Si falla el JOIN, intentar sin él
      const { data: simpleData, error: simpleError } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
      if (simpleError) throw simpleError
      return simpleData
    }

    return data
  } catch (error) {
    console.error("Error in getNews:", error)
    throw error
  }
}

export async function createNews(newsData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newNews = {
      ...newsData,
      id: `news-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: { email: "admin@escuela.com" },
    }
    updateMockNews([newNews, ...mockNews])
    return newNews
  }

  const { data, error } = await supabase.from("news").insert([newsData]).select()
  if (error) throw error
  return data[0]
}

export async function updateNews(id: string, newsData: any) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockNews.findIndex((n) => n.id === id)
    if (index !== -1) {
      const updatedNews = [...mockNews]
      updatedNews[index] = { ...updatedNews[index], ...newsData, updated_at: new Date().toISOString() }
      updateMockNews(updatedNews)
      return updatedNews[index]
    }
    throw new Error("News not found")
  }

  const { data, error } = await supabase.from("news").update(newsData).eq("id", id).select()
  if (error) throw error
  return data[0]
}

export async function deleteNews(id: string) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockNews.findIndex((n) => n.id === id)
    if (index !== -1) {
      const updatedNews = mockNews.filter((n) => n.id !== id)
      updateMockNews(updatedNews)
      return
    }
    throw new Error("News not found")
  }

  const { error } = await supabase.from("news").delete().eq("id", id)
  if (error) throw error
}
