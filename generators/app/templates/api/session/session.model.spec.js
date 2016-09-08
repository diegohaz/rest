import Promise from 'bluebird'
import moment from 'moment'
import tk from 'timekeeper'
import '../../'
import User from '../user/user.model'
import Session from './session.model'

describe('Session Model', function () {
  let session

  beforeEach(function () {
    return User
      .create({ email: 'a@a.com'<% if (emailSignup) { %>, password: '123456'<% } %> })
      .then((user) => Session.create({ user }))
      .then((s) => { session = s })
  })

  afterEach(function () {
    tk.reset()
    return Promise.each([User, Session], (model) => model.remove())
  })

  it('should return a view', function () {
    const view = session.view(true)
    expect(view).to.have.property('user')
    expect(view).to.have.property('token')
  })

  it('should set expiration date automatically', function () {
    const nextMonth = moment().add(1, 'month')
    const diff = nextMonth.diff(moment(session.expiresAt))
    expect(diff).to.be.within(0, 30)
  })

  it('should update expiration time', function () {
    return session.save().delay(50).then((session) => {
      return session.save()
    }).then((session) => {
      const nextMonth = moment().add(1, 'month')
      const diff = nextMonth.diff(moment(session.expiresAt))
      expect(diff).to.be.within(0, 30)
    })
  })

  it('should expire after 1 month', function () {
    const nextMonth = moment().add(1, 'month')
    tk.freeze(nextMonth.toDate())
    expect(session.expired()).to.be.true
  })

  it('should not expire until 1 month later', function () {
    const almostNextMonth = moment().add(1, 'month').subtract(1, 'second')
    tk.freeze(almostNextMonth.toDate())
    expect(session.expired()).to.be.false
  })

  it('should not login with invalid token', function () {
    return expect(Session.login('wrong token')).to.be.rejected
  })

  it('should not login with expired token', function () {
    const nextMonth = moment().add(1, 'month')
    tk.freeze(nextMonth.toDate())
    return expect(Session.login(session.token)).to.be.rejected
  })

  it('should login', function () {
    return expect(Session.login(session.token)).to.be.fulfilled
  })
})
