import { google } from 'googleapis'

export function getGoogleCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: 'v3', auth })
}

export async function createCalendarEvent(accessToken: string, params: {
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
  calendarId?: string
  location?: string
}) {
  const calendar = getGoogleCalendarClient(accessToken)
  const event = await calendar.events.insert({
    calendarId: params.calendarId || 'primary',
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startTime.toISOString() },
      end: { dateTime: params.endTime.toISOString() },
      attendees: params.attendees?.map(email => ({ email })),
      location: params.location,
    },
  })
  return event.data
}

export async function listCalendarEvents(accessToken: string, params: {
  calendarId?: string
  timeMin: Date
  timeMax: Date
}) {
  const calendar = getGoogleCalendarClient(accessToken)
  const events = await calendar.events.list({
    calendarId: params.calendarId || 'primary',
    timeMin: params.timeMin.toISOString(),
    timeMax: params.timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })
  return events.data.items || []
}

export async function deleteCalendarEvent(accessToken: string, eventId: string, calendarId = 'primary') {
  const calendar = getGoogleCalendarClient(accessToken)
  await calendar.events.delete({ calendarId, eventId })
}
