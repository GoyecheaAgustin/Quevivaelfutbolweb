import html2pdf from "html2pdf.js"

interface PaymentReceiptData {
  receiptId: string
  studentName: string
  studentId: string
  amount: number
  currency: string
  paymentDate: string
  dueDate: string
  period: string
  status: string
  notes?: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
}

interface CertificateData {
  studentName: string
  courseName: string
  completionDate: string
  instructorName: string
  schoolName: string
  schoolLogoUrl?: string
}

export async function generatePaymentReceipt(data: PaymentReceiptData): Promise<Blob> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Recibo de Pago</h2>
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="/public/images/logo-oficial.png" alt="${data.schoolName} Logo" style="max-width: 100px; margin-bottom: 10px;">
        <p style="margin: 0; font-size: 14px; color: #555;">${data.schoolName}</p>
        <p style="margin: 0; font-size: 12px; color: #777;">${data.schoolAddress} | ${data.schoolPhone} | ${data.schoolEmail}</p>
      </div>
      
      <p style="font-size: 14px; color: #555;"><strong>Recibo #:</strong> ${data.receiptId}</p>
      <p style="font-size: 14px; color: #555;"><strong>Fecha de Pago:</strong> ${data.paymentDate}</p>
      
      <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Detalles del Estudiante</h3>
      <p style="font-size: 14px; color: #555;"><strong>Nombre:</strong> ${data.studentName}</p>
      <p style="font-size: 14px; color: #555;"><strong>ID Estudiante:</strong> ${data.studentId}</p>
      
      <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Detalles del Pago</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; font-weight: bold;">Monto:</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.currency} ${data.amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; font-weight: bold;">Período:</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.period}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; font-weight: bold;">Fecha de Vencimiento:</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.dueDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; font-weight: bold;">Estado:</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.status}</td>
        </tr>
      </table>
      
      ${data.notes ? `<p style="font-size: 14px; color: #555;"><strong>Notas:</strong> ${data.notes}</p>` : ""}
      
      <p style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">Gracias por tu pago.</p>
    </div>
  `

  const options = {
    margin: 10,
    filename: `recibo-${data.receiptId}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  }

  const pdf = html2pdf().set(options).from(htmlContent)
  return pdf.output("blob")
}

export async function generateCertificate(data: CertificateData): Promise<Blob> {
  const htmlContent = `
    <div style="font-family: 'Times New Roman', serif; padding: 50px; text-align: center; border: 5px solid #000; max-width: 800px; margin: auto; background: url('/placeholder.svg?height=800&width=600') no-repeat center center; background-size: cover;">
      ${data.schoolLogoUrl ? `<img src="${data.schoolLogoUrl}" alt="${data.schoolName} Logo" style="max-width: 150px; margin-bottom: 30px;">` : ""}
      <h1 style="font-size: 48px; color: #333; margin-bottom: 20px;">Certificado de Finalización</h1>
      <p style="font-size: 24px; margin-bottom: 10px;">Este certificado es otorgado a</p>
      <h2 style="font-size: 40px; color: #007bff; margin-bottom: 30px; text-transform: uppercase;">${data.studentName}</h2>
      <p style="font-size: 24px; margin-bottom: 10px;">Por haber completado exitosamente el curso de</p>
      <h3 style="font-size: 32px; color: #555; margin-bottom: 30px;">"${data.courseName}"</h3>
      <p style="font-size: 20px; margin-bottom: 10px;">En reconocimiento a su dedicación y esfuerzo.</p>
      <p style="font-size: 20px; margin-bottom: 40px;">Otorgado el ${data.completionDate}</p>
      
      <div style="display: flex; justify-content: space-around; margin-top: 50px;">
        <div style="text-align: center;">
          <p style="border-top: 1px solid #000; padding-top: 5px; font-size: 18px;">${data.instructorName}</p>
          <p style="font-size: 16px; color: #777;">Instructor</p>
        </div>
        <div style="text-align: center;">
          <p style="border-top: 1px solid #000; padding-top: 5px; font-size: 18px;">${data.schoolName}</p>
          <p style="font-size: 16px; color: #777;">Institución</p>
        </div>
      </div>
    </div>
  `

  const options = {
    margin: 10,
    filename: `certificado-${data.studentName.replace(/\s/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true }, // useCORS es importante para imágenes externas
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  }

  const pdf = html2pdf().set(options).from(htmlContent)
  return pdf.output("blob")
}

export async function downloadPdf(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Limpiar el objeto URL
  } catch (error) {
    console.error("Error downloading PDF:", error)
    throw new Error("Failed to download PDF.")
  }
}
