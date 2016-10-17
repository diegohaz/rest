import request from 'supertest-as-promised'
import nock from 'nock'
import express from '../../config/express'
import { masterKey } from '../../config'
import { User } from '../user'
import routes, { PasswordReset } from '.'

const app = () => express(routes)

let user, passwordReset

beforeEach(async () => {
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  user = await User.create({ email: 'a@a.com', password: '123456' })
  passwordReset = await PasswordReset.create({ user })
})

afterEach(() => {
  nock.restore()
})

test('POST /password-resets 202 (master)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', link: 'http://example.com' })
  expect(status).toEqual(202)
})

test('POST /password-resets 400 (master) - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', link: 'http://example.com' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('email')
})

test('POST /password-resets 400 (master) - missing email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, link: 'http://example.com' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('email')
})

test('POST /password-resets 400 (master) - missing link', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('link')
})

test('POST /password-resets 404 (master)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'b@b.com', link: 'http://example.com' })
  expect(status).toEqual(404)
})

test('POST /password-resets 401', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'a@a.com', link: 'http://example.com' })
  expect(status).toEqual(401)
})

test('GET /password-resets/:token 200', async () => {
  const { status, body } = await request(app()).get(`/${passwordReset.token}`)
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(typeof body.token).toEqual('string')
  expect(typeof body.user).toEqual('object')
  expect(body.user.id).toEqual(user.id)
})

test('GET /password-resets/:token 404', async () => {
  const { status } = await request(app()).get('/123')
  expect(status).toEqual(404)
})

test('PUT /password-resets/:token 200', async () => {
  await PasswordReset.create({ user })
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
    .send({ password: '654321' })
  const [ updatedUser, passwordResets ] = await Promise.all([
    User.findById(passwordReset.user.id),
    PasswordReset.find({})
  ])
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(user.id)
  expect(passwordResets.length).toEqual(0)
  expect(await updatedUser.authenticate('123456')).toBeFalsy()
  expect(await updatedUser.authenticate('654321')).toBeTruthy()
})

test('PUT /password-resets/:token 400 - invalid password', async () => {
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
    .send({ password: '321' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('PUT /password-resets/:token 400 - missing password', async () => {
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('PUT /password-resets/:token 404', async () => {
  const { status } = await request(app())
    .put('/123')
    .send({ password: '654321' })
  expect(status).toEqual(404)
})
