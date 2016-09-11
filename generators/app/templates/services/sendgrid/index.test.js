import test from 'ava'
import nock from 'nock'
import * as sendgrid from '.'

test('sendMail', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com')
    .filteringRequestBody(() => '*')
    .post('/v3/mail/send', '*')
    .reply(202)

  const response = await sendgrid.sendMail({
    toMail: 'test',
    subject: 'Test',
    content: '<h1>Just Testing</h1>'
  })

  t.true(response.statusCode === 202)
})
