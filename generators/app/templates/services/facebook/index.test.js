import test from 'ava'
import nock from 'nock'
import * as facebook from '.'

test('getUser', async (t) => {
  const fbUser = {
    id: '123',
    name: 'Test name',
    email: 'email@example.com',
    picture: { data: { url: 'test.jpg' } }
  }

  nock('https://graph.facebook.com').get('/me').query(true).reply(200, fbUser)

  const data = await facebook.getUser('123')
  t.true(data.service === 'facebook')
  t.true(data.id === fbUser.id)
  t.true(data.name === fbUser.name)
  t.true(data.email === fbUser.email)
  t.true(data.picture === fbUser.picture.data.url)
})
