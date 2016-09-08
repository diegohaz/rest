import Promise from 'bluebird'
import '../../'
import User from '../user/user.model'
import PasswordReset from './password-reset.model'

describe('PasswordReset Model', function () {
  let passwordReset

  beforeEach(function () {
    return User.create({ email: 'a@a.com', password: '123456' })
      .then((user) => PasswordReset.create({ user }))
      .then((reset) => {
        passwordReset = reset
        return null
      })
  })

  afterEach(function () {
    return Promise.each([User, PasswordReset], (model) => model.remove())
  })

  it('should return a view', function () {
    const view = passwordReset.view()
    expect(view).to.have.property('user')
    expect(view).to.have.property('token')
  })
})
