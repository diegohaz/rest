import Promise from 'bluebird'
import request from 'supertest-as-promised'
import nock from 'nock'
import app from '../..'
import User from '../user/user.model'
import PasswordReset from './password-reset.model'

describe('PasswordReset API', function () {
  let user

  beforeEach(function () {
    return User.create({ email: 'a@a.com', password: '123456' }).then((u) => {
      user = u
      return null
    })
  })

  afterEach(function () {
    return Promise.each([User, PasswordReset], (model) => model.remove())
  })

  describe('POST /password-resets', function () {
    it('should respond 202 when user email is registered', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ email: 'a@a.com', link: 'http://example.com' })
        .expect(202)
    })

    it('should fail 400 when email was not sent', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ link: 'http://example.com' })
        .expect(400)
    })

    it('should fail 400 when link was not sent', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ email: 'a@a.com' })
        .expect(400)
    })

    it('should fail 404 when user email is not registered', function () {
      return request(app)
        .post('/password-resets')
        .send({ email: 'b@b.com', link: 'http://example.com' })
        .expect(404)
    })
  })

  describe('GET /password-resets/:token', function () {
    it('should respond with the password reset entity', function () {
      return PasswordReset.create({ user }).then((passwordReset) => {
        return request(app)
          .get('/password-resets/' + passwordReset.token)
          .expect(200)
      }).then(({ body }) => {
        expect(body).to.have.deep.property('user.id', user.id)
        expect(body).to.have.property('token')
      })
    })

    it('should fail 404 when token does not exist', function () {
      return request(app)
        .get('/password-resets/123')
        .expect(404)
    })
  })

  describe('PUT /password-resets/:token', function () {
    let passwordReset

    beforeEach(function () {
      return PasswordReset.create({ user }).then((reset) => {
        passwordReset = reset
        return null
      })
    })

    it('should respond with the updated user and remove the token', function () {
      return request(app)
        .put('/password-resets/' + passwordReset.token)
        .send({ password: '654321' })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.property('id', user.id)
          return expect(PasswordReset.find({})).to.eventually.have.lengthOf(0)
        })
    })

    it('should respond with the updated user and remove all user tokens', function () {
      return PasswordReset.create({ user }).then((reset) => {
        return expect(PasswordReset.find({})).to.eventually.have.lengthOf(2)
      }).then(() => {
        return request(app)
          .put('/password-resets/' + passwordReset.token)
          .send({ password: '654321' })
          .expect(200)
      }).then(({ body }) => {
        expect(body).to.have.property('id', user.id)
        return expect(PasswordReset.find({})).to.eventually.have.lengthOf(0)
      })
    })

    it('should fail 400 when password was not sent', function () {
      return request(app)
        .put('/password-resets/' + passwordReset.token)
        .expect(400)
    })

    it('should fail 404 when token does not exist', function () {
      return request(app)
        .put('/password-resets/123')
        .send({ password: '654321' })
        .expect(404)
    })
  })
})
