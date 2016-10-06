import test from 'ava'
import nock from 'nock'
import * as google from '.'

test('getUser', async (t) => {
  const ggUser = {
    id: '123',
	email: 'email@example.com',
    verified_email: true,
    name: 'Test name',
	given_name: 'Test',
	family_name: 'Name',
	link: 'https://plus.google.com/123',
    picture: 'test.jpg'
  }

  nock('https://www.googleapis.com/userinfo/v2').get('/me').query(true).reply(200, ggUser)

  const data = await google.getUser('123')
  t.true(data.service === 'google')
  t.true(data.id === ggUser.id)
  t.true(data.name === ggUser.name)
  t.true(data.email === ggUser.email)
  t.true(data.picture === ggUser.picture)
})
