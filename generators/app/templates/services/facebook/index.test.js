import nock from 'nock'
import * as facebook from '.'

it('parses facebook user', async () => {
  const fbUser = {
    id: '123',
    name: 'Test name',
    email: 'email@example.com',
    picture: { data: { url: 'test.jpg' } }
  }

  nock('https://graph.facebook.com').get('/me').query(true).reply(200, fbUser)

  const data = await facebook.getUser('123')
  expect(data.service).toBe('facebook')
  expect(data.id).toBe(fbUser.id)
  expect(data.name).toBe(fbUser.name)
  expect(data.email).toBe(fbUser.email)
  expect(data.picture).toBe(fbUser.picture.data.url)
})
