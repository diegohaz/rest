<%_ var emailSignup = authMethods.indexOf('email') !== -1 _%>
<%_ var facebookLogin = authMethods.indexOf('facebook') !== -1 _%>
import test from 'ava'
<%_ if (facebookLogin) { _%>
import nock from 'nock'
<%_ } _%>
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
<%_ if (emailSignup) { _%>
import { masterKey } from '../../config'
<%_ } _%>
import { verify } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import routes from '.'
import { User } from '../user'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  t.context.user = await User.create({ email: 'a@a.com', password: '123456' })
})

test.afterEach.always(async (t) => {
  await User.remove()
})
<%_ if (emailSignup) { _%>

test.serial('POST /auth 201 (master)', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '123456')
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(typeof body.token === 'string')
  t.true(typeof body.user === 'object')
  t.true(body.user.id === t.context.user.id)
  t.notThrows(verify(body.token))
})

test.serial('POST /auth 400 (master) - invalid email', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('invalid', '123456')
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /auth 400 (master) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '123')
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('POST /auth 400 (master) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '123')
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('POST /auth 401 (master) - user does not exist', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('b@b.com', '123456')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - wrong password', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '654321')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - missing access_token', async (t) => {
  const { status } = await request(app())
    .post('/')
    .auth('a@a.com', '123456')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - missing auth', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
  t.true(status === 401)
})
<%_ } _%>
<%_ if (facebookLogin) { _%>

test.serial('POST /auth/facebook 201', async (t) => {
  const fbUser = {
    id: '123',
    name: 'user',
    email: 'b@b.com',
    picture: { data: { url: 'test.jpg' } }
  }
  nock.restore() && nock.isActive() || nock.activate()
  nock('https://graph.facebook.com').get('/me').query(true).reply(200, fbUser)
  const { status, body } = await request(app())
    .post('/facebook')
    .send({ access_token: '123' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(typeof body.token === 'string')
  t.true(typeof body.user === 'object')
  t.notThrows(verify(body.token))
})

test.serial('POST /auth/facebook 401 - missing token', async (t) => {
  const { status } = await request(app()).post('/facebook')
  t.true(status === 401)
})
<%_ } _%>
