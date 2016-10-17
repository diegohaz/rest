import nock from 'nock'
import * as google from '.'

it('parses google user', async () => {
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
  expect(data.service).toEqual('google')
  expect(data.id).toEqual(ggUser.id)
  expect(data.name).toEqual(ggUser.name)
  expect(data.email).toEqual(ggUser.email)
  expect(data.picture).toEqual(ggUser.picture)
})
