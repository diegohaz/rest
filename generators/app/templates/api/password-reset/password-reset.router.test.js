import test from 'ava'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import nock from 'nock'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import express from '../../config/express'
import { masterKey } from '../../config'
import { User } from '../user'
import routes, { PasswordReset } from '.'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  const user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
  const passwordReset = await PasswordReset.create({ user })
  t.context = { ...t.context, user, passwordReset }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), PasswordReset.remove()])
})

test.serial('POST /password-resets 202 (master)', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  const { status } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', link: 'http://example.com' })
  t.true(status === 202)
})

test.serial('POST /password-resets 400 (master) - invalid email', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', link: 'http://example.com' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /password-resets 400 (master) - missing email', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, link: 'http://example.com' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /password-resets 400 (master) - missing link', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'link')
})

test.serial('POST /password-resets 404 (master)', async (t) => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'b@b.com', link: 'http://example.com' })
  t.true(status === 404)
})

test.serial('POST /password-resets 401', async (t) => {
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
  const { status } = await request(app())
    .post('/')
    .send({ email: 'a@a.com', link: 'http://example.com' })
  t.true(status === 401)
})

test.serial('GET /password-resets/:token 200', async (t) => {
  const { user, passwordReset } = t.context
  const { status, body } = await request(app()).get(`/${passwordReset.token}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(typeof body.token === 'string')
  t.true(typeof body.user === 'object')
  t.true(body.user.id === user.id)
})

test.serial('GET /password-resets/:token 404', async (t) => {
  const { status } = await request(app()).get('/123')
  t.true(status === 404)
})

test.serial('PUT /password-resets/:token 200', async (t) => {
  const { passwordReset, user } = t.context
  await PasswordReset.create({ user })
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
    .send({ password: '654321' })
  const [ updatedUser, passwordResets ] = await Promise.all([
    User.findById(passwordReset.user.id),
    PasswordReset.find({})
  ])
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === user.id)
  t.true(passwordResets.length === 0)
  t.notThrows(updatedUser.authenticate('654321'))
})

test.serial('PUT /password-resets/:token 400 - invalid password', async (t) => {
  const { passwordReset } = t.context
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
    .send({ password: '321' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('PUT /password-resets/:token 400 - missing password', async (t) => {
  const { passwordReset } = t.context
  const { status, body } = await request(app())
    .put(`/${passwordReset.token}`)
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('PUT /password-resets/:token 404', async (t) => {
  const { status } = await request(app())
    .put('/123')
    .send({ password: '654321' })
  t.true(status === 404)
})
