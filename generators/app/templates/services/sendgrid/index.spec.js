import nock from 'nock'
import * as sendgrid from './'

describe('Sendgrid Service', function () {
  it('should send email', function () {
    nock.restore() && nock.isActive() || nock.activate()
    nock('https://api.sendgrid.com')
      .filteringRequestBody(() => '*')
      .post('/v3/mail/send', '*')
      .reply(202)

    return sendgrid.sendMail({
      toEmail: 'test',
      subject: 'Test',
      content: '<h1>Just Testing</h1>'
    }).then((res) => {
      expect(res).to.have.property('statusCode', 202)
    })
  })
})
