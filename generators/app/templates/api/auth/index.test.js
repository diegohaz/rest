<%_ if (authServices.length) { _%>
import { stub } from 'sinon'
<%_ } _%>
import request from 'supertest'
<%_ if (passwordSignup) { _%>
import { masterKey, apiRoot } from '../../config'
import { User } from '../user'
<%_ } else { _%>
import { apiRoot } from '../../config'
<%_ } _%>
import { verify } from '../../services/jwt'
<%_ authServices.forEach(function(service) { _%>
import * as <%= service %> from '../../services/<%= service %>'
<%_ }) _%>
import express from '../../services/express'
import routes from '.'

const app = () => express(apiRoot, routes)
<%_ if (passwordSignup) { _%>

let user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
})

test('POST /auth 201 (master)', async () => {
  const { status, body } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
    .auth('a@a.com', '123456')
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(typeof body.token).toBe('string')
  expect(typeof body.user).toBe('object')
  expect(body.user.id).toBe(user.id)
  expect(await verify(body.token)).toBeTruthy()
})

test('POST /auth 400 (master) - invalid email', async () => {
  const { status, body } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
    .auth('invalid', '123456')
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /auth 400 (master) - invalid password', async () => {
  const { status, body } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
    .auth('a@a.com', '123')
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('POST /auth 401 (master) - user does not exist', async () => {
  const { status } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
    .auth('b@b.com', '123456')
  expect(status).toBe(401)
})

test('POST /auth 401 (master) - wrong password', async () => {
  const { status } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
    .auth('a@a.com', '654321')
  expect(status).toBe(401)
})

test('POST /auth 401 (master) - missing access_token', async () => {
  const { status } = await request(app())
    .post(apiRoot)
    .auth('a@a.com', '123456')
  expect(status).toBe(401)
})

test('POST /auth 401 (master) - missing auth', async () => {
  const { status } = await request(app())
    .post(apiRoot)
    .query({ access_token: masterKey })
  expect(status).toBe(401)
})
<%_ } _%>
<%_ authServices.forEach(function(service) { _%>

test('POST /auth/<%= service %> 201', async () => {
  stub(<%= service %>, 'getUser').value(() => Promise.resolve({
    service: '<%= service %>',
    id: '123',
    name: 'user',
    email: 'b@b.com',
    picture: 'test.jpg'
  }))
  const { status, body } = await request(app())
    .post(apiRoot + '/<%= service %>')
    .send({ access_token: '123' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(typeof body.token).toBe('string')
  expect(typeof body.user).toBe('object')
  expect(await verify(body.token)).toBeTruthy()
})

test('POST /auth/<%= service %> 401 - missing token', async () => {
  const { status } = await request(app())
    .post(apiRoot + '/<%= service %>')
  expect(status).toBe(401)
})
<%_ }) _%>
