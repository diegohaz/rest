import Promise from 'bluebird'
import crypto from 'crypto'
import '../../'
import User from './user.model'
import Session from '../session/session.model'

describe('User Model', function () {
  let user

  beforeEach(function () {
    return User
      .create({ name: 'Fake User', email: 'a@a.com'<% if (emailSignup) { %>, password: '123456'<% } %> })
      .then((u) => { user = u })
  })

  afterEach(function () {
    return Promise.each([User, Session], (model) => model.remove())
  })

  it('should return full view', function () {
    expect(user.view(true)).to.include.keys('email', 'createdAt')
  })

  it('should set name automatically', function () {
    user.name = ''
    user.email = 'test@test.com'
    expect(user).to.have.property('name', 'test')
  })

  it('should set picture url automatically', function () {
    const hash = crypto.createHash('md5').update(user.email).digest('hex')
    expect(user).to.have.property('picture', `https://gravatar.com/avatar/${hash}?d=identicon`)
  })

  it('should not set a new picture url when the old one is not gravatar', function () {
    user.picture = 'test.jpg'
    user.email = 'test@test.com'
    return user.save().then((user) => {
      expect(user).to.have.property('picture', 'test.jpg')
    })
  })

  it('should set a new picture when the old one is gravatar', function () {
    user.email = 'test@test.com'
    return user.save().then((user) => {
      const hash = crypto.createHash('md5').update('test@test.com').digest('hex')
      expect(user).to.have.property('picture', `https://gravatar.com/avatar/${hash}?d=identicon`)
    })
  })

  it('should remove user sessions after removing user', function () {
    Session.create({ user }).then((session) => {
      return expect(Session.find({ user })).to.eventually.have.lengthOf(1)
    }).then(() => {
      return user.remove()
    }).then(() => {
      return expect(Session.find({})).to.eventually.have.lengthOf(0)
    })
  })

<%_ if (emailSignup) {_%>
  describe('authenticate', function () {
    it('should authenticate user when password is valid', function () {
      return expect(user.authenticate('123456')).to.eventually.not.be.false
    })

    it('should not authenticate user when password is invalid', function () {
      return expect(user.authenticate('blah')).to.eventually.be.false
    })
  })

<%_ } _%>
<%_ if (facebookLogin) { _%>
  describe('createFromFacebook', function () {
    let fbUser

    beforeEach(function () {
      fbUser = {
        id: '123',
        name: 'Test Name',
        email: 'test@test.com',
        picture: { data: { url: 'test.jpg' } }
      }
    })

    it('should create a new user from facebook', function () {
      return User.createFromFacebook(fbUser).then((user) => {
        expect(user).to.have.deep.property('facebook.id', fbUser.id)
        expect(user).to.have.property('name', fbUser.name)
        expect(user).to.have.property('email', fbUser.email)
        expect(user).to.have.property('picture', fbUser.picture.data.url)
      })
    })

    it('should retrieve and update a user from facebook', function () {
      return User.createFromFacebook({ ...fbUser, email: 'a@a.com' }).then((user) => {
        expect(user).to.have.deep.property('facebook.id', fbUser.id)
        expect(user).to.have.property('name', fbUser.name)
        expect(user).to.have.property('email', 'a@a.com')
        expect(user).to.have.property('picture', fbUser.picture.data.url)
      })
    })
  })
<%_ } _%>
})
