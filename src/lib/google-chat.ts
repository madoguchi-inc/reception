interface ChatMessage {
  text?: string
  cards?: any[]
  cardsV2?: any[]
}

// Send message via webhook
export async function sendWebhookMessage(webhookUrl: string, message: ChatMessage) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })
  if (!res.ok) throw new Error(`Google Chat webhook failed: ${res.status}`)
  return res.json()
}

// Create a visitor notification card (no buttons - webhook doesn't support interactive)
export function createVisitorNotificationCard(params: {
  visitorName: string
  visitorCompany?: string
  purpose: string
  employeeName: string
  appointmentId: string
}) {
  const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })

  return {
    text: `🏢 来訪通知: ${params.visitorName}様がお越しです`,
    cardsV2: [{
      cardId: `visitor-${params.appointmentId}`,
      card: {
        header: {
          title: '🏢 来訪者のお知らせ',
          subtitle: `${params.visitorName}様${params.visitorCompany ? ` (${params.visitorCompany})` : ''} がお越しです`,
        },
        sections: [
          {
            widgets: [
              {
                decoratedText: {
                  topLabel: '訪問者',
                  text: `${params.visitorName}${params.visitorCompany ? ` (${params.visitorCompany})` : ''}`,
                  startIcon: { knownIcon: 'PERSON' },
                },
              },
              {
                decoratedText: {
                  topLabel: '訪問目的',
                  text: params.purpose,
                  startIcon: { knownIcon: 'DESCRIPTION' },
                },
              },
              {
                decoratedText: {
                  topLabel: '担当者',
                  text: params.employeeName,
                  startIcon: { knownIcon: 'MEMBERSHIP' },
                },
              },
              {
                decoratedText: {
                  topLabel: '受付時刻',
                  text: time,
                  startIcon: { knownIcon: 'CLOCK' },
                },
              },
            ],
          },
        ],
      },
    }],
  }
}
