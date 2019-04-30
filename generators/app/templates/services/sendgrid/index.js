import sendgridMail from '@sendgrid/mail'
import { sendgridKey, defaultEmail } from '../../config'

sendgridMail.setApiKey(sendgridKey)

export const sendMail = ({
  fromEmail = defaultEmail,
  toEmail,
  subject,
  content
}) => {
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject,
    html: content
  }
  return sendgridMail.send(msg)
}
