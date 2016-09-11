import test from 'ava'
import nock from 'nock'
import * as facebook from '.'

test('getMe', async (t) => {
  const fbUser = {
    id: '123',
    name: 'Test name',
    email: 'email@example.com',
    picture: { data: { url: 'test.jpg' } }
  }

  nock.restore() && nock.isActive() || nock.activate()
  nock('https://graph.facebook.com').get('/me').query(true).reply(200, fbUser)

  const data = await facebook.getMe({ accessToken: '123', fields: 'id, name, email, picture' })
  t.true(data.id === fbUser.id)
  t.true(data.name === fbUser.name)
  t.true(data.email === fbUser.email)
  t.true(data.picture.data.url === fbUser.picture.data.url)
})
