interface EmailOptions {
  to: string
  subject: string
  body: string
}

interface WhatsAppOptions {
  to: string // Número de teléfono con código de país (ej: +54911...)
  message: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  console.log(`Simulando envío de email a: ${options.to}`)
  console.log(`Asunto: ${options.subject}`)
  console.log(`Cuerpo: ${options.body.substring(0, 100)}...`)

  // Simulación de una API de envío de email
  return new Promise((resolve) => {
    setTimeout(() => {
      if (options.to.includes("@") && options.subject && options.body) {
        console.log(`✅ Email enviado a ${options.to}`)
        resolve({ success: true, message: `Email enviado a ${options.to}` })
      } else {
        console.error(`❌ Fallo al enviar email a ${options.to}: Datos incompletos o inválidos.`)
        resolve({ success: false, message: "Datos de email incompletos o inválidos." })
      }
    }, 1000) // Simula un retraso de red
  })
}

export async function sendWhatsApp(options: WhatsAppOptions): Promise<{ success: boolean; message: string }> {
  console.log(`Simulando envío de WhatsApp a: ${options.to}`)
  console.log(`Mensaje: ${options.message.substring(0, 100)}...`)

  // Simulación de una API de envío de WhatsApp (ej. Twilio, MessageBird)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Validación básica del número de teléfono
      const phoneRegex = /^\+\d{10,15}$/ // Ejemplo: +54911...
      if (phoneRegex.test(options.to) && options.message) {
        console.log(`✅ WhatsApp enviado a ${options.to}`)
        resolve({ success: true, message: `WhatsApp enviado a ${options.to}` })
      } else {
        console.error(`❌ Fallo al enviar WhatsApp a ${options.to}: Número o mensaje inválido.`)
        resolve({ success: false, message: "Número de WhatsApp o mensaje inválido." })
      }
    }, 1200) // Simula un retraso de red
  })
}

export async function sendPaymentReminder(
  studentName: string,
  studentEmail: string,
  amount: number,
  dueDate: string,
): Promise<void> {
  const subject = `Recordatorio de Pago - ${studentName}`
  const body = `Hola ${studentName},\n\nEste es un recordatorio de que tu pago de ${amount} USD vence el ${dueDate}.\n\nPor favor, realiza el pago a tiempo para evitar recargos.\n\nGracias,\nTu Escuela de Fútbol`

  await sendEmail({ to: studentEmail, subject, body })
  // Opcional: enviar también por WhatsApp si se tiene el número
  // await sendWhatsApp({ to: studentWhatsAppNumber, message: `Hola ${studentName}, tu pago de ${amount} USD vence el ${dueDate}.` });
}

export async function sendWelcomeMessage(studentName: string, studentEmail: string): Promise<void> {
  const subject = `¡Bienvenido a Que Viva El Fútbol, ${studentName}!`
  const body = `Hola ${studentName},\n\n¡Bienvenido a la familia de Que Viva El Fútbol! Estamos emocionados de tenerte con nosotros.\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\nSaludos,\nEl equipo de Que Viva El Fútbol`

  await sendEmail({ to: studentEmail, subject, body })
}

export async function sendPaymentConfirmation(
  studentName: string,
  studentEmail: string,
  amount: number,
  receiptId: string,
): Promise<void> {
  const subject = `Confirmación de Pago - Recibo #${receiptId}`
  const body = `Hola ${studentName},\n\nConfirmamos la recepción de tu pago de ${amount} USD. Tu recibo es el #${receiptId}.\n\nGracias por tu pago.\n\nSaludos,\nEl equipo de Que Viva El Fútbol`

  await sendEmail({ to: studentEmail, subject, body })
}
