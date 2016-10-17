import nock from 'nock'
import * as sendgrid from '.'

it('sends mail', async () => {
  nock('https://api.sendgrid.com')
    .filteringRequestBody(() => '*')
    .post('/v3/mail/send', '*')
    .reply(202)

  const response = await sendgrid.sendMail({
    toMail: 'test',
    subject: 'Test',
    content: '<h1>Just Testing</h1>'
  })

  expect(response.statusCode).toBe(202)
})
