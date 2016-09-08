import Promise from 'bluebird'
import request from 'supertest-as-promised'
<%_ if (facebookLogin) { _%>
import nock from 'nock'
<%_ } _%>
import app from '../..'
import User from '../user/user.model'
import Session from './session.model'

describe('Session API', function () {
  let session1, session2, adminSession

  beforeEach(function () {
    return User
      .create([
        { email: 'a@a.com'<% if (emailSignup) { %>, password: '123456'<% } %> },
        { email: 'b@b.com'<% if (emailSignup) { %>, password: '123456'<% } %> },
        { email: 'c@c.com', role: 'admin'<% if (emailSignup) { %>, password: '123456'<% } %> }
      ])
      .then(([ u1, u2, admin ]) => {
        return Session.create([{ user: u1 }, { user: u2 }, { user: admin }])
      })
      .then((sessions) => {
        [ session1, session2, adminSession ] = sessions
        return null
      })
  })

  afterEach(function () {
    return Promise.each([User, Session], (model) => model.remove())
  })

  describe('GET /sessions', function () {
    it('should respond with array when authenticated as admin', function () {
      return request(app)
        .get('/sessions')
        .query({ access_token: adminSession.token })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.instanceOf(Array).and.have.lengthOf(3)
        })
    })

    it('should respond with array to query page when authenticated as admin', function () {
      return request(app)
        .get('/sessions')
        .query({ access_token: adminSession.token, page: 2, limit: 1 })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('should respond with array to query q when authenticated as admin', function () {
      return request(app)
        .get('/sessions')
        .query({ access_token: adminSession.token, q: 'a' })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('should respond with array to query user when authenticated as admin', function () {
      return request(app)
        .get('/sessions')
        .query({ access_token: adminSession.token, user: session1.user.id })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.instanceOf(Array).and.have.lengthOf(1)
          expect(body[0]).to.have.deep.property('user.id', session1.user.id)
        })
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .get('/sessions')
        .query({ access_token: session1.token })
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .get('/sessions')
        .expect(401)
    })
  })

<%_ if (emailSignup) {_%>
  describe('POST /sessions', function () {
    it('should respond with the logged session with registered user', function () {
      return request(app)
        .post('/sessions')
        .auth('a@a.com', '123456')
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.deep.property('user.id', session1.user.id)
          expect(body).to.have.property('token')
        })
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .post('/sessions')
        .expect(401)
    })
  })

<%_ } _%>
<%_ if (facebookLogin) {_%>
  describe('POST /sessions/facebook', function () {
    it('should respond with the logged session with registered facebook user', function () {
      const fbUser = {
        id: '123',
        name: 'name',
        email: 'test@example.com',
        picture: { data: { url: 'test.jpg' } }
      }

      nock.restore() && nock.isActive() || nock.activate()
      nock('https://graph.facebook.com').get('/me').query(true).reply(200, fbUser)

      return request(app)
        .post('/sessions/facebook')
        .query({ access_token: '123' })
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.deep.property('user.id')
          expect(body).to.have.property('token')
        })
    })

    it('should fail 401 when missing accessToken', function () {
      return request(app)
        .post('/sessions/facebook')
        .expect(401)
    })
  })

<%_ } _%>
  describe('DELETE /sessions', function () {
    it('should delete all sessions of the authenticated user', function () {
      return request(app)
        .delete('/sessions')
        .query({ access_token: session1.token })
        .expect(204)
        .then(() => {
          return expect(Session.find({ user: session1.user })).to.eventually.have.lengthOf(0)
        })
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .delete('/sessions')
        .expect(401)
    })
  })

  describe('DELETE /sessions/:token', function () {
    it('should not delete another user session when not authenticated', function () {
      return request(app)
        .delete('/sessions/' + adminSession.token)
        .expect(401)
    })

    it('should delete another user session when authenticated as admin', function () {
      return request(app)
        .delete('/sessions/' + session1.token)
        .query({ access_token: adminSession.token })
        .expect(204)
    })

    it('should fail 404 when session does not exit', function () {
      return request(app)
        .delete('/sessions/123')
        .query({ access_token: adminSession.token })
        .expect(404)
    })
  })
})
