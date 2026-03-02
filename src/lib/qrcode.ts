import QRCode from 'qrcode'

export async function generateQRCodeDataUrl(data: string, options?: {
  width?: number
  margin?: number
  color?: { dark?: string; light?: string }
}): Promise<string> {
  return QRCode.toDataURL(data, {
    width: options?.width || 300,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#ffffff',
    },
    errorCorrectionLevel: 'M',
  })
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}
