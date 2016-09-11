<%_ var emailSignup = authMethods.indexOf('email') !== -1 _%>
import test from 'ava'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { masterKey } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import routes, { User } from '.'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  const [ user1, user2, admin ] = await User.create([
    { name: 'user', email: 'a@a.com', password: '123456' },
    { name: 'user', email: 'b@b.com', password: '123456' },
    { email: 'c@c.com', password: '123456', role: 'admin' }
  ])
  const [ session1, session2, adminSession ] = [
    signSync(user1.id),
    signSync(user2.id),
    signSync(admin.id)
  ]
  t.context = { ...t.context, user1, user2, session1, session2, adminSession }
})

test.afterEach.always(async (t) => {
  await User.remove()
})

test.serial('GET /users 200 (admin)', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: t.context.adminSession })
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /users?page=2&limit=1 200 (admin)', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: t.context.adminSession, page: 2, limit: 1 })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /users?q=user 200 (admin)', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: t.context.adminSession, q: 'user' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 2)
})

test.serial('GET /users?fields=name 200 (admin)', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: t.context.adminSession, fields: 'name' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.deepEqual(Object.keys(body[0]), ['id', 'name'])
})

test.serial('GET /users 401 (user)', async (t) => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: t.context.session1 })
  t.true(status === 401)
})

test.serial('GET /users 401', async (t) => {
  const { status } = await request(app())
    .get('/')
  t.true(status === 401)
})

test.serial('GET /users/me 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: t.context.session1 })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === t.context.user1.id)
})

test.serial('GET /users/me 401', async (t) => {
  const { status } = await request(app())
    .get('/me')
  t.true(status === 401)
})

test.serial('GET /users/:id 200', async (t) => {
  const { status, body } = await request(app())
    .get(`/${t.context.user1.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === t.context.user1.id)
})

test.serial('GET /users/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('POST /users 201 (master)', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.email === 'd@d.com')
})

test.serial('POST /users 201 (master)', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'user' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.email === 'd@d.com')
})

test.serial('POST /users 201 (master)', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'admin' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.email === 'd@d.com')
})

test.serial('POST /users 409 (master) - duplicated email', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', password: '123456' })
  t.true(status === 409)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /users 400 (master) - invalid email', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', password: '123456' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /users 400 (master) - missing email', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, password: '123456' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

<%_ if (emailSignup) { _%>
test.serial('POST /users 400 (master) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('POST /users 400 (master) - missing password', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

<%_ } _%>
test.serial('POST /users 400 (master) - invalid role', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'invalid' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'role')
})

test.serial('POST /users 401 (admin)', async (t) => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: t.context.adminSession, email: 'd@d.com', password: '123456' })
  t.true(status === 401)
})

test.serial('POST /users 401 (user)', async (t) => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: t.context.session1, email: 'd@d.com', password: '123456' })
  t.true(status === 401)
})

test.serial('POST /users 401', async (t) => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'd@d.com', password: '123456' })
  t.true(status === 401)
})

test.serial('PUT /users/me 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: t.context.session1, name: 'test' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.name === 'test')
})

test.serial('PUT /users/me 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: t.context.session1, email: 'test@test.com' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.email === 'a@a.com')
})

test.serial('PUT /users/me 401', async (t) => {
  const { status } = await request(app())
    .put('/me')
    .send({ name: 'test' })
  t.true(status === 401)
})

test.serial('PUT /users/:id 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put(`/${t.context.user1.id}`)
    .send({ access_token: t.context.session1, name: 'test' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.name === 'test')
})

test.serial('PUT /users/:id 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put(`/${t.context.user1.id}`)
    .send({ access_token: t.context.session1, email: 'test@test.com' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.email === 'a@a.com')
})

test.serial('PUT /users/:id 200 (admin)', async (t) => {
  const { status, body } = await request(app())
    .put(`/${t.context.user1.id}`)
    .send({ access_token: t.context.adminSession, name: 'test' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.name === 'test')
})

test.serial('PUT /users/:id 401 (user) - another user', async (t) => {
  const { status } = await request(app())
    .put(`/${t.context.user1.id}`)
    .send({ access_token: t.context.session2, name: 'test' })
  t.true(status === 401)
})

test.serial('PUT /users/:id 401', async (t) => {
  const { status } = await request(app())
    .put(`/${t.context.user1.id}`)
    .send({ name: 'test' })
  t.true(status === 401)
})

test.serial('PUT /users/:id 404 (admin)', async (t) => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: t.context.adminSession, name: 'test' })
  t.true(status === 404)
})

<%_ if (emailSignup) { _%>
const passwordMatch = async (password, userId) => {
  const user = await User.findById(userId)
  return !!await user.authenticate(password)
}

test.serial('PUT /users/me/password 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.email === 'a@a.com')
  t.true(await passwordMatch('654321', body.id))
})

test.serial('PUT /users/me/password 400 (user) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('PUT /users/me/password 401 (user) - invalid authentication method', async (t) => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ access_token: t.context.session1, password: '654321' })
  t.true(status === 401)
})

test.serial('PUT /users/me/password 401', async (t) => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ password: '654321' })
  t.true(status === 401)
})

test.serial('PUT /users/:id/password 200 (user)', async (t) => {
  const { status, body } = await request(app())
    .put(`/${t.context.user1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.email === 'a@a.com')
  t.true(await passwordMatch('654321', body.id))
})

test.serial('PUT /users/:id/password 400 (user) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .put(`/${t.context.user1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('PUT /users/:id/password 401 (user) - another user', async (t) => {
  const { status } = await request(app())
    .put(`/${t.context.user1.id}/password`)
    .auth('b@b.com', '123456')
    .send({ password: '654321' })
  t.true(status === 401)
})

test.serial('PUT /users/:id/password 401 (user) - invalid authentication method', async (t) => {
  const { status } = await request(app())
    .put(`/${t.context.user1.id}/password`)
    .send({ access_token: t.context.session1, password: '654321' })
  t.true(status === 401)
})

test.serial('PUT /users/:id/password 401', async (t) => {
  const { status } = await request(app())
    .put(`/${t.context.user1.id}/password`)
    .send({ password: '654321' })
  t.true(status === 401)
})

test.serial('PUT /users/:id/password 404 (user)', async (t) => {
  const { status } = await request(app())
    .put('/123456789098765432123456/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  t.true(status === 404)
})

<%_ } _%>
test.serial('DELETE /users/:id 204 (admin)', async (t) => {
  const { status } = await request(app())
    .delete(`/${t.context.user1.id}`)
    .send({ access_token: t.context.adminSession })
  t.true(status === 204)
})

test.serial('DELETE /users/:id 401 (user)', async (t) => {
  const { status } = await request(app())
    .delete(`/${t.context.user1.id}`)
    .send({ access_token: t.context.session1 })
  t.true(status === 401)
})

test.serial('DELETE /users/:id 401', async (t) => {
  const { status } = await request(app())
    .delete(`/${t.context.user1.id}`)
  t.true(status === 401)
})

test.serial('DELETE /users/:id 404 (admin)', async (t) => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .send({ access_token: t.context.adminSession })
  t.true(status === 404)
})
