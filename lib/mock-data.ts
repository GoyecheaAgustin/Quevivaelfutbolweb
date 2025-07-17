// Datos mock para desarrollo
// Usamos localStorage para simular persistencia en el navegador
const loadMockData = (key: string, defaultData: any[]) => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem(key)
    return storedData ? JSON.parse(storedData) : defaultData
  }
  return defaultData
}

const saveMockData = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export let mockUsers = loadMockData("mockUsers", [])
export let mockFees = loadMockData("mockFees", [])
export let mockAttendance = loadMockData("mockAttendance", [])
export let mockNews = loadMockData("mockNews", [])

// Función para actualizar y guardar mockUsers
export const updateMockUsers = (newUsers: any[]) => {
  mockUsers = newUsers
  saveMockData("mockUsers", mockUsers)
}

// Función para actualizar y guardar mockFees
export const updateMockFees = (newFees: any[]) => {
  mockFees = newFees
  saveMockData("mockFees", mockFees)
}

// Función para actualizar y guardar mockAttendance
export const updateMockAttendance = (newAttendance: any[]) => {
  mockAttendance = newAttendance
  saveMockData("mockAttendance", mockAttendance)
}

// Función para actualizar y guardar mockNews
export const updateMockNews = (newNews: any[]) => {
  mockNews = newNews
  saveMockData("mockNews", mockNews)
}

// Función para resetear todos los datos mock (útil para desarrollo)
export const resetAllMockData = () => {
  mockUsers = []
  mockFees = []
  mockAttendance = []
  mockNews = []
  saveMockData("mockUsers", [])
  saveMockData("mockFees", [])
  saveMockData("mockAttendance", [])
  saveMockData("mockNews", [])
}
