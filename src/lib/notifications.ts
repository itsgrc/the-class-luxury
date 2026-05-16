import { safeAppend } from './errorHandler'

export interface AppNotification {
  id: string
  type: 'email' | 'sms'
  to: string
  subject: string
  body: string
  timestamp: number
}

function mkId() {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function send(type: 'email' | 'sms', to: string, subject: string, body: string) {
  const n: AppNotification = { id: mkId(), type, to, subject, body, timestamp: Date.now() }
  safeAppend('theclass_notifications', n)
  console.info(`%c[theclass:${type}]`, 'color:#C5A059;font-weight:bold', `→ ${to}`, subject || '', '\n' + body)
}

export function notifyRequestReceived(name: string, email: string, requestId: string, title: string) {
  send('email', email,
    `Richiesta ricevuta – the Class [${requestId}]`,
    `Gentile ${name},\n\nAbbiamo ricevuto la tua richiesta per "${title}".\nID: ${requestId}\n\nTi risponderemo entro 2 ore.\n\nthe Class – L'arte del viaggio senza confini`)
  send('sms', email,
    '',
    `the Class: richiesta ${requestId} ricevuta. Risponderemo entro 2h.`)
}

export function notifyStatusChange(email: string, requestId: string, status: string) {
  send('email', email,
    `Aggiornamento richiesta [${requestId}]`,
    `La tua richiesta ${requestId} è aggiornata a: "${status}".\nAccedi al tuo profilo per i dettagli.`)
}

export function notifyAdmin(requestId: string, type: string, summary: string) {
  send('email', 'admin@theclass.it', `Nuova ${type} [${requestId}]`, summary)
}
