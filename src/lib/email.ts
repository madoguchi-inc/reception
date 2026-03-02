import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  })
}

export async function sendInvitationEmail(config: EmailConfig, params: {
  to: string
  visitorName: string
  hostName: string
  hostCompany: string
  scheduledAt: Date
  location: string
  qrCodeDataUrl: string
  meetingRoom?: string
  notes?: string
}) {
  const transporter = createTransporter(config)
  const formattedDate = params.scheduledAt.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  await transporter.sendMail({
    from: `"${params.hostCompany} 受付" <${config.from}>`,
    to: params.to,
    subject: `【ご来訪のご案内】${formattedDate} ${params.hostCompany}`,
    html: `
      <div style="font-family: 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">ご来訪のご案内</h2>
        <p>${params.visitorName} 様</p>
        <p>下記の通りご来訪をお待ちしております。</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; background: #f8fafc; font-weight: bold; width: 120px;">日時</td><td style="padding: 8px;">${formattedDate}</td></tr>
          <tr><td style="padding: 8px; background: #f8fafc; font-weight: bold;">場所</td><td style="padding: 8px;">${params.location}</td></tr>
          ${params.meetingRoom ? `<tr><td style="padding: 8px; background: #f8fafc; font-weight: bold;">会議室</td><td style="padding: 8px;">${params.meetingRoom}</td></tr>` : ''}
          <tr><td style="padding: 8px; background: #f8fafc; font-weight: bold;">担当者</td><td style="padding: 8px;">${params.hostName}</td></tr>
        </table>
        ${params.notes ? `<p style="color: #666;">${params.notes}</p>` : ''}
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 12px;">
          <p style="font-weight: bold; margin-bottom: 10px;">📱 受付用QRコード</p>
          <img src="${params.qrCodeDataUrl}" width="200" height="200" alt="受付QRコード" />
          <p style="font-size: 14px; color: #666; margin-top: 10px;">受付のタブレットでこのQRコードを読み取ってください</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">このメールは ${params.hostCompany} の受付システムから自動送信されています。</p>
      </div>
    `,
  })
}
