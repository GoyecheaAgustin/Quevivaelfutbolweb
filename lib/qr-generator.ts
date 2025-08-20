import QRCode from "qrcode"

export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generar el código QR como una URL de datos (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H", // Alto nivel de corrección de errores
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000", // Color de los módulos oscuros
        light: "#FFFFFF", // Color de los módulos claros
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code.")
  }
}

export async function downloadQRCode(dataUrl: string, filename = "qrcode.png") {
  try {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading QR code:", error)
    throw new Error("Failed to download QR code.")
  }
}

export async function shareQRCode(dataUrl: string, text = "Aquí está tu código QR") {
  try {
    if (navigator.share && navigator.canShare({ files: [] })) {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], "qrcode.png", { type: "image/png" })

      await navigator.share({
        files: [file],
        title: "Código QR",
        text: text,
      })
    } else {
      console.warn("Web Share API no soportada o no puede compartir archivos.")
      // Fallback: abrir en una nueva ventana o copiar al portapapeles
      window.open(dataUrl, "_blank")
    }
  } catch (error) {
    console.error("Error sharing QR code:", error)
    throw new Error("Failed to share QR code.")
  }
}
