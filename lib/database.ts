import { supabase } from "./supabase"

// Funciones para usuarios/estudiantes
export async function getUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading users:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw error
  }
}

export async function getUserByUserId(authId: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("auth_id", authId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means "No rows found", which is not an error for maybeSingle/single if expecting null
      console.error("Error finding user:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getUserByUserId:", error)
    throw error
  }
}

export async function createUser(userData: any) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createUser:", error)
    throw error
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateUser:", error)
    throw error
  }
}

export async function deleteUser(id: string) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    throw error
  }
}

// Funciones para cuotas
export async function getFees(studentId?: string) {
  try {
    let query = supabase.from("fees").select(`
        *,
        students!inner(first_name, last_name, email)
      `) // Asumiendo que 'students' tiene email, o ajusta a 'users' si es el caso

    if (studentId) {
      query = query.eq("student_id", studentId)
    }

    const { data, error } = await query.order("due_date", { ascending: false })

    if (error) {
      console.error("Error loading fees:", error)
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
  try {
    const { data, error } = await supabase
      .from("fees")
      .insert([
        {
          ...feeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating fee:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createFee:", error)
    throw error
  }
}

export async function updateFee(id: string, feeData: any) {
  try {
    const { data, error } = await supabase
      .from("fees")
      .update({
        ...feeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating fee:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateFee:", error)
    throw error
  }
}

// Funciones para asistencia
export async function getAttendance(date?: string) {
  try {
    let query = supabase.from("attendance").select(`
        *,
        students!inner(first_name, last_name, category)
      `)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Error loading attendance:", error)
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
  try {
    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        attendanceData.map((record) => ({
          ...record,
          updated_at: new Date().toISOString(),
        })),
      )
      .select()

    if (error) {
      console.error("Error marking attendance:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in markAttendance:", error)
    throw error
  }
}

// Funciones para noticias
export async function getNews() {
  try {
    const { data, error } = await supabase
      .from("news")
      .select(`
        *,
        users!inner(email, first_name, last_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading news:", error)
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
  try {
    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          ...newsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating news:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createNews:", error)
    throw error
  }
}

export async function updateNews(id: string, newsData: any) {
  try {
    const { data, error } = await supabase
      .from("news")
      .update({
        ...newsData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating news:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateNews:", error)
    throw error
  }
}

export async function deleteNews(id: string) {
  try {
    const { error } = await supabase.from("news").delete().eq("id", id)

    if (error) {
      console.error("Error deleting news:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteNews:", error)
    throw error
  }
}

// Funciones adicionales para estadísticas
export async function getStudentStats(studentId: string) {
  try {
    // Asumiendo que studentId es el ID de la tabla 'students'
    const [fees, attendance] = await Promise.all([getFees(studentId), getAttendance()])

    const studentAttendance = attendance?.filter((a) => a.student_id === studentId) || []
    const totalSessions = studentAttendance.length
    const presentSessions = studentAttendance.filter((a) => a.present).length
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0

    const totalFees = fees?.length || 0
    const paidFees = fees?.filter((f) => f.status === "paid").length || 0
    const pendingFees = fees?.filter((f) => f.status === "pending").length || 0
    const paymentRate = totalFees > 0 ? (paidFees / totalFees) * 100 : 0

    return {
      attendance: {
        total: totalSessions,
        present: presentSessions,
        rate: Math.round(attendanceRate),
      },
      payments: {
        total: totalFees,
        paid: paidFees,
        pending: pendingFees,
        rate: Math.round(paymentRate),
      },
    }
  } catch (error) {
    console.error("Error getting student stats:", error)
    throw error
  }
}

export async function getGeneralStats() {
  try {
    const [users, fees, attendance] = await Promise.all([getUsers(), getFees(), getAttendance()])

    const activeUsers = users?.filter((u) => u.status === "active").length || 0
    const totalUsers = users?.length || 0

    const paidFees = fees?.filter((f) => f.status === "paid").length || 0
    const pendingFees = fees?.filter((f) => f.status === "pending").length || 0
    const totalRevenue = fees?.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0) || 0

    const todayAttendance = attendance?.filter((a) => a.date === new Date().toISOString().split("T")[0]) || []
    const presentToday = todayAttendance.filter((a) => a.present).length
    const totalToday = todayAttendance.length

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      payments: {
        paid: paidFees,
        pending: pendingFees,
        revenue: totalRevenue,
      },
      attendance: {
        today: {
          present: presentToday,
          total: totalToday,
          rate: totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error getting general stats:", error)
    throw error
  }
}

// Función para buscar usuarios
export async function searchUsers(query: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error("Error searching users:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in searchUsers:", error)
    throw error
  }
}
