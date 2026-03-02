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

// Create a visitor notification card
export function createVisitorNotificationCard(params: {
  visitorName: string
  visitorCompany?: string
  purpose: string
  employeeName: string
  meetingRoom?: string
  scheduledAt?: string
  appointmentId: string
}) {
  return {
    cardsV2: [{
      cardId: `visitor-${params.appointmentId}`,
      card: {
        header: {
          title: '🏢 来訪者のお知らせ',
          subtitle: `${params.visitorName}様${params.visitorCompany ? ` (${params.visitorCompany})` : ''} がお越しです`,
          imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/person/default/48px.svg',
          imageType: 'CIRCLE',
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
              ...(params.meetingRoom ? [{
                decoratedText: {
                  topLabel: '会議室',
                  text: params.meetingRoom,
                  startIcon: { knownIcon: 'HOTEL_CLASS' },
                },
              }] : []),
              ...(params.scheduledAt ? [{
                decoratedText: {
                  topLabel: '予定時刻',
                  text: params.scheduledAt,
                  startIcon: { knownIcon: 'CLOCK' },
                },
              }] : []),
            ],
          },
          {
            widgets: [{
              buttonList: {
                buttons: [
                  {
                    text: '✅ 向かいます',
                    onClick: {
                      action: {
                        function: 'respond',
                        parameters: [
                          { key: 'appointmentId', value: params.appointmentId },
                          { key: 'response', value: 'on_my_way' },
                        ],
                      },
                    },
                  },
                  {
                    text: '⏳ 少々お待ちください',
                    onClick: {
                      action: {
                        function: 'respond',
                        parameters: [
                          { key: 'appointmentId', value: params.appointmentId },
                          { key: 'response', value: 'please_wait' },
                        ],
                      },
                    },
                  },
                ],
              },
            }],
          },
        ],
      },
    }],
  }
}
