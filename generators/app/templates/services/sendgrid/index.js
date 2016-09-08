import sendgrid, { mail as helper } from 'sendgrid'
import { sendgridKey, defaultEmail } from '../../config'

export const sendMail = ({
  fromEmail = defaultEmail,
  toEmail,
  subject,
  content,
  contentType = 'text/html'
}) => {
  fromEmail = new helper.Email(fromEmail)
  toEmail = new helper.Email(toEmail)
  content = new helper.Content(contentType, content)
  const mail = new helper.Mail(fromEmail, subject, toEmail, content)
  const sg = sendgrid(sendgridKey)
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  })

  return sg.API(request)
}
