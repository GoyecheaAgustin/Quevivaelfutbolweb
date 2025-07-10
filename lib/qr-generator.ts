export function generateQRCode(studentId: string, studentName: string) {
  // En producción usarías una librería como qrcode
  const qrData = {
    studentId,
    studentName,
    schoolId: "ESCUELA-FUTBOL-2024",
    generatedAt: new Date().toISOString(),
  }

  return `QR-${studentId.slice(0, 8)}-${Date.now()}`
}

export function generateQRCodeURL(qrCode: string) {
  // Simulación de URL de QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`
}
