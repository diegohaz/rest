import nock from 'nock'
import * as facebook from './'

describe('Facebook Service', function () {
  it('should get user info', function () {
    nock.restore() && nock.isActive() || nock.activate()
    nock('https://graph.facebook.com').get('/me').query(true).reply(200, {
      id: '123',
      name: 'Test name',
      email: 'email@example.com',
      picture: { data: { url: 'test.jpg' } }
    })

    return facebook
      .getMe({ accessToken: '123', fields: 'id, name, email, picture' })
      .then((user) => {
        expect(user).to.have.property('id', '123')
        expect(user).to.have.property('name', 'Test name')
        expect(user).to.have.property('email', 'email@example.com')
        expect(user).to.have.property('picture')
      })
  })
})
