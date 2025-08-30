export function buildIcs({
  title,
  starts,
  durationMin,
}: { title: string; starts: Date; durationMin: number }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
  const end = new Date(starts.getTime() + durationMin * 60000)
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//dodoktora.co//PL
BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${fmt(new Date())}
DTSTART:${fmt(starts)}
DTEND:${fmt(end)}
SUMMARY:${title}
END:VEVENT
END:VCALENDAR`
}
