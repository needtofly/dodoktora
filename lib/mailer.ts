import nodemailer from 'nodemailer'

const enabled = !!process.env.SMTP_HOST

function getTransport() {
  if (!enabled) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    } : undefined,
  })
}

export async function sendBookingEmail({
  to,
  subject,
  text,
  ics,
}: { to: string; subject: string; text: string; ics?: { filename: string; content: string }}) {
  const transporter = getTransport()
  if (!transporter) {
    console.log('[MAILER disabled] Would send:', { to, subject })
    return
  }
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@dodoktora.co',
    to,
    subject,
    text,
    attachments: ics ? [{ filename: ics.filename, content: ics.content, contentType: 'text/calendar' }] : undefined,
  })
}
