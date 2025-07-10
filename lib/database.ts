import { supabase } from "./supabase"

// Funciones para estudiantes
export async function getStudents() {
  const { data, error } = await supabase
    .from("students")
    .select(`
      *,
      users(email, role),
      fees(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createStudent(studentData: any) {
  const { data, error } = await supabase.from("students").insert([studentData]).select()

  if (error) throw error
  return data[0]
}

export async function updateStudent(id: string, studentData: any) {
  const { data, error } = await supabase.from("students").update(studentData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from("students").delete().eq("id", id)

  if (error) throw error
}

// Funciones para cuotas
export async function getFees(studentId?: string) {
  let query = supabase.from("fees").select(`
      *,
      students(first_name, last_name)
    `)

  if (studentId) {
    query = query.eq("student_id", studentId)
  }

  const { data, error } = await query.order("due_date", { ascending: false })

  if (error) throw error
  return data
}

export async function createFee(feeData: any) {
  const { data, error } = await supabase.from("fees").insert([feeData]).select()

  if (error) throw error
  return data[0]
}

export async function updateFee(id: string, feeData: any) {
  const { data, error } = await supabase.from("fees").update(feeData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

// Funciones para asistencia
export async function getAttendance(date?: string) {
  let query = supabase.from("attendance").select(`
      *,
      students(first_name, last_name, category)
    `)

  if (date) {
    query = query.eq("date", date)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (error) throw error
  return data
}

export async function markAttendance(attendanceData: any[]) {
  const { data, error } = await supabase.from("attendance").upsert(attendanceData).select()

  if (error) throw error
  return data
}

// Funciones para noticias
export async function getNews() {
  const { data, error } = await supabase
    .from("news")
    .select(`
      *,
      users(email)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createNews(newsData: any) {
  const { data, error } = await supabase.from("news").insert([newsData]).select()

  if (error) throw error
  return data[0]
}

export async function updateNews(id: string, newsData: any) {
  const { data, error } = await supabase.from("news").update(newsData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from("news").delete().eq("id", id)

  if (error) throw error
}
