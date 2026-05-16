function pad(n: number) { return String(n).padStart(2, '0') }

function toICS(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

export function downloadICS(params: {
  title: string
  description: string
  location: string
  start: Date
  end: Date
}) {
  const uid = `${Date.now()}@theclass.it`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//the Class//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(params.start)}`,
    `DTEND:${toICS(params.end)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
    `LOCATION:${params.location}`,
    'STATUS:TENTATIVE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `${params.title.replace(/\s+/g, '_')}.ics` })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(params: {
  title: string
  details: string
  location: string
  start: Date
  end: Date
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    details: params.details,
    location: params.location,
    dates: `${fmt(params.start)}/${fmt(params.end)}`,
  })
  return `https://calendar.google.com/calendar/render?${q}`
}
