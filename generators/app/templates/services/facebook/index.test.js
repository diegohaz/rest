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
  expect(data.service).toEqual('facebook')
  expect(data.id).toEqual(fbUser.id)
  expect(data.name).toEqual(fbUser.name)
  expect(data.email).toEqual(fbUser.email)
  expect(data.picture).toEqual(fbUser.picture.data.url)
})
