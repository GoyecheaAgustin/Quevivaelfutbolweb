export async function sendEmail(to: string, subject: string, content: string) {
  // Simulación de envío de email
  console.log("Enviando email:", { to, subject, content })

  // En producción usarías un servicio como SendGrid, Resend, etc.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `msg_${Date.now()}` })
    }, 1000)
  })
}

export async function sendWhatsApp(phone: string, message: string) {
  // Simulación de envío de WhatsApp
  console.log("Enviando WhatsApp:", { phone, message })

  // En producción usarías WhatsApp Business API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `wa_${Date.now()}` })
    }, 1000)
  })
}

export async function sendPaymentReminder(studentEmail: string, studentName: string, amount: number, dueDate: string) {
  const subject = "Recordatorio de Pago - Escuela de Fútbol"
  const content = `
    Hola ${studentName},
    
    Te recordamos que tienes una cuota pendiente de pago:
    - Monto: $${amount.toLocaleString()}
    - Fecha de vencimiento: ${dueDate}
    
    Puedes realizar el pago desde tu panel de usuario.
    
    Saludos,
    Escuela de Fútbol
  `

  return await sendEmail(studentEmail, subject, content)
}
